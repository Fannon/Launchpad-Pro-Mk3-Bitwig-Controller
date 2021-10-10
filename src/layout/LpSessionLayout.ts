/**
 * Manages a Launchpad Session Layout
 */
class LpSessionLayout {
  private numTracks = 8;
  private numScenes = 8;

  /**
   * Initializes the Session Layout
   * Creates track bank and necessary observers for tracks, slot banks and slots
   */
  public init() {
    // INITIALIZE BITWIG TRACKS & SCENES
    ext.tracks = host.createMainTrackBank(this.numTracks, 0, this.numScenes);
    ext.sceneBank = ext.tracks.sceneBank();

    // Indiate current track bank selection
    ext.sceneBank.setIndication(true);

    // For each track: Subscribe / mark interested information
    for (let trackNumber = 0; trackNumber < this.numTracks; trackNumber++) {
      const track = ext.tracks.getItemAt(trackNumber);

      // Mark information that we need as "interested"
      track.exists().markInterested();
      track.color().markInterested();
      track.arm().markInterested();
      track.mute().markInterested();

      // Track Colors
      track.color().addValueObserver((r, g, b) => {
        const colorNote = LpColors.bitwigRgbToNote(r, g, b);
        println(` T-[${trackNumber}]: Color: ${colorNote}`);
        const button = ext.controls.getButton("track" + trackNumber);
        button.color(colorNote).draw();
        const altButton = ext.controls.getButton("track" + trackNumber + "Alt");

        if (track.mute().get()) {
          altButton.color(1).pulse().draw();
        } else {
          altButton.color(colorNote).draw();
        }
      });

      // Track Arm Status
      track.arm().addValueObserver((isArmed) => {
        println(` T-[${trackNumber}]: isArmed: ${isArmed}`);
        const button = ext.controls.getButton("track" + trackNumber);
        if (isArmed) {
          button.pulse().draw();
        } else {
          button.solid().draw();
        }
      });

      track.mute().addValueObserver((isMuted) => {
        println(` T-[${trackNumber}]: isMuted: ${isMuted}`);
        const altButton = ext.controls.getButton("track" + trackNumber + "Alt");
        if (isMuted) {
          altButton.color(1).pulse().draw();
        } else {
          altButton.solid().draw();
        }
      });

      let slotBank = track.clipLauncherSlotBank();
      for (let sceneNumber = 0; sceneNumber < this.numScenes; sceneNumber++) {
        const clip = slotBank.getItemAt(sceneNumber);
        clip.isPlaying().markInterested();

        clip.hasContent().addValueObserver((hasContent) => {
          println(
            ` C-[${trackNumber}, ${sceneNumber}]: Content: ${hasContent}`
          );
          if (hasContent) {
            ext.grid
              .getCellBySessionCoords(trackNumber, sceneNumber)
              .color(config.defaultButtonColor);
          } else {
            ext.grid.getCellBySessionCoords(trackNumber, sceneNumber).off();
          }
        });

        clip.color().addValueObserver((r, g, b) => {
          const colorNote = LpColors.bitwigRgbToNote(r, g, b);
          println(` C-[${trackNumber}, ${sceneNumber}]: Color: ${colorNote}`);
          ext.grid
            .getCellBySessionCoords(trackNumber, sceneNumber)
            .color(colorNote);
        });

        clip.isPlaying().addValueObserver((isPlaying) => {
          println(
            ` C-[${trackNumber}, ${sceneNumber}]: isPlaying: ${isPlaying}`
          );
          if (isPlaying) {
            ext.grid.getCellBySessionCoords(trackNumber, sceneNumber).pulse();
          } else {
            ext.grid.getCellBySessionCoords(trackNumber, sceneNumber).solid();
          }
        });

        // TODO: Not sure how to make this useful
        clip.isSelected().addValueObserver((isSelected) => {
          println(
            ` C-[${trackNumber}, ${sceneNumber}]: isSelected: ${isSelected}`
          );
        });
      }
    }

    // For each scene: Subscribe / mark interested information
    for (let sceneNumber = 0; sceneNumber < this.numScenes; sceneNumber++) {
      const scene = ext.sceneBank.getItemAt(sceneNumber);

      // Scene Selection
      scene.addIsSelectedInEditorObserver((isSelected) => {
        const button = ext.controls.getButton("scene" + sceneNumber);
        if (isSelected) {
          button.pulse().on();
        } else {
          button.solid().off();
        }
        button.draw();
      });

      // Scene Color
      scene.color().addValueObserver((r, g, b) => {
        const button = ext.controls.getButton("scene" + sceneNumber);
        const colorNote = LpColors.bitwigRgbToNote(r, g, b);
        println(` S-[${sceneNumber}]: Color: ${colorNote}`);
        button.color(colorNote).draw();
      });
    }
  }

  public launchClip(trackIndex: number, slotIndex: number) {
    println(`Launch Clip: Track #${trackIndex} -> Slot #${slotIndex}`);
    let track = ext.tracks.getItemAt(trackIndex);
    let clip = track.clipLauncherSlotBank().getItemAt(slotIndex);
    // Check if clip has content. If it does, launch it. If it doesn't, stop the track.
    if (clip.hasContent().get()) {
      clip.launch();
    } else {
      track.stop();
    }
  }
}
