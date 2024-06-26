import { Line } from "./worker";
import { Toast } from "bootstrap";

import Plausible from "plausible-tracker";
const plausible = Plausible({
  domain: "fractals.verybadfrags.com",
  apiHost: "/ps",
  hashMode: false,
});
plausible.trackPageview();

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight / 2;
const ctx = canvas.getContext("2d")!;

const loading = document.getElementById("loading")!;
const progressBar = document.getElementById("progress-bar")!;

const strategySelect = document.getElementById(
  "strategySelect",
) as HTMLSelectElement;
const sidesRange = document.getElementById("sidesRange") as HTMLInputElement;
const depthRange = document.getElementById("depthRange") as HTMLInputElement;
const ratioSlider = document.getElementById("ratioSlider") as HTMLInputElement;
const ratioRange = document.getElementById("ratioRange") as HTMLInputElement;
const invertedCheck = document.getElementById(
  "orientationCheck",
) as HTMLInputElement;

const liveUpdateCheck = document.getElementById(
  "liveUpdate",
) as HTMLInputElement;

const bgColor = document.getElementById("bgColorPicker") as HTMLInputElement;
const lineColor = document.getElementById(
  "lineColorPicker",
) as HTMLInputElement;

const scriptArea = document.getElementById("scriptArea") as HTMLTextAreaElement;

const worker = new Worker(new URL("./worker.ts", import.meta.url));

worker.addEventListener(
  "message",
  function (e) {
    progressBar.classList.add("bg-success");
    progressBar.innerText = "Drawing...";

    if (liveUpdateCheck.checked) {
      clearCanvas();
    }

    drawFromPoints(e.data.points);
    hideElement(loading);
    progressBar.classList.remove("bg-success");
  },
  false,
);

function draw() {
  const depth = parseInt(depthRange.value);

  if (depth >= 5) {
    progressBar.innerText = "Generating points...";
    showElement(loading);
  }

  worker.postMessage({
    cmd: "draw",
    sides: sidesRange.value,
    depth: depth,
    height: canvas.height,
    width: canvas.width,
    strategy: strategySelect.value,
    ratio: ratioRange.value,
    outwards: invertedCheck.checked ? -1 : 1,
  });
}

function drawFromPoints(points: Array<Line>) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  // TODO add setting for random color
  const randomColor = lineColor.value;
  // "#" + Math.floor(Math.random() * 16777215?).toString(16);
  // "#ddddff";
  ctx.strokeStyle = randomColor;

  points.forEach((line) => {
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
  });

  ctx.stroke();
}

