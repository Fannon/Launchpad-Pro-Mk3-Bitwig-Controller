function printMidi(statusByte: number, data1: number, data2: number) {
  println(
    "MIDI: " +
      statusByte +
      ", " +
      data1 +
      ", " +
      data2 +
      " [" +
      uint8ToHex(statusByte) +
      uint7ToHex(data1) +
      uint7ToHex(data2) +
      "]"
  );
}

/** Convert an unsigned 7-bit value (MIDI-style) to a signed value (twos-complement) **/
function uint7ToInt7(x: number): number {
  if (x >= 64) {
    return x - 128;
  }
  return x;
}

function uint7ToHex(x: number): string {
  var upper = (x >> 4) & 0x7;
  var lower = x & 0xf;

  return upper.toString(16) + lower.toString(16) + " ";
}

function uint8ToHex(x: number): string {
  var upper = (x >> 4) & 0xf;
  var lower = x & 0xf;

  return upper.toString(16) + lower.toString(16) + " ";
}

// /* Utility functions for reading MIDI message data. */

// // Message types

// function isNoteOff(status: number, data2: number) {
//   return (status & 0xf0) == 0x80 || ((status & 0xf0) == 0x90 && data2 == 0);
// }
// function isNoteOn(status: number) {
//   return (status & 0xf0) == 0x90;
// }
// function isKeyPressure(status) { return (status & 0xF0) == 0xA0; }
// function isChannelController(status) { return (status & 0xF0) == 0xB0; }
// function isProgramChange(status) { return (status & 0xF0) == 0xC0; }
// function isChannelPressure(status) { return (status & 0xF0) == 0xD0; }
// function isPitchBend(status) { return (status & 0xF0) == 0xE0; }
// function isMTCQuarterFrame(status) { return (status == 0xF1); }
// function isSongPositionPointer(status) { return (status == 0xF2); }
// function isSongSelect(status) { return (status == 0xF3); }
// function isTuneRequest(status) { return (status == 0xF6); }
// function isTimingClock(status) { return (status == 0xF8); }
// function isMIDIStart(status) { return (status == 0xFA); }
// function isMIDIContinue(status) { return (status == 0xFB); }
// function isMIDIStop(status){ return (status == 0xFC); }
// function isActiveSensing(status) { return (status == 0xFE); }
// function isSystemReset(status) { return (status == 0xFF); }

// // Message data

// function MIDIChannel(status)
// {
//    return status & 0xF;
// }

// function pitchBendValue(data1, data2)
// {
//    return (data2 << 7) | data1;
// }

// /* Utility functions for sending MIDI data to the default port (0) */

// /**
//  * Send a short midi-message to midi out port 0 of the control surface.
//  * @param {String} data
//  */
// function sendMidi(status, data1, data2)
// {
//    host.getMidiOutPort(0).sendMidi(status, data1, data2);
// }

// /**
// * Send a SystemExclusive midi-message to midi out port 0 of the control surface.
//    * @param {String} data
// */
// function sendSysex(data)
// {
//    host.getMidiOutPort(0).sendSysex(data);
// }

// function sendNoteOn(channel, key, velocity)
// {
//    host.getMidiOutPort(0).sendMidi(0x90 | channel, key, velocity);
// }

// function sendNoteOff(channel, key, velocity)
// {
//    host.getMidiOutPort(0).sendMidi(0x80 | channel, key, velocity);
// }

// function sendKeyPressure(channel, key, pressure)
// {
//    host.getMidiOutPort(0).sendMidi(0xA0 | channel, key, pressure);
// }

// function sendChannelController(channel, controller, value)
// {
//    host.getMidiOutPort(0).sendMidi(0xB0 | channel, controller, value);
// }

// function sendProgramChange(channel, program)
// {
//    host.getMidiOutPort(0).sendMidi(0xC0 | channel, program, 0);
// }

// function sendChannelPressure(channel, pressure)
// {
//    host.getMidiOutPort(0).sendMidi(0xD0 | channel, pressure, 0);
// }

// function sendPitchBend(channel, value)
// {
//    host.getMidiOutPort(0).sendMidi(0xE0 | channel, value & 0x7F, (value >> 7) & 0x7F);
// }
