type RgbColor = number[];
function getRgbColor(r: number, g: number, b: number) {
  return [r, g, b];
}

/**
 * Maps the novation color notes to RGB values
 *
 * Taken from https://github.com/Jengamon/Launchpad-X-Bitwig-Script
 *
 * TODO: Take picture of actual colors and adjust accordingly
 */
const colorMap = [
  [0, 0, 0],
  [179, 179, 179],
  [221, 221, 221],
  [255, 255, 255],
  [249, 179, 178],
  [245, 95, 94],
  [213, 96, 95],
  [173, 96, 96],
  [254, 243, 212],
  [249, 178, 90],
  [215, 139, 93],
  [174, 118, 95],
  [253, 238, 157],
  [254, 255, 82],
  [220, 221, 87],
  [178, 179, 92],
  [223, 255, 156],
  [199, 255, 84],
  [167, 221, 89],
  [134, 179, 93],
  [200, 255, 176],
  [121, 255, 86],
  [114, 221, 89],
  [107, 179, 93],
  [199, 254, 191],
  [122, 255, 135],
  [115, 221, 113],
  [107, 179, 104],
  [200, 255, 202],
  [123, 255, 203],
  [114, 219, 158],
  [107, 179, 127],
  [201, 255, 243],
  [124, 255, 233],
  [116, 221, 194],
  [108, 179, 149],
  [200, 243, 255],
  [121, 239, 255],
  [113, 199, 222],
  [106, 161, 180],
  [197, 221, 255],
  [114, 200, 255],
  [107, 162, 223],
  [102, 129, 181],
  [161, 141, 255],
  [101, 99, 255],
  [100, 98, 224],
  [99, 98, 181],
  [203, 179, 255],
  [159, 98, 255],
  [128, 98, 224],
  [117, 98, 181],
  [250, 179, 255],
  [247, 97, 255],
  [214, 97, 224],
  [174, 97, 181],
  [249, 179, 214],
  [246, 96, 195],
  [213, 96, 162],
  [174, 97, 141],
  [246, 117, 93],
  [228, 178, 90],
  [218, 194, 90],
  [160, 161, 93],
  [107, 179, 93],
  [108, 179, 139],
  [104, 141, 215],
  [101, 99, 255],
  [108, 179, 180],
  [139, 98, 247],
  [202, 179, 194],
  [138, 118, 129],
  [245, 95, 94],
  [243, 255, 156],
  [238, 252, 83],
  [208, 255, 84],
  [131, 221, 89],
  [123, 255, 203],
  [120, 234, 255],
  [108, 162, 255],
  [139, 98, 255],
  [199, 98, 255],
  [232, 140, 223],
  [157, 118, 95],
  [248, 160, 91],
  [223, 249, 84],
  [216, 255, 133],
  [121, 255, 86],
  [187, 255, 157],
  [209, 252, 212],
  [188, 255, 246],
  [207, 228, 255],
  [165, 194, 248],
  [212, 194, 251],
  [242, 140, 255],
  [246, 96, 206],
  [249, 193, 89],
  [241, 238, 85],
  [229, 255, 83],
  [219, 204, 89],
  [177, 161, 93],
  [108, 186, 115],
  [127, 194, 138],
  [129, 129, 162],
  [131, 140, 206],
  [201, 170, 127],
  [213, 96, 95],
  [243, 179, 159],
  [243, 185, 113],
  [253, 243, 133],
  [234, 249, 156],
  [214, 238, 110],
  [129, 129, 162],
  [249, 249, 211],
  [224, 252, 227],
  [233, 233, 255],
  [227, 213, 255],
  [179, 179, 179],
  [213, 213, 213],
  [250, 255, 255],
  [224, 96, 95],
  [165, 96, 96],
  [143, 246, 86],
  [107, 179, 93],
  [241, 238, 85],
  [177, 161, 93],
  [234, 193, 89],
  [188, 117, 95],
];

const colorMapMemoized: { [key: string]: number } = {};

function bitwigRgbToNote(r: number, g: number, b: number): number {
  return rgbToNote(
    convertTo255Color(r),
    convertTo255Color(g),
    convertTo255Color(b)
  );
}

function rgbToNote(r: number, g: number, b: number): number {
  if (!colorMapMemoized[`${r},${g},${b}`]) {
    const distanceMap: number[] = [];
    let bestDistance = 255 * 3;
    let bestDistanceNote = 0;

    for (let note = 0; note < colorMap.length; note++) {
      distanceMap[note] = 0;
      distanceMap[note] += Math.abs(colorMap[note][0] - r);
      distanceMap[note] += Math.abs(colorMap[note][1] - g);
      distanceMap[note] += Math.abs(colorMap[note][2] - b);

      if (distanceMap[note] < bestDistance) {
        bestDistance = distanceMap[note];
        bestDistanceNote = note;
      }
    }

    colorMapMemoized[`${r},${g},${b}`] = bestDistanceNote;
    println(
      `Best Color Note for [${r}, ${g}, ${b}]: ${bestDistanceNote} with distance ${bestDistance}`
    );
  }

  return colorMapMemoized[`${r},${g},${b}`];
}

function convertTo255Color(zeroToOneValue: number) {
  return Math.round(zeroToOneValue * 255);
}
