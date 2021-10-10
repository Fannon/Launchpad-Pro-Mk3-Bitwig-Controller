/**
 * Represents a Launchpad Control Button
 */
class LpControlButton {
  /**
   * Collection of default values
   */
  public static defaults = {
    buttonColor: 32,
  };

  public note: Note;
  public color: Color = 0;
  public defaultColor: Color;
  public mode: DisplayMode = "solid";

  constructor(
    note: Note,
    defaultColor = LpControlButton.defaults.buttonColor,
    mode: DisplayMode = "solid"
  ) {
    this.note = note;
    this.defaultColor = defaultColor;
    this.mode = mode;
  }

  public on(
    color: Color = this.defaultColor || LpControlButton.defaults.buttonColor
  ) {
    this.color = color;
  }
  public off() {
    this.color = 0;
  }

  public toggle(
    color: Color = this.defaultColor || LpControlButton.defaults.buttonColor
  ): boolean {
    if (!this.color) {
      this.on(color);
      return true;
    } else {
      this.off();
      return false;
    }
  }

  public isOn(): boolean {
    return this.color !== 0;
  }

  public draw() {
    println(`Draw Control Button: ${this.note}, ${this.color}`);
    if (this.mode === "flash") {
      ext.midiOut.sendMidi(177, this.note, this.color || 0);
    } else if (this.mode === "pulse") {
      ext.midiOut.sendMidi(178, this.note, this.color || 0);
    } else {
      ext.midiOut.sendMidi(176, this.note, this.color || 0); // Solid
    }
  }
}

/**
 * Represents the Launchpad Controls
 */
class LpControls {
  public buttons = {
    play: new LpControlButton(20, undefined, "pulse"),
    record: new LpControlButton(10, 5, "pulse"),
    track0: new LpControlButton(101),
    track1: new LpControlButton(102),
    track2: new LpControlButton(103),
    track3: new LpControlButton(104),
    track4: new LpControlButton(105),
    track5: new LpControlButton(106),
    track6: new LpControlButton(107),
    track7: new LpControlButton(108),
  };

  /**
   * Get a button by providing just a string
   * Useful for dynamic access (like tracks)
   */
  public getButton(buttonName: string): LpControlButton {
    // @ts-ignore
    return this.buttons[buttonName];
  }
}
