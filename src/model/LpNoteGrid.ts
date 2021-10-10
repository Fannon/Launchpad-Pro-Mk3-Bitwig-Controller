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
  color: Color;
  mode: DisplayMode;
}

class LpGridCell implements Position, CellData {
  public x: number;
  public y: number;
  public note: Note;
  public color: Color;
  public mode: DisplayMode;

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
    this.color = color;
    this.mode = mode;
  }

  public draw() {
    if (this.mode === "flash") {
      ext.midiOut.sendMidi(145, this.note, this.color);
    } else if (this.mode === "pulse") {
      ext.midiOut.sendMidi(146, this.note, this.color);
    } else {
      ext.midiOut.sendMidi(144, this.note, this.color); // Solid
    }
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

  public updateCell(x: number, y: number, cell: Partial<CellData>): LpGridCell {
    for (const propertyName in cell) {
      // @ts-ignore
      this.cells[x][y][propertyName] = cell[propertyName];
    }
    return this.cells[x][y];
  }

  public updateCellBySessionCoords(
    trackNumber: number,
    sceneNumber: number,
    cell: Partial<CellData>
  ): LpGridCell {
    const x = trackNumber;
    const y = 7 - sceneNumber;
    for (const propertyName in cell) {
      // @ts-ignore
      this.cells[x][y][propertyName] = cell[propertyName];
    }
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
        cell.mode = "solid";
        cell.color = 0;
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
        cell.color = color;
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
