//////////////////////////////////////////
// SETUP BITWIG API                     //
//////////////////////////////////////////

loadAPI(14);
host.setShouldFailOnDeprecatedUse(true);

// Load all script files
host.load("config.js");
host.load("model/LpLayers.js");
host.load("model/LpControls.js");
host.load("model/LpNoteGrid.js");
host.load("model/LpColors.js");
host.load("layout/LpTransportLayout.js");
host.load("layout/LpSessionLayout.js");

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
  transportLayout: LpTransportLayout;
  sessionLayout: LpSessionLayout;
} = {
  layers: new LpLayers(),
  controls: new LpControls(),
  grid: new LpNoteGrid(),
  transportLayout: new LpTransportLayout(),
  sessionLayout: new LpSessionLayout(),
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
  println("--- [INIT START] --------------------------------------");

  host.println("Launchpad Mk3 Pro controller initialized.");

  ext.midiIn = host.getMidiInPort(0);
  ext.midiOut = host.getMidiOutPort(0);

  // REGISTER IN & OUT CALLBACKS
  ext.midiIn.setMidiCallback(onDawMidi);
  ext.midiIn.setSysexCallback(onDawSysex);

  // ENTER DAW MODE
  ext.layers.setDawMode();

  // INITIALIZE NOTE GRID
  ext.grid.draw();

  // INITIALIZE BITWIG TRANSPORT
  ext.transportLayout.init();

  // INITIALIZE SESSSION LAYOUT
  ext.sessionLayout.init();

  println("--- [INIT END] ----------------------------------------");
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
      const pos = LpNoteGrid.noteToSessionCoord(data1);
      ext.sessionLayout.launchClip(pos.x, pos.y);
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
