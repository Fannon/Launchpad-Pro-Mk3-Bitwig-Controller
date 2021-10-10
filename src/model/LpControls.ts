/**
 * Represents a Launchpad Control Button
 */
class LpControlButton {
  public note: Note;
  public currentColor: Color;
  public previousColor: Color;
  public highlightColor: Color;
  public mode: DisplayMode = "solid";
  public enabled: boolean;

  constructor(
    note: Note,
    color = config.defaultButtonColor,
    mode: DisplayMode = "solid"
  ) {
    this.note = note;
    this.currentColor = color;
    this.previousColor = color;
    this.mode = mode;
    this.enabled = !!color;
    this.highlightColor = config.highlightColor;
  }

  public isOn(): boolean {
    return this.enabled;
  }

  public on(): LpControlButton {
    this.enabled = true;
    return this;
  }

  public off(): LpControlButton {
    this.enabled = false;
    return this;
  }

  /**
   * Set color and enable (on()) the cell
   */
  public color(color: Color): LpControlButton {
    if (color) {
      this.enabled = true;
    }
    this.previousColor = this.currentColor;
    this.currentColor = color;
    return this;
  }

  public solid(): LpControlButton {
    this.mode = "solid";
    return this;
  }
  public pulse(): LpControlButton {
    this.mode = "pulse";
    return this;
  }
  public flash(): LpControlButton {
    this.mode = "flash";
    return this;
  }

  public draw(): LpControlButton {
    println(
      `Draw Control Button: ${this.note}: color=${this.currentColor}, mode=${this.mode}`
    );
    if (this.enabled === false) {
      ext.midiOut.sendMidi(176, this.note, 0);
    } else if (this.mode === "solid") {
      ext.midiOut.sendMidi(176, this.note, this.currentColor);
    } else if (this.mode === "flash") {
      ext.midiOut.sendMidi(177, this.note, this.currentColor);
    } else if (this.mode === "pulse") {
      ext.midiOut.sendMidi(178, this.note, this.currentColor);
    } else if (this.mode === "highlight") {
      ext.midiOut.sendMidi(176, this.note, this.highlightColor);
    }
    return this;
  }
}

/**
 * Represents the Launchpad Controls
 */
class LpControls {
  public buttons = {
    // TRANSPORT
    play: new LpControlButton(20, undefined, "pulse"),
    record: new LpControlButton(10, 5, "pulse"),
    tempo: new LpControlButton(40, 51).on(),
    clear: new LpControlButton(60, 1).on(),

    // TRACKS
    track0: new LpControlButton(101),
    track0Alt: new LpControlButton(1),
    track1: new LpControlButton(102),
    track1Alt: new LpControlButton(2),
    track2: new LpControlButton(103),
    track2Alt: new LpControlButton(3),
    track3: new LpControlButton(104),
    track3Alt: new LpControlButton(4),
    track4: new LpControlButton(105),
    track4Alt: new LpControlButton(5),
    track5: new LpControlButton(106),
    track5Alt: new LpControlButton(6),
    track6: new LpControlButton(107),
    track6Alt: new LpControlButton(7),
    track7: new LpControlButton(108),
    track7Alt: new LpControlButton(8),

    // SCENES
    scene0: new LpControlButton(89),
    scene1: new LpControlButton(79),
    scene2: new LpControlButton(69),
    scene3: new LpControlButton(59),
    scene4: new LpControlButton(49),
    scene5: new LpControlButton(39),
    scene6: new LpControlButton(29),
    scene7: new LpControlButton(19),
  };

  /**
   * Get a button by providing just a string
   * Useful for dynamic access (like tracks)
   */
  public getButton(buttonName: string): LpControlButton {
    // @ts-ignore
    return this.buttons[buttonName];
  }

  /**
   * Draw all buttons according to current state
   *
   * Prefer calling draw() on individual buttons, though.
   */
  public draw() {
    for (const buttonName in this.buttons) {
      // @ts-ignore
      const button = this.buttons[buttonName];
      button.draw();
    }
  }
}
