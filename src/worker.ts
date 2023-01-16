export type Point = {
  x: number;
  y: number;
};

export type Line = {
  start: Point;
  end: Point;
};

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

function drawPoly(
  sides: number,
  depth: number,
  height: number,
  width: number,
  strategy: string,
  ratio: number,
  outwards: number
) {
  let pointsAcc: Array<Line> = [];
  switch (strategy) {
    case "koch":
      drawKochPoly(sides, depth, height, width, outwards, pointsAcc);
      break;
    case "sierpinski":
      // Init
      let scaleFactor = (2 * sides) / 3;
      let length = Math.min(height / scaleFactor, width / scaleFactor);

      let start: Point = { x: width / 2, y: 32 };
      let end = rotateAround(
        start,
        { x: start.x + length, y: start.y },
        (-(sides - 2) * Math.PI) / sides
      );
      drawSierpPoly(sides, depth, start, end, ratio, outwards, 1, pointsAcc);
      break;
  }
  self.postMessage({ points: pointsAcc });
}

function drawSierpPoly(
  sides: number,
  depth: number,
  startPoint: Point,
  endPoint: Point,
  ratio: number,
  outwards: number,
  direction: number,
  pointsAcc: Array<Line>
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

function drawKochPoly(
  sides: number,
  depth: number,
  height: number,
  width: number,
  outwards: number,
  pointsAcc: Array<Line>
) {
  // Init
  let scaleFactor = (2 * sides) / 3;
  let length = Math.min(height / scaleFactor, width / scaleFactor);
  let start: Point = { x: width / 2, y: 32 };
  let end = { x: start.x + length, y: start.y };
  end = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);

  for (let i = 0; i < sides; i++) {
    drawKochLine(start, end, outwards, pointsAcc, depth);
    let next = rotateAround(start, end, (-(sides - 2) * Math.PI) / sides);
    start = end;
    end = next;
  }
}

function drawKochLine(
  start: Point,
  end: Point,
  outwards: number,
  pointsAcc: Array<Line>,
  depth = 0
) {
  if (depth <= 0) {
    drawLine(start, end, pointsAcc);
  } else {
    let third: Point = {
      x: start.x - (start.x - end.x) / 3,
      y: start.y - (start.y - end.y) / 3,
    };
    let twoThird = {
      x: start.x + (-2 * (start.x - end.x)) / 3,
      y: start.y + (-2 * (start.y - end.y)) / 3,
    };
    let midPoint = rotateAround(third, twoThird, (outwards * Math.PI) / 3);
    drawKochLine(start, third, outwards, pointsAcc, depth - 1);
    drawKochLine(third, midPoint, outwards, pointsAcc, depth - 1);
    drawKochLine(midPoint, twoThird, outwards, pointsAcc, depth - 1);
    drawKochLine(twoThird, end, outwards, pointsAcc, depth - 1);
  }
}

function drawLine(start: Point, end: Point, pointsAcc: Array<Line>) {
  pointsAcc.push({ start: start, end: end });
}

function getMiddle(a: Point, b: Point, ratio: number): Point {
  return { x: a.x + (b.x - a.x) / ratio, y: a.y + (b.y - a.y) / ratio };
}

function rotate(p: Point, ang: number): Point {
  const cos = Math.cos(ang);
  const sin = Math.sin(ang);
  const x = p.x;
  const y = p.y;
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

function rotateAround(origin: Point, point: Point, ang: number): Point {
  const pointX = point.x;
  let rotated = rotate({ x: origin.x - pointX, y: origin.y - point.y }, ang);
  return { x: pointX + rotated.x, y: point.y + rotated.y };
}
