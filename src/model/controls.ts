interface ControlButton {
  note: Note;
  color?: Color;
  defaultColor?: Color;
  mode?: DisplayMode;
}
interface ControlButtons {
  [controlName: string]: ControlButton;
}

const defaultControlButtonColor = 32;

const controlButtons: ControlButtons = {
  play: {
    note: 20,
    defaultColor: defaultControlButtonColor,
    mode: "pulse",
  },
  record: {
    note: 10,
    defaultColor: 5,
    mode: "pulse",
  },
  track0: {
    note: 101,
  },
  track1: {
    note: 102,
  },
  track2: {
    note: 103,
  },
  track3: {
    note: 104,
  },
  track4: {
    note: 105,
  },
  track5: {
    note: 106,
  },
  track6: {
    note: 107,
  },
  track7: {
    note: 108,
  },
};

function drawControlButton(controlButton: ControlButton): void {
  println(`Draw Control Button: ${controlButton.note}, ${controlButton.color}`);
  if (controlButton.mode === "flash") {
    ext.midiOut.sendMidi(177, controlButton.note, controlButton.color || 0);
  } else if (controlButton.mode === "pulse") {
    ext.midiOut.sendMidi(178, controlButton.note, controlButton.color || 0);
  } else {
    ext.midiOut.sendMidi(176, controlButton.note, controlButton.color || 0); // Solid
  }
}

function toggleControlButton(
  controlButton: ControlButton,
  color?: number
): boolean {
  println(`Control Button toggle: ${controlButton.note}`);
  if (controlButton.color) {
    controlButton.color = 0;
  } else {
    controlButton.color =
      color || controlButton.defaultColor || defaultControlButtonColor;
  }
  drawControlButton(controlButton);
  return !!controlButton.color;
}
