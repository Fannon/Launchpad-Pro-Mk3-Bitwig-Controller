type Note = number;
type Color = number;
type DisplayMode = "solid" | "pulse" | "flash";
type GridData = LpGridCell[][];

interface Position {
  x: number;
  y: number;
}
interface CellData {
  note: Note;
  currentColor: Color;
  mode: DisplayMode;
}

class LpGridCell implements Position, CellData {
  public x: number;
  public y: number;
  public note: Note;
  public currentColor: Color;
  public mode: DisplayMode;
  public enabled: boolean;
  private previousColor: Color;

  public constructor(
    x: number,
    y: number,
    note: Note,
    color: Color = 0,
    mode: DisplayMode = "solid"
  ) {
    this.x = x;
    this.y = y;
    this.note = note;
    this.currentColor = color;
    this.previousColor = color;
    this.mode = mode;
    this.enabled = !!color;
  }

  public isOn(): boolean {
    return this.enabled;
  }

  public on(): LpGridCell {
    this.enabled = true;
    return this;
  }

  public off(): LpGridCell {
    this.enabled = false;
    return this;
  }

  /**
   * Set color and enable (on()) the cell
   */
  public color(color: Color): LpGridCell {
    if (color) {
      this.enabled = true;
    }
    this.previousColor = this.currentColor;
    this.currentColor = color;
    return this;
  }

  public solid(): LpGridCell {
    this.mode = "solid";
    return this;
  }
  public pulse(): LpGridCell {
    this.mode = "pulse";
    return this;
  }
  public flash(): LpGridCell {
    this.mode = "flash";
    return this;
  }

  /**
   * Highlight the note with a highlight color for a short amount of time
   * Then return to the current color / state
   */
  public highlight(highlightColor: Color = config.highlightColor): LpGridCell {
    this.previousColor = this.currentColor;
    this.color(highlightColor).draw();
    host.scheduleTask(() => {
      this.color(this.previousColor).draw();
    }, config.triggerHighlightMs);
    return this;
  }

  public draw(): LpGridCell {
    if (this.enabled === false) {
      ext.midiOut.sendMidi(145, this.note, 0);
    } else if (this.mode === "solid") {
      ext.midiOut.sendMidi(144, this.note, this.currentColor);
    } else if (this.mode === "flash") {
      ext.midiOut.sendMidi(145, this.note, this.currentColor);
    } else if (this.mode === "pulse") {
      ext.midiOut.sendMidi(146, this.note, this.currentColor);
    }
    return this;
  }
}

/**
 * Launchpad Note Grid (8x8 matrix)
 */
class LpNoteGrid {
  public cells: GridData;

  public constructor() {
    this.cells = this.createData();
  }

  /**
   * Crates the grid data structure
   */
  public createData(): GridData {
    println(`Grid.createData()`);
    const gridData: GridData = [];
    for (let x = 0; x < 8; x++) {
      gridData[x] = [];
      for (let y = 0; y < 8; y++) {
        gridData[x][y] = new LpGridCell(x, y, LpNoteGrid.positionToNote(x, y));
      }
    }
    return gridData;
  }

  public getCell(x: number, y: number): LpGridCell {
    return this.cells[x][y];
  }

  public getCellBySessionCoords(
    trackNumber: number,
    sceneNumber: number
  ): LpGridCell {
    const x = trackNumber;
    const y = 7 - sceneNumber;
    return this.cells[x][y];
  }

  /**
   * Draws the whole grid to the launchpad
   */
  public draw(): void {
    println(`Grid.draw()`);
    for (const row of this.cells) {
      for (const cell of row) {
        cell.draw();
      }
    }
  }

  /**
   * Resets all cells to defaults and turns them off
   */
  public reset(): void {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.solid().off();
      }
    }
  }

  /**
   * Playground: Fill grid with all available colors
   */
  public colorize(startPoint = 0): void {
    let color = startPoint;
    for (const row of this.cells) {
      for (const cell of row) {
        cell.color(color);
        color++;
      }
    }
  }

  /**
   * Convert grid position (x, y) to launchpad note
   */
  public static positionToNote(x: number, y: number): Note {
    return (y + 1) * 10 + (x + 1);
  }

  /**
   * Convert launchpad note to grid position (x, y)
   */
  public static noteToPosition(note: Note): Position {
    return {
      x: (note % 10) - 1,
      y: Math.floor(note / 10) - 1,
    };
  }

  /**
   * Convert launchpad note to grid position (x, y)
   */
  public static noteToSessionCoord(note: Note): Position {
    return {
      x: (note % 10) - 1,
      y: 7 - (Math.floor(note / 10) - 1),
    };
  }
}
