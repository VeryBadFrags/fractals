let canvas = document.getElementById("canvas");

canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;

const ctx = canvas.getContext("2d");

let outwards = 1;

function draw() {
  let loading = document.getElementById("loading");
  showLoad(loading);
  let sides = document.getElementById("sidesRange").value;
  let depth = document.getElementById("depthRange").value;
  outwards = document.getElementById("orientationCheck").checked ? -1 : 1;
  let strategy = document.getElementById("strategySelect").value;
  drawPoly(sides, depth, 2, strategy);
  hideLoad(loading);
}

function redraw() {
  clearCanvas();
  draw();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    drawKochLine(
      [canvas.width / 3, canvas.height / 3],
      [(2 * canvas.width) / 3, canvas.height / 3],
      degree
    );
    drawKochLine(
      [(2 * canvas.width) / 3, canvas.height / 3],
      [(2 * canvas.width) / 3, (2 * canvas.height) / 3],
      degree
    );
    drawKochLine(
      [(2 * canvas.width) / 3, (2 * canvas.height) / 3],
      [canvas.width / 3, (2 * canvas.height) / 3],
      degree
    );
    drawKochLine(
      [canvas.width / 3, (2 * canvas.height) / 3],
      [canvas.width / 3, canvas.height / 3],
      degree
    );
    ctx.stroke();
    counter--;
  }
}

function drawPoly(sides, depth = 0, thickness = 1, strategy) {
  let counter = thickness;
  while (counter >= 1) {
    ctx.beginPath();
    ctx.lineWidth = counter;
    let randomColor =
      counter == 1
        ? "#000000"
        : "#" + Math.floor(Math.random() * 16777215).toString(16);
    ctx.strokeStyle = randomColor;

    switch (strategy) {
      case "koch":
        drawKochPoly(sides, depth);
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
        drawSierpPoly(sides, depth, start, end);
        break;
    }

    ctx.stroke();
    counter--;
  }
}

function drawKochPoly(sides, depth) {
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
    drawKochLine(start, end, depth);
    let next = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
}

function drawSierpPoly(sides, depth, startPoint, endPoint, direction = 1) {
  if (depth < 0) {
    return;
  }
  let start = startPoint;
  let end = endPoint;

  for (let i = 0; i < sides; i++) {
    if (depth == 0) {
      console.log("here");
      drawKochLine(start, end);
    } else {
      let middle = getMiddle(start, end);
      let third = getThird(start, end);
      let twoThird = getThird(end, start);
      if(outwards == -1) {
        drawSierpPoly(sides, depth - 1, start, third, -direction);
        drawSierpPoly(sides, depth - 1, third, twoThird, -direction);
        drawSierpPoly(sides, depth - 1, twoThird, end, -direction);
      } else {
        drawSierpPoly(sides, depth - 1, start, middle);
      }
    }
    let next = rotateAround(start, end, direction * (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
}

function drawKochLine(start, end, depth = 0) {
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
    drawKochLine(start, third, depth - 1);
    drawKochLine(third, midPoint, depth - 1);
    drawKochLine(midPoint, twoThird, depth - 1);
    drawKochLine(twoThird, end, depth - 1);
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

function getMiddle(a, b) {
  return [a[0] + (b[0] - a[0]) / 2, a[1] + (b[1] - a[1]) / 2];
}

function getThird(a, b) {
  return [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3];
}

function initListeners() {
  // Listeners
  let liveUpdateCheck = document.getElementById("liveUpdate");
  let invertedCheck = document.getElementById("orientationCheck");

  let sidesRange = document.getElementById("sidesRange");
  let sidesLabel = document.getElementById("sidesLabel");
  sidesLabel.innerText = sidesRange.value;
  sidesRange.addEventListener("input", (e) => {
    sidesLabel.innerText = sidesRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  let depthRange = document.getElementById("depthRange");
  depthRange.addEventListener("input", (e) => {
    document.getElementById("depthLabel").innerText = depthRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  let drawButton = document.getElementById("drawButton");
  drawButton.addEventListener("click", (e) => {
    draw();
  });

  // document.getElementById("drawClearButton").addEventListener("click", (e) => {
  //   clearCanvas();
  //   draw();
  // });

  let clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", (e) => {
    clearCanvas();
  });

  document.getElementById("orientationCheck").addEventListener("click", (e) => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  let strategySelect = document.getElementById("strategySelect");
  strategySelect.addEventListener("change", (e) => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "c":
        clearButton.click();
        break;
      case "d":
        drawButton.click();
        break;
      case "i":
        invertedCheck.click();
        break;
      case "l":
        liveUpdateCheck.click();
        break;
      case "+":
      case "=":
        sidesRange.value++;
        sidesRange.dispatchEvent(new Event("input"));
        break;
      case "_":
      case "-":
        sidesRange.value--;
        sidesRange.dispatchEvent(new Event("input"));
        break;
      case "[":
      case "{":
        depthRange.value--;
        depthRange.dispatchEvent(new Event("input"));
        break;
      case "]":
      case "}":
        depthRange.value++;
        depthRange.dispatchEvent(new Event("input"));
        break;
    }
  });
}

function hideLoad(e) {
  e.style.visibility = "hidden";
}
function showLoad(e) {
  e.style.visibility = "visible";
}

initListeners();

draw();