function redraw() {
  draw();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// BOOTSTRAP
const toast = document.getElementById("liveToast")!;
const copyLinkToast = new Toast(toast, {});

function initListeners() {
  // Listeners
  const sidesLabel = document.getElementById("sidesLabel")!;
  sidesLabel.innerText = sidesRange.value;
  sidesRange.addEventListener("input", () => {
    sidesLabel.innerText = sidesRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  const depthLabel = document.getElementById("depthLabel")!;
  depthLabel.innerText = depthRange.value;
  depthRange.addEventListener("input", () => {
    depthLabel.innerText = depthRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  liveUpdateCheck.addEventListener("input", () => {
    if (liveUpdateCheck.checked) {
      hideElement(drawButton);
    } else {
      showElement(drawButton);
    }
  });

  ratioRange.addEventListener("input", (e) => {
    ratioSlider.value = (e.target as HTMLInputElement).value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });
  ratioSlider.addEventListener("input", () => {
    ratioRange.value = ratioSlider.value;
    ratioRange.dispatchEvent(new Event("input"));
  });

  const drawButton = document.getElementById("drawButton") as HTMLButtonElement;
  drawButton.addEventListener("click", () => {
    draw();
  });

  const clearButton = document.getElementById(
    "clearButton",
  ) as HTMLButtonElement;
  clearButton.addEventListener("click", () => {
    clearCanvas();
  });

  const playButton = document.getElementById("playButton") as HTMLButtonElement;
  playButton.addEventListener("click", () => {
    const updateState = liveUpdateCheck.checked;
    playScript(scriptArea.value);
    liveUpdateCheck.checked = updateState;
    draw();
  });

  const copyLinkButton = document.getElementById(
    "copyLinkButton",
  ) as HTMLButtonElement;
  copyLinkButton.addEventListener("click", () => {
    const baseUrl = window.location.href.split("?")[0];
    const params = generateUrlParams();
    navigator.clipboard.writeText(baseUrl + "?" + params.toString()).then(
      function () {
        copyLinkToast.show();
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      },
    );
  });

  document.getElementById("addScriptButton")!.addEventListener("click", () => {
    scriptArea.value += generateUrlParams() + "\n";
  });

  document.getElementById("exportButton")!.addEventListener("click", () => {
    const image = new Image();
    image.src = canvas.toDataURL();
    const imageContainer = document.getElementById("imageContainer")!;
    imageContainer.innerHTML = "";
    imageContainer.appendChild(image);
  });

  document.getElementById("orientationCheck")!.addEventListener("click", () => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  strategySelect.addEventListener("change", (e) => {
    const ratioBox = document.getElementById("ratioBox")!;
    switch ((e.target as HTMLSelectElement).value) {
      case "koch":
        hideElement(ratioBox);
        break;
      case "sierpinski":
        showElement(ratioBox);
        break;
    }
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  lineColor.addEventListener("change", () => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });
  bgColor.addEventListener("change", () => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  document.addEventListener("keydown", (e) => {
    switch (e.key.toLowerCase()) {
      case "r":
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
      case "s":
        document.getElementById("addScriptButton")!.click();
        break;
      case "p":
        document.getElementById("playButton")!.click();
        break;
      case "+":
      case "=":
        sidesRange.value = (parseInt(sidesRange.value) + 1).toString();
        sidesRange.dispatchEvent(new Event("input"));
        break;
      case "_":
      case "-":
        sidesRange.value = (parseInt(sidesRange.value) - 1).toString();
        sidesRange.dispatchEvent(new Event("input"));
        break;
      case "[":
      case "{":
        depthRange.value = (parseInt(depthRange.value) - 1).toString();
        depthRange.dispatchEvent(new Event("input"));
        break;
      case "]":
      case "}":
        depthRange.value = (parseInt(depthRange.value) + 1).toString();
        depthRange.dispatchEvent(new Event("input"));
        break;
    }
  });
}

function generateUrlParams() {
  new URLSearchParams();
  return new URLSearchParams(
    {
      s: sidesRange.value,
      d: depthRange.value,
      r: ratioRange.value,
      i: invertedCheck.checked ? 1 : 0,
      t: strategySelect.selectedIndex + 1,
      lc: lineColor.value,
      bg: bgColor.value,
    }.toString(),
  );
}

function hideElement(e: HTMLElement) {
  e.style.visibility = "hidden";
}

function showElement(e: HTMLElement) {
  e.style.visibility = "visible";
}

initListeners();

{
  const paramString = window.location.href.split("?")[1];
  playScript(paramString);
  liveUpdateCheck.checked = true;
}

function playScript(script: string) {
  if (!script) {
    draw();
    return;
  }
  liveUpdateCheck.checked = false;
  const splitScript = script.split("\n");

  if (splitScript.length <= 0) {
    return;
  }

  let queryString = new URLSearchParams(splitScript[0]);
  if (queryString.has("bg")) {
    bgColor.value = queryString.get("bg")!;
    clearCanvas();
  }

  for (const urlParam of splitScript) {
    queryString = new URLSearchParams(urlParam);
    if (queryString.has("s")) {
      sidesRange.value = queryString.get("s")!;
      sidesRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("d")) {
      depthRange.value = queryString.get("d")!;
      depthRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("r")) {
      const parsedRatio = queryString.get("r")!;
      ratioRange.value = parsedRatio;
      ratioSlider.value = parsedRatio;
      ratioRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("i")) {
      const invertedString = queryString.get("i");
      const invertedValue = invertedString === "true" || invertedString === "1";
      invertedCheck.checked = invertedValue;
    }
    if (queryString.has("t")) {
      strategySelect.selectedIndex = Math.max(
        parseInt(queryString.get("t")!) - 1,
        0,
      );
    }
    if (queryString.has("lc")) {
      lineColor.value = queryString.get("lc")!;
    }
    draw();
  }
}
