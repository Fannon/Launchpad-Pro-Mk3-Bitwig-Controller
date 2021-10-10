type Note = number;
type Color = number;
type DisplayMode = "solid" | "pulse" | "flash";
interface Position {
  x: number;
  y: number;
}
interface Cell extends Position {
  note: Note;
  color: Color; // 0 -> Off
  mode: DisplayMode;
}
type Grid = Cell[][];

function createGrid(): Grid {
  println(`createGrid()`);
  const grid: Grid = [];
  for (let i = 0; i < 8; i++) {
    grid[i] = [];
    for (let j = 0; j < 8; j++) {
      grid[i][j] = {
        x: i,
        y: j,
        note: positionToNote(i, j),
        mode: "solid",
        color: 0,
      };
    }
  }
  return grid;
}

function drawGrid(grid: Grid): void {
  println(`drawGrid()`);
  for (const row of grid) {
    for (const cell of row) {
      drawCell(cell);
    }
  }
}

function drawCell(cell: Cell): void {
  if (cell.mode === "flash") {
    ext.midiOut.sendMidi(145, cell.note, cell.color);
  } else if (cell.mode === "pulse") {
    ext.midiOut.sendMidi(146, cell.note, cell.color);
  } else {
    ext.midiOut.sendMidi(144, cell.note, cell.color); // Solid
  }
}

function resetGrid(grid: Grid): Grid {
  for (const row of grid) {
    for (const cell of row) {
      cell.mode = "solid";
      cell.color = 0;
    }
  }
  return grid;
}

function colorGrid(grid: Grid, startPoint = 0): Grid {
  let color = startPoint;
  for (const row of grid) {
    for (const cell of row) {
      cell.color = color;
      color++;
    }
  }
  return grid;
}

function positionToNote(x: number, y: number): Note {
  return (y + 1) * 10 + (x + 1);
}
function noteToPosition(note: Note): Position {
  return {
    x: (note % 10) - 1,
    y: Math.floor(note / 10) - 1,
  };
}
