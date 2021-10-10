/**
 * Represents a Launchpad Control Button
 */
class LpControlButton {
  public note: Note;
  public previousColor: Color = 0;
  public currentColor: Color = 0;
  public defaultColor: Color;
  public mode: DisplayMode = "solid";

  constructor(
    note: Note,
    defaultColor = config.defaultButtonColor,
    mode: DisplayMode = "solid"
  ) {
    this.note = note;
    this.defaultColor = defaultColor;
    this.mode = mode;
  }

  public isOn(): boolean {
    return this.currentColor !== 0;
  }

  public on(
    color: Color = this.defaultColor || config.defaultButtonColor
  ): LpControlButton {
    this.currentColor = color;
    return this;
  }
  public off(): LpControlButton {
    this.previousColor = this.currentColor;
    this.currentColor = 0;
    return this;
  }

  public color(color: Color): LpControlButton {
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

  public reset(): LpControlButton {
    this.mode = "solid";
    this.currentColor = this.defaultColor;
    return this;
  }

  public draw(): LpControlButton {
    println(
      `Draw Control Button: ${this.note}: color=${this.currentColor}, mode=${this.mode}`
    );
    if (this.mode === "flash") {
      ext.midiOut.sendMidi(177, this.note, this.currentColor || 0);
    } else if (this.mode === "pulse") {
      ext.midiOut.sendMidi(178, this.note, this.currentColor || 0);
    } else {
      ext.midiOut.sendMidi(176, this.note, this.currentColor || 0); // Solid
    }
    return this;
  }

  // public drawWithHighlight(
  //   highlightColor: Color = LpControlButton.defaults.highlightColor
  // ): LpControlButton {
  //   this.previousColor = this.currentColor;
  //   this.color(highlightColor).draw();
  //   host.scheduleTask(() => {
  //     this.color(this.previousColor).draw();
  //   }, config.triggerHighlightMs);
  //   return this;
  // }
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
