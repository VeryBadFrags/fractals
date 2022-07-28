const canvas = document.getElementById("canvas");
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight / 2;
const ctx = canvas.getContext("2d");

const lineColor = document.getElementById("lineColorPicker");

export function drawPoly(sides, depth, thickness, strategy, ratio = 2, outwards) {
  let counter = thickness;
  while (counter >= 1) {
    ctx.beginPath();
    ctx.lineWidth = counter;
    let randomColor = counter == 1
      ? lineColor.value
      : // : "#" + Math.floor(Math.random() * 16777215?).toString(16);
      "#ddddff";
    ctx.strokeStyle = randomColor;

    switch (strategy) {
      case "koch":
        drawKochPoly(sides, depth, outwards);
        break;
      case "sierpinski":
        // Init
        let scaleFactor = (2 * sides) / 3;
        let length = Math.min(
          canvas.width / scaleFactor,
          canvas.height / scaleFactor
        );

        let start = [canvas.width / 2, 32];
        let end = rotateAround(
          start,
          [start[0] + length, start[1]],
          (-(sides - 2) * Math.PI) / sides
        );
        drawSierpPoly(sides, depth, start, end, ratio, outwards, 1);
        break;
    }

    ctx.stroke();
    counter--;
  }
}

function drawSierpPoly(sides, depth, startPoint, endPoint, ratio, outwards, direction) {
  if (depth < 0) {
    return;
  }
  let start = startPoint;
  let end = endPoint;

  for (let i = 0; i < sides; i++) {
    if (depth == 0) {
      drawKochLine(start, end, outwards);
    } else {
      let third = getMiddle(start, end, ratio);
      let twoThird = getMiddle(end, start, ratio);
      if (outwards == -1) {
        drawSierpPoly(sides, depth - 1, start, third, ratio, outwards, -direction);
        drawSierpPoly(sides, depth - 1, twoThird, end, ratio, outwards, -direction);
      } else {
        let middle = getMiddle(start, end, ratio);
        drawSierpPoly(sides, depth - 1, start, middle, ratio, outwards, 1);
      }
    }

    let next = rotateAround(
      start,
      end,
      (direction * (-(sides - 2) * Math.PI)) / sides
    );
    start = end;
    end = next;
  }
}

function drawKochPoly(sides, depth, outwards) {
  // Init
  let scaleFactor = (2 * sides) / 3;
  let length = Math.min(
    canvas.width / scaleFactor,
    canvas.height / scaleFactor
  );
  let start = [canvas.width / 2, 32];
  let end = [start[0] + length, start[1]];
  end = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);

  for (let i = 0; i < sides; i++) {
    drawKochLine(start, end, outwards, depth);
    let next = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
}

function drawKochLine(start, end, outwards, depth = 0) {
  if (depth <= 0) {
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(end[0], end[1]);
  } else {
    let third = [
      start[0] - (start[0] - end[0]) / 3,
      start[1] - (start[1] - end[1]) / 3,
    ];
    let twoThird = [
      start[0] + (-2 * (start[0] - end[0])) / 3,
      start[1] + (-2 * (start[1] - end[1])) / 3,
    ];
    let midPoint = rotateAround(third, twoThird, (outwards * Math.PI) / 3);
    drawKochLine(start, third, outwards, depth - 1);
    drawKochLine(third, midPoint, outwards, depth - 1);
    drawKochLine(midPoint, twoThird, outwards, depth - 1);
    drawKochLine(twoThird, end, outwards, depth - 1);
  }
}

function getMiddle(a, b, ratio) {
  return [a[0] + (b[0] - a[0]) / ratio, a[1] + (b[1] - a[1]) / ratio];
}

function rotate(p, ang) {
  return [
    p[0] * Math.cos(ang) - p[1] * Math.sin(ang),
    p[0] * Math.sin(ang) + p[1] * Math.cos(ang),
  ];
}

function rotateAround(p, p0, ang) {
  let rotated = rotate([p[0] - p0[0], p[1] - p0[1]], ang);
  return [p0[0] + rotated[0], p0[1] + rotated[1]];
}
