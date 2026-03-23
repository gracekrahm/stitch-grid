const svgNS = "http://www.w3.org/2000/svg";
const svg = document.getElementById("canvas");
const overlay = document.getElementById("overlay");

let rows = 6, cols = 10;
let selectedColor = "#ff0000";
let stitchColors = [];
let isDrawing = false;

/* GAUGE */
const STITCH_SIZE = 97;
const ROW_SPACING = 0.79;

/* ZOOM */
let zoomLevel = 1;
const zoomSlider = document.getElementById("zoomSlider");

/* STITCH PATH */
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

const defaultColors = ["#ffffff","#000000","#ff0000","#0000ff","#00aa00","#ffff00","#ff00ff","#00ffff","#888888"];
let paletteColors = [...defaultColors];
const paletteDiv = document.getElementById("palette");

function renderPalette() {
  paletteDiv.innerHTML = "";
  paletteColors.forEach(color=>{
    const swatch=document.createElement("div");
    swatch.className="swatch";
    swatch.style.background=color;
    swatch.onclick=()=>selectedColor=color;
    paletteDiv.appendChild(swatch);
  });
}

document.getElementById("saveColor").onclick = ()=>{
  const color = document.getElementById("colorPicker").value;
  if(!paletteColors.includes(color)) paletteColors.push(color);
  renderPalette();
  selectedColor=color;
}

function initGrid(r,c){
  rows=r; cols=c;
  stitchColors=Array.from({length:rows},()=>Array(cols).fill("#ffffff"));
}

function renderGrid(){
  svg.innerHTML="";
  overlay.innerHTML="";
  const canvasWidth=900, canvasHeight=700;
  const gridWidth=(cols-1)*STITCH_SIZE;
  const gridHeight=(rows-1)*STITCH_SIZE*ROW_SPACING;
  const offsetX=(canvasWidth-gridWidth)/2;
  const offsetY=(canvasHeight-gridHeight)/2;

  // STITCHES
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const group=document.createElementNS(svgNS,"g");
      const path=document.createElementNS(svgNS,"path");
      path.setAttribute("d",stitchPathData);
      path.setAttribute("stroke","#000");
      path.setAttribute("fill",stitchColors[r][c]);
      path.setAttribute("stroke-width","0.5");
      path.style.cursor="pointer";

      path.addEventListener("mousedown",()=>{
        isDrawing=true; paint();
      });
      path.addEventListener("mouseenter",()=>{
        if(isDrawing) paint();
      });
      function paint(){
        stitchColors[r][c]=selectedColor;
        path.setAttribute("fill",selectedColor);
      }

      group.appendChild(path);
      svg.appendChild(group);

      const bbox=path.getBBox();
      const cx=bbox.x+bbox.width/2;
      const cy=bbox.y+bbox.height/2;
      group.setAttribute("transform",
        `translate(${offsetX + c*STITCH_SIZE}, ${offsetY + r*STITCH_SIZE*ROW_SPACING}) translate(${-cx}, ${-cy}) scale(1)`
      );
    }
  }

  // LINE NUMBERS OVERLAY
  for(let r=0;r<rows;r++){
    const div=document.createElement("div");
    div.textContent=r+1;
    div.style.position="absolute";
    div.style.left=`${offsetX-30}px`;
    div.style.top=`${offsetY + r*STITCH_SIZE*ROW_SPACING + (STITCH_SIZE*ROW_SPACING)/2}px`;
    div.style.transform="translateY(-50%)";
    div.style.fontWeight="bold";
    div.style.color="#000";
    div.style.fontSize="14px";
    div.style.width="20px";
    div.style.textAlign="right";
    overlay.appendChild(div);
  }
  for(let c=0;c<cols;c++){
    const div=document.createElement("div");
    div.textContent=c+1;
    div.style.position="absolute";
    div.style.left=`${offsetX + c*STITCH_SIZE + STITCH_SIZE/2}px`;
    div.style.top=`${offsetY + rows*STITCH_SIZE*ROW_SPACING + 5}px`;
    div.style.transform="translateX(-50%)";
    div.style.fontWeight="bold";
    div.style.color="#000";
    div.style.fontSize="14px";
    div.style.textAlign="center";
    overlay.appendChild(div);
  }
}

/* EVENTS */
window.addEventListener("mouseup",()=>{isDrawing=false;});

document.getElementById("applyGrid").onclick=()=>{
  const r=parseInt(document.getElementById("rowsInput").value);
  const c=parseInt(document.getElementById("colsInput").value);
  initGrid(r,c);
  renderGrid();
};

document.getElementById("colorPicker").oninput=(e)=>{selectedColor=e.target.value;}

/* ZOOM */
zoomSlider.addEventListener("input",(e)=>{
  zoomLevel=parseFloat(e.target.value);
  applyZoom();
});

window.addEventListener("wheel",(e)=>{
  if(!e.ctrlKey) return;
  e.preventDefault();
  const delta=-e.deltaY*0.001;
  zoomLevel+=delta;
  zoomLevel=Math.min(2,Math.max(1,zoomLevel));
  zoomSlider.value=zoomLevel;
  applyZoom();
});

function applyZoom(){
  svg.style.transformOrigin="top left";
  svg.style.transform=`scale(${zoomLevel})`;
  overlay.style.transform=`scale(${zoomLevel})`;
}

/* INIT */
renderPalette();
initGrid(rows,cols);
renderGrid();
applyZoom();
