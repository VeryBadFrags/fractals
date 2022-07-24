let canvas = document.getElementById("canvas");

canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;

const ctx = canvas.getContext("2d");

function draw() {
  let sides = document.getElementById("sidesRange").value;
  let depth = document.getElementById("depthRange").value;
  drawPoly(sides, depth);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log("clear");
}

function drawSquare(degree = 0, size = 1) {
  // ctx.clear();
  let counter = size;
  while (counter >= 1) {
    ctx.beginPath();
    ctx.lineWidth = counter;
    let randomColor =
      counter == 1
        ? "#000000"
        : "#" + Math.floor(Math.random() * 16777215).toString(16);
    ctx.strokeStyle = randomColor;
    drawLine(
      [canvas.width / 3, canvas.height / 3],
      [(2 * canvas.width) / 3, canvas.height / 3],
      degree
    );
    drawLine(
      [(2 * canvas.width) / 3, canvas.height / 3],
      [(2 * canvas.width) / 3, (2 * canvas.height) / 3],
      degree
    );
    drawLine(
      [(2 * canvas.width) / 3, (2 * canvas.height) / 3],
      [canvas.width / 3, (2 * canvas.height) / 3],
      degree
    );
    drawLine(
      [canvas.width / 3, (2 * canvas.height) / 3],
      [canvas.width / 3, canvas.height / 3],
      degree
    );
    ctx.stroke();
    counter--;
  }
}

function drawPoly(sides = 4, depth = 0) {
  ctx.beginPath();
  let scaleFactor = (2 * sides) / 3;
  let length = Math.min(
    canvas.width / scaleFactor,
    canvas.height / scaleFactor
  );
  let start = [
    Math.max(length/3, canvas.width / 3 - length/2),
    Math.max(length/3, canvas.height / 3 - length/2),
  ];
  let end = [start[0] + length, start[1]];
  for (let i = 0; i < sides; i++) {
    drawLine(start, end, depth);
    let next = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
  ctx.stroke();
}

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

function initListeners() {
  // Listeners
  let liveUpdateCheck = document.getElementById("liveUpdate");

  let sidesRange = document.getElementById("sidesRange");
  sidesRange.addEventListener("input", (e) => {
    document.getElementById("sidesLabel").innerText = sidesRange.value;
    if (liveUpdateCheck.checked) {
      clearCanvas();
      draw();
    }
  });

  let depthRange = document.getElementById("depthRange");
  depthRange.addEventListener("input", (e) => {
    document.getElementById("depthLabel").innerText = depthRange.value;
    if (liveUpdateCheck.checked) {
      clearCanvas();
      draw();
    }
  });
}

initListeners();

draw();
