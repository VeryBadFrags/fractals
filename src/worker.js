self.addEventListener(
  "message",
  (e) => {
    let data = e.data;
    switch (data.cmd) {
      case "draw":
        drawPoly(
          data.sides,
          data.depth,
          data.height,
          data.width,
          data.strategy,
          data.ratio,
          data.outwards
        );
        break;
      case "stop":
        console.log("Stopping worker");
        self.close();
        break;
    }
  },
  false
);

function drawPoly(sides, depth, height, width, strategy, ratio, outwards) {
  let pointsAcc = [];
  switch (strategy) {
    case "koch":
      drawKochPoly(sides, depth, height, width, outwards, pointsAcc);
      break;
    case "sierpinski":
      // Init
      let scaleFactor = (2 * sides) / 3;
      let length = Math.min(height / scaleFactor, width / scaleFactor);

      let start = [width / 2, 32];
      let end = rotateAround(
        start,
        [start[0] + length, start[1]],
        (-(sides - 2) * Math.PI) / sides
      );
      drawSierpPoly(sides, depth, start, end, ratio, outwards, 1, pointsAcc);
      break;
  }
  self.postMessage({ points: pointsAcc });
}

function drawSierpPoly(
  sides,
  depth,
  startPoint,
  endPoint,
  ratio,
  outwards,
  direction,
  pointsAcc
) {
  let start = startPoint;
  let end = endPoint;

  for (let i = 0; i < sides; i++) {
    if (depth == 0) {
      drawLine(start, end, pointsAcc);
    } else {
      let third = getMiddle(start, end, ratio);
      let twoThird = getMiddle(end, start, ratio);
      if (outwards == -1) {
        drawSierpPoly(
          sides,
          depth - 1,
          start,
          third,
          ratio,
          outwards,
          -direction,
          pointsAcc
        );
        drawSierpPoly(
          sides,
          depth - 1,
          twoThird,
          end,
          ratio,
          outwards,
          -direction,
          pointsAcc
        );
      } else {
        let middle = getMiddle(start, end, ratio);
        drawSierpPoly(
          sides,
          depth - 1,
          start,
          middle,
          ratio,
          outwards,
          1,
          pointsAcc
        );
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

function drawKochPoly(sides, depth, height, width, outwards, pointsAcc) {
  // Init
  let scaleFactor = (2 * sides) / 3;
  let length = Math.min(height / scaleFactor, width / scaleFactor);
  let start = [width / 2, 32];
  let end = [start[0] + length, start[1]];
  end = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);

  for (let i = 0; i < sides; i++) {
    drawKochLine(start, end, outwards, pointsAcc, depth);
    let next = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
}

function drawKochLine(start, end, outwards, pointsAcc, depth = 0) {
  if (depth <= 0) {
    drawLine(start, end, pointsAcc);
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
    drawKochLine(start, third, outwards, pointsAcc, depth - 1);
    drawKochLine(third, midPoint, outwards, pointsAcc, depth - 1);
    drawKochLine(midPoint, twoThird, outwards, pointsAcc, depth - 1);
    drawKochLine(twoThird, end, outwards, pointsAcc, depth - 1);
  }
}

function drawLine(start, end, pointsAcc) {
  pointsAcc.push({ start: start, end: end });
}

function getMiddle(a, b, ratio) {
  return [a[0] + (b[0] - a[0]) / ratio, a[1] + (b[1] - a[1]) / ratio];
}

function rotate(p, ang) {
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const x = p[0];
  const y = p[1];
  return [
    x * cos - y * sin,
    x * sin + y * cos,
  ];
}

function rotateAround(origin, point, ang) {
  const pointX = point[0];
  let rotated = rotate([origin[0] - pointX, origin[1] - point[1]], ang);
  return [pointX + rotated[0], point[1] + rotated[1]];
}
