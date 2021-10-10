//////////////////////////////////////////
// SETUP BITWIG API                     //
//////////////////////////////////////////

loadAPI(14);
host.setShouldFailOnDeprecatedUse(true);

// Load all script files
host.load("util/color.js");
host.load("model/config.js");
host.load("model/LpLayers.js");
host.load("model/LpControls.js");
host.load("model/LpNoteGrid.js");

println(JSON.stringify(colorMap, null, 2));

//////////////////////////////////////////
// CONFIG AND GLOBAL SCOPE              //
//////////////////////////////////////////

const sysexPrefix = "F0 00 20 29 02 0E";
// @ts-expect-error
const ext: {
  // Bitwig API
  midiIn: API.MidiIn;
  midiOut: API.MidiOut;
  transport: API.Transport;
  tracks: API.TrackBank;
  // Launchpad Controller
  layers: LpLayers;
  controls: LpControls;
  grid: LpNoteGrid;
} = {
  layers: new LpLayers(),
  controls: new LpControls(),
  grid: new LpNoteGrid(),
};

//////////////////////////////////////////
// CONTROLLER CONFIG                    //
//////////////////////////////////////////

host.defineController(
  "Novation",
  "Launchpad Pro Mk3 (TS)",
  "0.1",
  "63ea9a43-4fc1-4ee9-9606-5e310b8de2a9",
  "Fannon (TS)"
);

host.defineMidiPorts(1, 1);

host.addDeviceNameBasedDiscoveryPair(
  ["MIDIIN3 (LLProMK3 MIDI)"],
  ["MIDIOUT3 (LLProMK3 MIDI)"]
);
// Idea: Use MIDI device ID to detect ?

//////////////////////////////////////////
// LIFECYCLE FUNCTIONS                  //
//////////////////////////////////////////

function init() {
  println("");
  println("");
  println("--- [INIT] --------------------------------------------");

  host.println("TsPlayground initialized.");
  host.showPopupNotification("TS Playground initialized!");

  ext.midiIn = host.getMidiInPort(0);
  ext.midiOut = host.getMidiOutPort(0);

  // REGISTER IN & OUT CALLBACKS
  ext.midiIn.setMidiCallback(onDawMidi);
  ext.midiIn.setSysexCallback(onDawSysex);

  // ENTER DAW MODE
  ext.layers.setDawMode();

  // INITIALIZE NOTE GRID
  // colorGrid(ext.grid, 0);
  // colorGrid(ext.grid, 64);
  ext.grid.draw();

  // INITIALIZE BITWIG TRANSPORT
  ext.transport = host.createTransport();

  ext.transport.isPlaying().addValueObserver((isPlaying) => {
    println(` >>>: isPlaying: ${isPlaying}`);
    if (isPlaying) {
      ext.controls.buttons.play.on();
    } else {
      ext.controls.buttons.play.off();
    }
    ext.controls.buttons.play.draw();
  });
  ext.transport.isArrangerRecordEnabled().addValueObserver((isRecording) => {
    println(` >>>: isRecording: ${isRecording}`);
    if (isRecording) {
      ext.controls.buttons.record.on();
    } else {
      ext.controls.buttons.record.off();
    }
    ext.controls.buttons.record.draw();
  });

  // INITIALIZE BITWIG TRACKS & SCENES
  const numTracks = 8;
  const numScenes = 8;
  ext.tracks = host.createMainTrackBank(numTracks, 0, numScenes);
  ext.tracks.sceneBank().setIndication(true);

  // ext.tracks.scrollPosition().markInterested();
  // println("Scroll Position: " + ext.tracks.scrollPosition().get());

  for (let trackNumber = 0; trackNumber < numTracks; trackNumber++) {
    const track = ext.tracks.getItemAt(trackNumber);

    // Mark information that we need as "interested"
    track.exists().markInterested();
    track.color().markInterested();
    track.arm().markInterested();

    println(`Track [${trackNumber}] Color  : ${track.color().get()}`);

    // Track Colors
    track.color().addValueObserver((r, g, b) => {
      const colorNote = bitwigRgbToNote(r, g, b);
      println(` T-[${trackNumber}]: Color: ${colorNote}`);
      const button = ext.controls.getButton("track" + trackNumber);
      button.color = colorNote;
      button.draw();
    });

    // Track Arm Status
    track.arm().addValueObserver((isArmed) => {
      println(` T-[${trackNumber}]: isArmed: ${isArmed}`);
      const button = ext.controls.getButton("track" + trackNumber);
      if (isArmed) {
        button.mode = "pulse";
      } else {
        button.mode = "solid";
      }
      button.draw();
    });

    let slotBank = track.clipLauncherSlotBank();
    for (let sceneNumber = 0; sceneNumber < numScenes; sceneNumber++) {
      const clip = slotBank.getItemAt(sceneNumber);
      clip.isPlaying().markInterested();

      clip.hasContent().addValueObserver((hasContent) => {
        println(` C-[${trackNumber}, ${sceneNumber}]: Content: ${hasContent}`);
        if (hasContent) {
          ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
            color: 32,
          });
        } else {
          ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
            color: 0,
          });
        }
      });

      clip.color().addValueObserver((r, g, b) => {
        const colorNote = bitwigRgbToNote(r, g, b);
        println(` C-[${trackNumber}, ${sceneNumber}]: Color: ${colorNote}`);
        ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
          color: colorNote,
        });
      });

      clip.isPlaying().addValueObserver((isPlaying) => {
        println(` C-[${trackNumber}, ${sceneNumber}]: isPlaying: ${isPlaying}`);
        if (isPlaying) {
          ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
            mode: "pulse",
          });
        } else {
          ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
            mode: "solid",
          });
        }
      });

      // TODO: Not sure how to make this useful
      clip.isSelected().addValueObserver((isSelected) => {
        println(
          ` C-[${trackNumber}, ${sceneNumber}]: isSelected: ${isSelected}`
        );
      });
    }
  }
}

