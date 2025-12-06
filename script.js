const fileInput = document.getElementById('fileInput');
const userImg = document.getElementById('userImg');
const frameImg = document.getElementById('frameImg');
const scaleRange = document.getElementById('scale');
const posX = document.getElementById('posX');
const posY = document.getElementById('posY');
const downloadPng = document.getElementById('downloadPng');
const downloadJpg = document.getElementById('downloadJpg');
const resetBtn = document.getElementById('resetBtn');
const canvasHidden = document.getElementById('hiddenCanvas');

let imgObj = new Image();
let frameObj = new Image();
frameObj.src = 'frame.png';

let state = { scale:1, x:0, y:0 };

fileInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  imgObj = new Image();
  imgObj.onload = () => {
    userImg.src = url;
    // initial fit
    state.scale = 1;
    scaleRange.value = 1;
    posX.value = 0; posY.value = 0;
    applyTransform();
  };
  imgObj.src = url;
});

function applyTransform(){
  // adjust CSS transform to preview
  const s = parseFloat(scaleRange.value);
  const x = parseInt(posX.value,10);
  const y = parseInt(posY.value,10);
  state = { scale:s, x, y };
  userImg.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}

// connect sliders
scaleRange.addEventListener('input', applyTransform);
posX.addEventListener('input', applyTransform);
posY.addEventListener('input', applyTransform);

function renderFinal(format='png'){
  // canvas size should match preview box ratio
  const wrap = document.querySelector('.canvas-wrap');
  const W = 800; // final output width
  const H = Math.round(W * (wrap.clientHeight / wrap.clientWidth));
  canvasHidden.width = W; canvasHidden.height = H;
  const ctx = canvasHidden.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);

  // draw user image centered and scaled relative to preview
  if(imgObj && imgObj.complete){
    // compute scale to fit imgObj into canvas according to preview scaling
    const previewW = wrap.clientWidth;
    const previewH = wrap.clientHeight;
    // We will draw the image to cover the full canvas area then apply transforms
    const baseScale = Math.max(W / imgObj.width, H / imgObj.height);
    const drawW = imgObj.width * baseScale * state.scale;
    const drawH = imgObj.height * baseScale * state.scale;
    const cx = (W - drawW) / 2 + (state.x * (W / previewW));
    const cy = (H - drawH) / 2 + (state.y * (H / previewH));
    ctx.drawImage(imgObj, cx, cy, drawW, drawH);
  }

  // draw frame on top
  if(frameObj && frameObj.complete){
    ctx.drawImage(frameObj, 0, 0, W, H);
  }
  // return dataURL
  if(format==='png') return canvasHidden.toDataURL('image/png',1.0);
  // jpg
  return canvasHidden.toDataURL('image/jpeg',0.92);
}

downloadPng.addEventListener('click', ()=>{
  if(!imgObj.src) return alert('Please upload a photo first.');
  const data = renderFinal('png');
  const a = document.createElement('a');
  a.href = data; a.download = 'FTSC_reunion_frame.png'; a.click();
});

downloadJpg.addEventListener('click', ()=>{
  if(!imgObj.src) return alert('Please upload a photo first.');
  const data = renderFinal('jpg');
  const a = document.createElement('a');
  a.href = data; a.download = 'FTSC_reunion_frame.jpg'; a.click();
});

resetBtn.addEventListener('click', ()=>{
  scaleRange.value = 1; posX.value = 0; posY.value = 0; applyTransform();
});
