const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("canvas");
const overlay = document.getElementById("overlay");

let rows = 6;
let cols = 10;
let stitchColors = [];
let selectedColor = "#ff0000";
let isDrawing = false;

/* Layout */
const STITCH_SIZE = 80;
const ROW_SPACING = 0.8;

/* Zoom */
let zoom = 1;

/* Base SVG size */
const WIDTH = 900;
const HEIGHT = 700;

/* Stitch path */
const stitchPathData = `
m 0,0
c 0.0161,-1.85405 0.0151,-3.71528 -0.0418,-5.56693
-0.21376,-1.60508 -0.82301,-3.15569 -1.71114,-4.50377
-0.83955,-1.20233 -1.8919,0.15882 -2.47536,0.86493
-0.75126,0.76503 -1.39814,1.63108 -2.0184,2.506
-1.09808,1.67485 -2.19951,3.34692 -3.40046,4.94991
-0.46098,0.96625 -1.19549,1.81042 -1.24952,2.91779
-0.33647,1.91326 -0.25331,3.86606 -0.51202,5.7905
-0.14293,2.12408 -0.18126,4.25548 0.007,6.37822
-0.084,1.46207 0.009,2.94939 0.57817,4.31714
0.52977,0.82075 1.22534,-1.23227 1.77945,-1.62912
1.41695,-1.79237 2.33146,-3.93561 3.87033,-5.63961
0.80261,-0.8534 1.56054,-1.79847 2.48679,-2.50545
C -1.70964,6.6598 -1.02979,5.2123 -0.78582,3.66371
-0.50364,2.44765 -0.16887,1.23842 0,0
Z
`;

/* Initialize grid */
function initGrid(r, c) {
  rows = r;
  cols = c;
  stitchColors = Array.from({ length: rows }, () =>
    Array(cols).fill("#ffffff")
  );
}

/* Render grid */
function renderGrid() {
  svg.innerHTML = "";
  overlay.innerHTML = "";

  svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);

  const gridWidth = (cols - 1) * STITCH_SIZE;
  const gridHeight = (rows - 1) * STITCH_SIZE * ROW_SPACING;

  const offsetX = (WIDTH - gridWidth) / 2;
  const offsetY = (HEIGHT - gridHeight) / 2;

  /* STITCHES */
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      const g = document.createElementNS(svgNS, "g");
      const path = document.createElementNS(svgNS, "path");

      path.setAttribute("d", stitchPathData);
      path.setAttribute("fill", stitchColors[r][c]);
      path.setAttribute("stroke", "#000");
      path.setAttribute("stroke-width", "0.5");

      path.style.cursor = "pointer";

      path.addEventListener("mousedown", () => paint(r, c, path));
      path.addEventListener("mouseenter", (e) => {
        if (e.buttons === 1) paint(r, c, path);
      });

      function paint(r, c, path) {
        stitchColors[r][c] = selectedColor;
        path.setAttribute("fill", selectedColor);
      }

      g.appendChild(path);
      svg.appendChild(g);

      const bbox = path.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      const x = offsetX + c * STITCH_SIZE;
      const y = offsetY + r * STITCH_SIZE * ROW_SPACING;

      g.setAttribute(
        "transform",
        `translate(${x}, ${y}) translate(${-cx}, ${-cy})`
      );
    }
  }

  /* ROW NUMBERS */
  for (let r = 0; r < rows; r++) {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = r + 1;

    div.style.left = `${offsetX - 30}px`;
    div.style.top = `${offsetY + r * STITCH_SIZE * ROW_SPACING + (STITCH_SIZE * ROW_SPACING) / 2}px`;
    div.style.transform = "translateY(-50%)";

    overlay.appendChild(div);
  }

  /* COLUMN NUMBERS */
  for (let c = 0; c < cols; c++) {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = c + 1;

    div.style.left = `${offsetX + c * STITCH_SIZE}px`;
    div.style.top = `${offsetY + (rows - 1) * STITCH_SIZE * ROW_SPACING + 30}px`;

    overlay.appendChild(div);
  }
}

/* Zoom handling using viewBox */
function applyZoom() {
  const w = WIDTH / zoom;
  const h = HEIGHT / zoom;

  const x = (WIDTH - w) / 2;
  const y = (HEIGHT - h) / 2;

  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

/* Slider zoom */
const zoomSlider = document.getElementById("zoomSlider");

zoomSlider.addEventListener("input", (e) => {
  zoom = parseFloat(e.target.value);
  applyZoom();
});

/* Mouse wheel zoom (Ctrl + scroll) */
window.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;

  e.preventDefault();

  zoom += -e.deltaY * 0.0015;
  zoom = Math.min(2, Math.max(1, zoom));

  zoomSlider.value = zoom;
  applyZoom();
});

/* UI */
document.getElementById("applyGrid").onclick = () => {
  initGrid(
    parseInt(rowsInput.value),
    parseInt(colsInput.value)
  );
  renderGrid();
};

/* Init */
initGrid(rows, cols);
renderGrid();
applyZoom();
