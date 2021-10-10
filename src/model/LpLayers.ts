type LpMode = "standalone" | "daw";
enum LpLayout { // 0-19
  "Session",
  "Fader",
  "Chord",
  "Custom Mode",
  "Note / Drum",
  "Scale Settings",
  "Sequencer Settings",
  "Sequencer Steps",
  "Sequencer Velocity",
  "Sequencer Pattern Settings",
  "Sequencer Probability",
  "Sequencer Mutation",
  "Sequencer Micro Step",
  "Sequencer Projects",
  "Sequencer Patterns",
  "Sequencer Tempo",
  "Sequencer Swing",
  "Programmer Mode",
  "Settings Menu",
  "Custom mode Settings",
}
type LpPage = number; // 0-7

/**
 * Manages the Launchpad Modes
 */
class LpLayers {
  public mode: LpMode = "standalone";
  public layout: LpLayout = LpLayout.Session;

  public page: LpPage = 0;

  public setDawMode() {
    println("-> Enter DAW Mode");
    ext.midiOut.sendSysex(`${sysexPrefix} 10 01 F7`);
    ext.midiOut.sendSysex(`${sysexPrefix} 00 00 00 00 F7`);
    this.mode = "daw";
  }

  public setStandaloneMode() {
    println("-> Enter Standalone Mode");
    ext.midiOut.sendSysex(`${sysexPrefix} 10 00 F7`);
    this.mode = "standalone";
  }
}