function flush() {
  host.println("flush()");
  if (ext.layers.layout === LpLayout.Session) {
    ext.grid.draw();
  }
}

function exit() {
  ext.layers.setStandaloneMode();
}

//////////////////////////////////////////
// FUNCTIONS                            //
//////////////////////////////////////////

function onDawMidi(status: number, data1: number, data2: number) {
  println(`DAW MIDI IN: ${status}: ${data1}, ${data2}`);

  // Only register "keydown" above a certain threshold
  if (data2 > config.triggerThreshold) {
    // Handle LP control buttons
    if (status === 176) {
      println(`Control Button: ${data1}`);

      switch (data1) {
        // PLAY
        case ext.controls.buttons.play.note:
          if (ext.transport.isPlaying().getAsBoolean()) {
            ext.transport.stop();
          } else {
            ext.transport.play();
          }
          break;

        // RECORD
        case ext.controls.buttons.record.note:
          if (ext.transport.isArrangerRecordEnabled().getAsBoolean()) {
            ext.transport.stop();
          } else {
            ext.transport.record();
          }
          break;

        // TRACK SELECTION
        case ext.controls.buttons.track0.note:
        case ext.controls.buttons.track1.note:
        case ext.controls.buttons.track2.note:
        case ext.controls.buttons.track3.note:
        case ext.controls.buttons.track4.note:
        case ext.controls.buttons.track5.note:
        case ext.controls.buttons.track6.note:
        case ext.controls.buttons.track7.note:
          const trackSelected = data1 - 101;
          println(` T-[${trackSelected}]: Select and arm`);
          for (let trackNumber = 0; trackNumber < 8; trackNumber++) {
            const track = ext.tracks.getItemAt(trackNumber);
            if (trackNumber === trackSelected) {
              track.selectInEditor();
              track.arm().set(true);
            } else {
              track.arm().set(false);
            }
          }
          break;

        // FALLBACK
        default:
          host.errorln(`Unsupported Control: ${data1}`);
      }
    }

    // Handle grid note buttons
    if (status === 144) {
      const pos = LpNoteGrid.noteToPosition(data1);
      toggleClip(pos.x, 7 - pos.y);
    }
  }
}

function onDawSysex(data: string) {
  host.println("DAW Sysex IN: " + data);

  // Catch layout and page changes
  if (data.startsWith("f0002029020e00")) {
    data = data.replace("f0002029020e00", "");
    ext.layers.layout = parseInt(`${data[0]}${data[1]}`, 16);
    ext.layers.page = parseInt(`${data[2]}${data[3]}`, 16);
  }
}

//////////////////////////////////////////
// SESSION VIEW FUNCTIONS               //
//////////////////////////////////////////

function toggleClip(trackIndex: number, slotIndex: number) {
  println(`Toggle Clip: Track #${trackIndex} -> Slot #${slotIndex}`);
  let track = ext.tracks.getItemAt(trackIndex);
  let clip = track.clipLauncherSlotBank().getItemAt(slotIndex);
  // Check if clip has content. If it does, launch it. If it doesn't, stop the track.
  if (clip.hasContent().get()) {
    if (clip.isPlaying().get()) {
      clip.select();
    } else {
      clip.launch();
    }
  }
}

function launchClip(trackIndex: number, slotIndex: number) {
  println(`Launch Clip: Track #${trackIndex} -> Slot #${slotIndex}`);
  let track = ext.tracks.getItemAt(trackIndex);
  let clip = track.clipLauncherSlotBank().getItemAt(slotIndex);
  // Check if clip has content. If it does, launch it. If it doesn't, stop the track.
  if (clip.hasContent().get()) {
    clip.launch();
  } else {
    if (track.arm().get()) {
      clip.launch();
    } else {
      track.stop();
    }
  }
}

//////////////////////////////////////////
//                                      //
//////////////////////////////////////////
