let canvas = document.getElementById("canvas");

canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;

const width = document.body.scrollWidth;
const height = document.body.scrollHeight;

let ctx = canvas.getContext("2d");

drawSquare(4, 2);

function drawSquare(degree = 0, size = 1) {
  let counter = size;
  while (counter >= 1) {
    ctx.lineWidth = counter;
    let randomColor =
      counter == 1
        ? "#000000"
        : "#" + Math.floor(Math.random() * 16777215).toString(16);
    ctx.strokeStyle = randomColor;
    drawLine([width / 3, height / 3], [(2 * width) / 3, height / 3], degree);
    drawLine(
      [(2 * width) / 3, height / 3],
      [(2 * width) / 3, (2 * height) / 3],
      degree
    );
    drawLine(
      [(2 * width) / 3, (2 * height) / 3],
      [width / 3, (2 * height) / 3],
      degree
    );
    drawLine([width / 3, (2 * height) / 3], [width / 3, height / 3], degree);
    ctx.stroke();
    counter--;
  }
}

function drawPoly(sides = 4) {}

function drawLine(start, end, degree = 0) {
  if (degree <= 0) {
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
    let midPoint = rotateAround(third, twoThird, Math.PI / 3);
    drawLine(start, third, degree - 1);
    drawLine(third, midPoint, degree - 1);
    drawLine(midPoint, twoThird, degree - 1);
    drawLine(twoThird, end, degree - 1);
  }
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

// Listeners
document.getElementById("depthRange").addEventListener(onchange, (e) => {
  ctx.clear();
  console.log("yolo");
});
