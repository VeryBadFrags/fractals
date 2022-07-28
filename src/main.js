const canvas = document.getElementById("canvas");
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight / 2;
const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");
const progressBar = document.getElementById("progress-bar");

const strategySelect = document.getElementById("strategySelect");
const sidesRange = document.getElementById("sidesRange");
const depthRange = document.getElementById("depthRange");
const ratioSlider = document.getElementById("ratioSlider");
const ratioRange = document.getElementById("ratioRange");
const invertedCheck = document.getElementById("orientationCheck");

const liveUpdateCheck = document.getElementById("liveUpdate");

const bgColor = document.getElementById("bgColorPicker");
const lineColor = document.getElementById("lineColorPicker");

const scriptArea = document.getElementById("scriptArea");



let worker = new Worker("drawer.js");

worker.addEventListener(
  "message",
  function (e) {
    progressBar.classList.add("bg-success");
    progressBar.innerText="Drawing...";
    drawFromPoints(e.data.points);
    hideElement(loading);
    progressBar.classList.remove("bg-success");
  },
  false
);

function draw() {
  progressBar.innerText="Generating points...";
  showElement(loading);
  // worker.terminate();

  let outwards = invertedCheck.checked ? -1 : 1;
  // drawPoly(sidesRange.value, depthRange.value, 1, strategySelect.value, ratioRange.value, outwards);
  worker.postMessage({
    cmd: "draw",
    sides: sidesRange.value,
    depth: depthRange.value,
    height: canvas.height,
    width: canvas.width,
    strategy: strategySelect.value,
    ratio: ratioRange.value,
    outwards: outwards,
  });
}

function drawFromPoints(points) {
  const lineColor = document.getElementById("lineColorPicker");

  ctx.beginPath();
  ctx.lineWidth = 1;
  let randomColor =
    1 == 1
      ? lineColor.value
      : // : "#" + Math.floor(Math.random() * 16777215?).toString(16);
        "#ddddff";
  ctx.strokeStyle = randomColor;

  for (let i = 0; i < points.length; i++) {
    let line = points[i];
    if(!line) {
      return;
    }
    ctx.moveTo(line.start[0], line.start[1]);
    ctx.lineTo(line.end[0], line.end[1]);
  }

  ctx.stroke();
}

function redraw() {
  clearCanvas();
  draw();
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// BOOTSTRAP
const toast = document.getElementById("liveToast");
const copyLinkToast = new bootstrap.Toast(toast, {});

function initListeners() {
  // Listeners
  let sidesLabel = document.getElementById("sidesLabel");
  sidesLabel.innerText = sidesRange.value;
  sidesRange.addEventListener("input", (e) => {
    sidesLabel.innerText = sidesRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  let depthLabel = document.getElementById("depthLabel");
  depthLabel.innerText = depthRange.value;
  depthRange.addEventListener("input", (e) => {
    depthLabel.innerText = depthRange.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  ratioRange.addEventListener("input", (e) => {
    ratioSlider.value = e.target.value;
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });
  ratioSlider.addEventListener("input", (e) => {
    ratioRange.value = ratioSlider.value;
    ratioRange.dispatchEvent(new Event("input"));
  });

  let drawButton = document.getElementById("drawButton");
  drawButton.addEventListener("click", (e) => {
    draw();
  });

  let clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", (e) => {
    clearCanvas();
  });

  let playButton = document.getElementById("playButton");
  playButton.addEventListener("click", (e) => {
    let updateState = liveUpdateCheck.checked;
    playScript(scriptArea.value);
    liveUpdateCheck.checked = updateState;
    draw();
  });

  let copyLinkButton = document.getElementById("copyLinkButton");
  copyLinkButton.addEventListener("click", (e) => {
    const baseUrl = window.location.href.split("?")[0];
    const params = generateUrlParams();
    navigator.clipboard.writeText(baseUrl + "?" + params.toString()).then(
      function () {
        copyLinkToast.show();
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  });

  document.getElementById("addScriptButton").addEventListener("click", (e) => {
    scriptArea.value += generateUrlParams() + "\n";
  });

  document.getElementById("exportButton").addEventListener("click", (e) => {
    let image = new Image();
    image.src = canvas.toDataURL();
    let imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = null;
    imageContainer.appendChild(image);
  });

  document.getElementById("orientationCheck").addEventListener("click", (e) => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });

  strategySelect.addEventListener("change", (e) => {
    const ratioBox = document.getElementById("ratioBox");
    switch (e.target.value) {
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

  lineColor.addEventListener("change", (e) => {
    if (liveUpdateCheck.checked) {
      redraw();
    }
  });
  bgColor.addEventListener("change", (e) => {
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
        document.getElementById("addScriptButton").click();
        break;
      case "p":
        document.getElementById("playButton").click();
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

function generateUrlParams() {
  return new URLSearchParams({
    s: sidesRange.value,
    d: depthRange.value,
    r: ratioRange.value,
    i: invertedCheck.checked ? 1 : 0,
    t: strategySelect.selectedIndex + 1,
    lc: lineColor.value,
    bg: bgColor.value,
  });
}

function hideElement(e) {
  e.style.visibility = "hidden";
}

function showElement(e) {
  e.style.visibility = "visible";
}

initListeners();

{
  let paramString = window.location.href.split("?")[1];
  playScript(paramString);
  liveUpdateCheck.checked = true;
}

function playScript(script) {
  if (!script) {
    draw();
    return;
  }
  liveUpdateCheck.checked = false;
  let splitScript = script.split("\n");

  if (splitScript.length <= 0) {
    return;
  }

  let queryString = new URLSearchParams(splitScript[0]);
  if (queryString.has("bg")) {
    bgColor.value = queryString.get("bg");
    clearCanvas();
  }

  for (let i = 0; i < splitScript.length; i++) {
    let queryString = new URLSearchParams(splitScript[i]);
    if (queryString.has("s")) {
      sidesRange.value = queryString.get("s");
      sidesRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("d")) {
      depthRange.value = queryString.get("d");
      depthRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("r")) {
      let parsedRatio = queryString.get("r");
      ratioRange.value = parsedRatio;
      ratioSlider.value = parsedRatio;
      ratioRange.dispatchEvent(new Event("input"));
    }
    if (queryString.has("i")) {
      let invertedString = queryString.get("i");
      let invertedValue = invertedString === "true" || invertedString === "1";
      invertedCheck.checked = invertedValue;
      // invertedCheck.dispatchEvent(new Event("change"));
    }
    if (queryString.has("t")) {
      strategySelect.selectedIndex = Math.max(queryString.get("t") - 1, 0);
    }
    if (queryString.has("lc")) {
      lineColor.value = queryString.get("lc");
    }
    draw();
  }
}
