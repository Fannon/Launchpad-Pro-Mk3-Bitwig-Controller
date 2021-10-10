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
  },
  record: {
    note: 10,
    defaultColor: 5,
    mode: "pulse",
  },
};

function drawControlButton(
  out: API.MidiOut,
  controlButton: ControlButton
): void {
  println(`Draw Control Button: ${controlButton.note}, ${controlButton.color}`);
  if (controlButton.mode === "flash") {
    out.sendMidi(177, controlButton.note, controlButton.color || 0);
  } else if (controlButton.mode === "pulse") {
    out.sendMidi(178, controlButton.note, controlButton.color || 0);
  } else {
    out.sendMidi(176, controlButton.note, controlButton.color || 0); // Solid
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
  drawControlButton(ext.midiOut, controlButton);
  return !!controlButton.color;
}
