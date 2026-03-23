const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("canvas");

/* ===== FIXED GAUGE SETTINGS ===== */
const STITCH_SIZE = 97;
const ROW_SPACING = 0.79;
const SCALE = 4;

/* ===== STITCH PATH ===== */
const stitchPathData = `...`; // keep the same stitchPathData as before

let rows = 6;
let cols = 10;
let selectedColor = "#ff0000";
let stitchColors = [];
let isDrawing = false;

/* ===== LINE NUMBER SETTINGS ===== */
let showLineNumbers = false;
let knitType = "flat";

/* ===== COLOR PALETTE ===== */
const defaultColors = ["#ffffff","#000000","#ff0000","#0000ff","#00aa00","#ffff00","#ff00ff","#00ffff","#888888"];
let paletteColors = [...defaultColors];
const paletteDiv = document.getElementById("palette");

function renderPalette() {
  paletteDiv.innerHTML = "";
  paletteColors.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.addEventListener("click", () => {
      selectedColor = color;
      document.getElementById("colorPicker").value = color;
    });
    paletteDiv.appendChild(swatch);
  });
}

document.getElementById("saveColor").addEventListener("click", () => {
  const color = document.getElementById("colorPicker").value;
  if (!paletteColors.includes(color)) {
    paletteColors.push(color);
    renderPalette();
  }
  selectedColor = color;
});

/* ===== INIT GRID ===== */
function initGrid(r, c) {
  rows = r;
  cols = c;
  stitchColors = Array.from({ length: rows }, () => Array.from({ length: cols }, () => "#ffffff"));
}

/* ===== RENDER GRID ===== */
function renderGrid() {
  svg.innerHTML = "";
  const canvasWidth = 900;
  const canvasHeight = 700;
  const gridWidth = (cols - 1) * STITCH_SIZE;
  const gridHeight = (rows - 1) * STITCH_SIZE * ROW_SPACING;
  const offsetX = (canvasWidth - gridWidth) / 2;
  const offsetY = (canvasHeight - gridHeight) / 2;

  for (let r = 0; r < rows; r++) {
    // Add row number
    if (showLineNumbers) {
      const text = document.createElementNS(svgNS, "text");
      text.textContent = r + 1;
      text.classList.add("line-number");
      text.setAttribute("x", offsetX - 20);
      text.setAttribute("y", offsetY + r * STITCH_SIZE * ROW_SPACING + STITCH_SIZE/2);
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("text-anchor", "end");
      svg.appendChild(text);
    }

    for (let c = 0; c < cols; c++) {
      const group = document.createElementNS(svgNS, "g");
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", stitchPathData);
      path.setAttribute("stroke", "#000");
      path.setAttribute("fill", stitchColors[r][c]);
      path.setAttribute("stroke-width", "0.5");
      path.style.cursor = "pointer";

      function paint() {
        stitchColors[r][c] = selectedColor;
        path.setAttribute("fill", selectedColor);
      }

      path.addEventListener("mousedown", (e) => { isDrawing = true; paint(); e.preventDefault(); });
      path.addEventListener("mouseenter", () => { if (isDrawing) paint(); });

      group.appendChild(path);
      svg.appendChild(group);

      // Column flip logic for flat vs round
      let colIndex = c;
      if (knitType === "flat" && r % 2 === 1) colIndex = cols - 1 - c;

      const bbox = path.getBBox();
      const cx = bbox.x + bbox.width/2;
      const cy = bbox.y + bbox.height/2;

      group.setAttribute(
        "transform",
        `translate(${offsetX + colIndex*STITCH_SIZE}, ${offsetY + r*STITCH_SIZE*ROW_SPACING}) translate(${-cx},${-cy})`
      );
      path.setAttribute("transform", `scale(${SCALE})`);
    }
  }

  // Column numbers
  if (showLineNumbers) {
    for (let c = 0; c < cols; c++) {
      const text = document.createElementNS(svgNS, "text");
      text.textContent = c + 1;
      text.classList.add("line-number");
      text.setAttribute("x", offsetX + c * STITCH_SIZE + STITCH_SIZE/2);
      text.setAttribute("y", offsetY - 10);
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("text-anchor", "middle");
      svg.appendChild(text);
    }
  }
}

window.addEventListener("mouseup", () => { isDrawing = false; });

/* ===== ZOOM + PAN ===== */
const viewport = document.getElementById("viewport");
let scale = 1, panX = 0, panY = 0, isPanning = false, startX, startY;

viewport.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 0.1;
  scale += e.deltaY < 0 ? zoomFactor : -zoomFactor;
  scale = Math.max(0.2, scale);
  applyTransform();
});

viewport.addEventListener("mousedown", (e) => {
  if (e.button === 1 || e.button === 2) {
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    e.preventDefault();
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  applyTransform();
});

window.addEventListener("mouseup", () => { isPanning = false; });
viewport.addEventListener("contextmenu", (e) => e.preventDefault());

function applyTransform() {
  svg.style.transform = `scale(1) translate(0px, 0px)`;
}

/* ===== UI EVENTS ===== */
document.getElementById("colorPicker").addEventListener("input", (e) => { selectedColor = e.target.value; });
document.getElementById("applyGrid").addEventListener("click", () => {
  const r = parseInt(document.getElementById("rowsInput").value);
  const c = parseInt(document.getElementById("colsInput").value);
  initGrid(r,c);
  renderGrid();
});

document.getElementById("lineNumberToggle").addEventListener("change", (e) => {
  showLineNumbers = e.target.value === "on";
  renderGrid();
});

document.getElementById("knitTypeSelect").addEventListener("change", (e) => {
  knitType = e.target.value;
  renderGrid();
});

/* ===== INIT ===== */
renderPalette();
initGrid(rows, cols);
renderGrid();
applyTransform();
