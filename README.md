# Launchpad Pro Mk3 Bitwig Controller

## Description

> 🚧 This is currently work in progress and potentially subject to many changes.

This is a Bitwig Controller for the Launchpad Pro MK3.

It aims to be a rather simple controller, that only relies on the Launchpad DAW mode.
As a benefit, it will keep all the built in functionality intact and it will work like described in the manual / in other DAWs.

If you need something more extensive, please consider [DrivenByMoss Bitwig Extension](https://github.com/git-moss/DrivenByMoss) as an alternative.

## Install

Right now there are no releases / builds, as this is pre-alpha.

If you want to try it out:

- Install [Node.js](https://nodejs.org/en/)
- Check out this repository via Git
- `npm install`
- `npm run build`
- Copy the contents from the `./dist` folder into your Bitwig "My Controller Scripts" location
  - Consider creating a subfolder for this, e.g. `Launchpad-Pro-Mk3-Bitwig-Controller`
  - If you actively develop / try around, creating a symlink can be more convenient

## Configure

- Go to Bitwig > Settings > Controllers
- Add Controller (DAW)
  - Hardware Vendor: `Novation`
  - Product: `Launchpad Pro MK3` (by Fannon)
  - Choose Input: `MIDIIN3 (LLProMK3 MIDI)` (the third launchpad midi device)
  - Choose Output: `MIDIOUT3 (LLProMK3 MIDI)` (the third launchpad midi device)
- Add Controller (regular MIDI input)
  - Now add a `Generic MIDI Keyboard` input for `LLProMK3 MIDI` (the first MIDI device)
  - This is used for the built in functionality of the launchpad

## Features

### Working

- Launchpad Pro Mk3 DAW Mode support
- Session Mode (the basics, only 8x8 grid at the moment)
  - Launch and stop Clips
  - Launch Sections
- Play / Stop / Record Transport
- Tap Tempo (Quantize Button)
- Mute / unmute tracks

### Known Bugs

- When switching projects, the controller might get inconsistent state
  - E.g. the pads might pulse / flicker / display a state that does not match the project
  - Press "Clear" Button to reset the controller

### Work in Progress

### To Do

- Allow to move clip launcher grid selection
- Clip Selection
- Clip Recording
- Proper tempo / BPM overlay
- Other overlays like track volume, device parameters, etc.

## Goals

- Use the Launchpad Pro Mk3 in Bitwig without loosing the built in functionality
- Only add what is not part of built in functionality
  - Session Mode
  - Transport / Track management (?)
  - BPM
- Use the Launchpad mostly like described in the manual
- Learn :)

## Alternatives

- https://github.com/git-moss/DrivenByMoss Bitwig Extension
  - DrivenByMoss can do much more than this extension
  - The design goals are quite different, though

## Credits

I took inspiration from:

- https://github.com/git-moss/DrivenByMoss
- https://github.com/Jengamon/Launchpad-X-Bitwig-Script
- https://github.com/Jengamon/Launchpad-Mini-MK3-Bitwig-Script
- https://github.com/Isti115/bitwig-launchpad
- https://intro.novationmusic.com

Special thanks to [Jürgen Mossgraber](http://www.mossgrabers.de/index.html) for:

- His [DrivenByMoss Bitwig Extension](https://github.com/git-moss/DrivenByMoss)
- The youtube videos explaining the extension and the bigwig controller API
