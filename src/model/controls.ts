interface ControlButton {
  note: Note;
  color: Color;
  mode: DisplayMode;
}
interface ControlButtons {
  [controlName: string]: ControlButton;
}

const controlButtons: ControlButtons = {
  play: {
    note: 20,
    color: 0,
    mode: "solid",
  },
};

function drawControlButton(
  out: API.MidiOut,
  controlButton: ControlButton
): void {
  println(`Draw Control Button: ${controlButton.note}, ${controlButton.color}`);
  if (controlButton.mode === "flash") {
    out.sendMidi(145, controlButton.note, controlButton.color);
  } else if (controlButton.mode === "pulse") {
    out.sendMidi(146, controlButton.note, controlButton.color);
  } else {
    out.sendMidi(176, controlButton.note, controlButton.color); // Solid
  }
}
