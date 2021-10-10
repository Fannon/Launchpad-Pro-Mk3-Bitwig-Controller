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
    ext.tracks.sceneBank().setIndication(true);

    // ext.tracks.scrollPosition().markInterested();
    // println("Scroll Position: " + ext.tracks.scrollPosition().get());

    for (let trackNumber = 0; trackNumber < this.numTracks; trackNumber++) {
      const track = ext.tracks.getItemAt(trackNumber);

      // Mark information that we need as "interested"
      track.exists().markInterested();
      track.color().markInterested();
      track.arm().markInterested();

      println(`Track [${trackNumber}] Color  : ${track.color().get()}`);

      // Track Colors
      track.color().addValueObserver((r, g, b) => {
        const colorNote = LpColors.bitwigRgbToNote(r, g, b);
        println(` T-[${trackNumber}]: Color: ${colorNote}`);
        const button = ext.controls.getButton("track" + trackNumber);
        button.color = colorNote;
        button.draw();
      });

      // Track Arm Status
      track.arm().addValueObserver((isArmed) => {
        println(` T-[${trackNumber}]: isArmed: ${isArmed}`);
        const button = ext.controls.getButton("track" + trackNumber);
        if (isArmed) {
          button.mode = "pulse";
        } else {
          button.mode = "solid";
        }
        button.draw();
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
            ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
              color: 32,
            });
          } else {
            ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
              color: 0,
            });
          }
        });

        clip.color().addValueObserver((r, g, b) => {
          const colorNote = LpColors.bitwigRgbToNote(r, g, b);
          println(` C-[${trackNumber}, ${sceneNumber}]: Color: ${colorNote}`);
          ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
            color: colorNote,
          });
        });

        clip.isPlaying().addValueObserver((isPlaying) => {
          println(
            ` C-[${trackNumber}, ${sceneNumber}]: isPlaying: ${isPlaying}`
          );
          if (isPlaying) {
            ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
              mode: "pulse",
            });
          } else {
            ext.grid.updateCellBySessionCoords(trackNumber, sceneNumber, {
              mode: "solid",
            });
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
