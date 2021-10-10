class LpTransportLayout {
  public init() {
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
  }
}
