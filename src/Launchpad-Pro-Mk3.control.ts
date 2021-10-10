//////////////////////////////////////////
// SETUP BITWIG API                     //
//////////////////////////////////////////

loadAPI(14);
host.setShouldFailOnDeprecatedUse(true);

// Load all script files
host.load("model/config.js");
host.load("model/grid.js");
host.load("model/controls.js");

//////////////////////////////////////////
// CONFIG AND GLOBAL SCOPE              //
//////////////////////////////////////////

const sysexPrefix = "F0 00 20 29 02 0E";
// @ts-expect-error
const ext: {
  midiIn: API.MidiIn;
  midiOut: API.MidiOut;
  grid: Grid;
  transport: API.Transport;
  tracks: API.TrackBank;
  shift: boolean;
} = {
  shift: false,
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
  dawMode();

  // INITIALIZE NOTE GRID
  ext.grid = createGrid();
  // colorGrid(ext.grid, 0);
  drawGrid(ext.midiOut, ext.grid);

  // INITIALIZE BITWIG
  ext.transport = host.createTransport();

  //   ext.

  const numTracks = 8;
  const numScenes = 8;
  ext.tracks = host.createMainTrackBank(numTracks, 0, numScenes);
  ext.tracks.scrollPosition().markInterested();
  println("Scroll Position: " + ext.tracks.scrollPosition().get());
  ext.tracks.sceneBank().setIndication(true);
  for (let trackNumber = 0; trackNumber < numTracks; trackNumber++) {
    const track = ext.tracks.getItemAt(trackNumber);

    track
      .volume()
      .value()
      .addValueObserver(8, (volumeValue) => {
        println(`Volume Value: ${volumeValue}`);
      });

    // Mark information that we need as "interested"
    track.exists().markInterested();
    track.color().markInterested();
    track.arm().markInterested();
    let cb = track.clipLauncherSlotBank();
    for (let sceneNumber = 0; sceneNumber < numScenes; sceneNumber++) {
      cb.getItemAt(sceneNumber).hasContent().markInterested();
    }
    println(
      `Track #${trackNumber} Color  : ${track.color().get().getRed255()}`
    );
    println(`Track #${trackNumber} Exists : ${track.exists().get()}`);
    println(`Track #${trackNumber} Arm    : ${track.arm().get()}`);
  }

  launchClip(0, 0);
  launchClip(1, 1);

  //   const sceneBank = tracks.sceneBank();
  //   sceneBank.launch(0);
  //   sceneBank.setIndication(true);
  //   const scene = sceneBank.getScene(1);
}

function flush() {
  // TODO: Flush any output to your controller here.
  host.println("flush()");
}

function exit() {
  println("-> Exit to Standalone mode");
  ext.midiOut.sendSysex(`${sysexPrefix} 10 00 F7`);
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

      if (data1 === controlButtons.play.note) {
        const state = toggleControlButton(controlButtons.play);
        if (state) {
          ext.transport.play();
        } else {
          ext.transport.stop();
        }
      } else if (data1 === controlButtons.record.note) {
        const state = toggleControlButton(controlButtons.record);
        if (state) {
          ext.transport.record();
        } else {
          ext.transport.stop();
        }
      }
    }
  }
}

function onDawSysex(data: string) {
  host.println("DAW Sysex IN: " + data);
}

function dawMode() {
  println("-> Enter DAW Mode");
  ext.midiOut.sendSysex(`${sysexPrefix} 10 01 F7`);
  ext.midiOut.sendSysex(`${sysexPrefix} 00 00 00 00 F7`);
}

//////////////////////////////////////////
// SESSION VIEW FUNCTIONS               //
//////////////////////////////////////////

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
