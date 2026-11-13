import {defaults, fixtures, controls, shapeKeys, normalize, rotationExperiment, rotationMatrix, rotate, surfacePoint} from './model.js';
import {Renderer} from './renderer.js';
const $ = s => document.querySelector(s), canvas = $('#canvas');
let state = normalize(defaults), undo = [], renderer, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let dirty=true, origin=0, clock=performance.now(), lastFrame=0, frameCount=0, fpsClock=0;
function status(message){$('#notice').textContent=message;}
function remember(){undo.push({...state});if(undo.length>100)undo.shift();}
function pause(){playing=false;syncTransport();}
try { if(location.hash){state=normalize(JSON.parse(decodeURIComponent(location.hash.slice(1))));playing=false;} }
catch(e){status(e.message+' Default state loaded.');}
function format(key,value){return ['rx','ry','rz'].includes(key)?value+'°':key==='harmonics'?value+'×':key==='zoom'?value.toFixed(1):value.toFixed(2);}
function addControl(key,container){
  const [min,max,step,label,help]=controls[key],div=document.createElement('div');div.className='control';
  div.innerHTML=`<label for="${key}">${label}<output id="${key}Value"></output></label><input id="${key}" type="range" min="${min}" max="${max}" step="${step}"><small>${help}</small>`;
  $(container).append(div);const input=$('#'+key);
  input.addEventListener('pointerdown',()=>{remember();pause();});
  input.addEventListener('keydown',e=>{if(/Arrow|Home|End|Page/.test(e.key)){remember();pause();}});
  input.addEventListener('input',e=>{pause();state=normalize({...state,[key]:+e.target.value});dirty=true;sync();});
}
for(const key of shapeKeys)addControl(key,'#controls');
for(const key of ['rx','ry','rz','zoom'])addControl(key,'#view-controls');
function syncTransport(){
  $('#phase').value=state.phase;$('#phaseValue').textContent=String(Math.round(state.phase)%360).padStart(3,'0')+'°';
  $('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');
  if(!playing)$('#fps').textContent='PAUSED';
}
function explain(){
  const texts={
    Engineering:'Shape and view are separate. Drag rotates X/Y; Shift-drag rolls Z. Depth-tested geometry occludes its far side. Energy is an artistic control, not watts.',
    Mathematical:'p = ((R+a cos w)cos u, (R+a cos w)sin u, a sin w + h). View = Rz · Ry · Rx · p, followed by perspective projection.',
    'Art direction':'A dark solid shell supports luminous contours. Rotation reveals thickness, occlusion and parallax; light follows the same 3D surface.',
    'Reverse inference':'Want a side view? Change Y to 90°, leaving shape fixed. Want a larger tube? Change visual energy. A silhouette alone cannot uniquely identify a 3D object.',
    'Socratic inquiry':'Is the shape changing, or only your viewpoint? Pause, rotate one axis, then test distance invariance below. What observation would falsify your claim?'
  };$('#explanation').textContent=texts[$('#lens').value];
}
function sync(){
  for(const key in controls){$('#'+key).value=state[key];$('#'+key+'Value').textContent=format(key,state[key]);}
  const active=fixtures.findIndex(f=>shapeKeys.every(k=>Math.abs(f[k]-state[k])<1e-6));
  document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('selected',+b.dataset.preset===active));
  $('#scene').textContent=active<0?'CUSTOM — USER FIELD':['01 — RESONANCE','02 — SOLAR BLOOM','03 — AFTERGLOW'][active];
  $('#pose').textContent=`X ${state.rx}° / Y ${state.ry}° / Z ${state.rz}°`;
  $('#undo').disabled=undo.length===0;syncTransport();explain();
}
function setState(next){state=normalize(next);pause();dirty=true;sync();draw();}
function draw(){if(renderer){try{renderer.draw(state);dirty=false;}catch(e){pause();status(e.message);}}}
$('#lens').onchange=explain;
$('#play').onclick=()=>{playing=!playing;origin=state.phase;clock=performance.now();dirty=true;syncTransport();};
$('#phase').onpointerdown=()=>{remember();pause();};
$('#phase').onkeydown=e=>{if(/Arrow|Home|End|Page/.test(e.key)){remember();pause();}};
$('#phase').oninput=e=>setState({...state,phase:+e.target.value});
$('#undo').onclick=()=>{if(undo.length)setState(undo.pop());};
$('#reset').onclick=()=>{remember();setState(defaults);};
const views={front:{rx:0,ry:0,rz:0},side:{rx:0,ry:90,rz:0},top:{rx:90,ry:0,rz:0},home:{rx:defaults.rx,ry:defaults.ry,rz:defaults.rz,zoom:defaults.zoom}};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>{remember();setState({...state,...views[b.dataset.view]});};
for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>{remember();setState(fixtures[+b.dataset.preset]);};
let drag;
canvas.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;remember();pause();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,rx:state.rx,ry:state.ry,rz:state.rz,roll:e.shiftKey};
});
canvas.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  state=normalize({...state,...(drag.roll?{rz:drag.rz+dx*.4}:{rx:drag.rx+dy*.4,ry:drag.ry+dx*.4})});dirty=true;sync();
});
function endDrag(e){if(drag?.id===e.pointerId){drag=undefined;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',()=>{drag=undefined;});
canvas.addEventListener('keydown',e=>{
  const keys={ArrowLeft:['ry',-5],ArrowRight:['ry',5],ArrowUp:['rx',-5],ArrowDown:['rx',5]};
  if(keys[e.key]){e.preventDefault();remember();const [axis,delta]=keys[e.key];const key=e.shiftKey&&axis==='ry'?'rz':axis;setState({...state,[key]:state[key]+delta});}
  if(e.key==='Home'){e.preventDefault();remember();setState({...state,...views.home});}
});
async function share(){
  pause();state=normalize(state);sync();draw();const url=new URL(location.href);url.hash=encodeURIComponent(JSON.stringify(state));
  window.history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url.href);status('Copied exact shape, phase, X/Y/Z and camera. Opens paused.');}
  catch{status('Exact state saved in the address bar. Copy that URL to reproduce it.');}return url.href;
}
$('#share').onclick=share;
addEventListener('hashchange',()=>{try{const next=normalize(JSON.parse(decodeURIComponent(location.hash.slice(1))));remember();setState(next);}catch(e){status(e.message+' Current state retained.');}});
$('#capture').onclick=()=>{
  pause();draw();if(!renderer)return;const output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;
  const context=output.getContext('2d');context.fillStyle='#050b10';context.fillRect(0,0,output.width,output.height);context.drawImage(canvas,0,0);
  const a=document.createElement('a');a.download='aether-3d-'+Math.round(state.phase)+'.png';a.href=output.toDataURL();a.click();
};
$('#experiment').onclick=()=>{
  pause();const result=rotationExperiment(state);
  $('#experiment-result').textContent=`${result.pass?'PASS':'FAIL'} · ${result.samples} sampled points. Maximum radius error after X/Y/Z rotation: ${result.maxNormError.toExponential(2)} model units. Object depth: ${result.objectDepth.toFixed(3)} units. Rotation changes the view while preserving distance from the origin.`;
};
new ResizeObserver(()=>{dirty=true;}).observe(canvas);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();status('Graphics context lost. Reload to restore this saved state.');});
try{renderer=new Renderer(canvas);$('#mesh').textContent=renderer.stats.vertices.toLocaleString()+' VERTICES / DEPTH TESTED';}
catch(e){playing=false;status(e.message);$('#fps').textContent='UNAVAILABLE';}
function tick(t){
  if(playing&&renderer){state.phase=(origin+(t-clock)*.012)%360;dirty=true;syncTransport();}
  if(dirty&&renderer){draw();frameCount++;}
  if(playing&&t-fpsClock>1000){$('#fps').textContent=Math.round(frameCount*1000/(t-fpsClock))+' FPS';frameCount=0;fpsClock=t;}
  lastFrame=t;requestAnimationFrame(tick);
}
async function qa(){
  const saved={...state},was=playing;pause();const results=[];
  const check=(question,pass,measurement)=>results.push({question,pass:!!pass,measurement});
  const diff=(a,b)=>a.reduce((n,v,i)=>n+(v!==b[i]?1:0),0);
  check('GLSL ES 3.00 compile and link?',renderer&&renderer.gl.getProgramParameter(renderer.program,renderer.gl.LINK_STATUS),'3D vertex + fragment program');
  if(renderer){
    for(let i=0;i<fixtures.length;i++){
      const fixture=normalize(fixtures[i]),a=renderer.read(fixture),b=renderer.read(fixture);const delta=diff(a,b);
      check(`Fixture ${i}: exact same-device redraw?`,delta===0,delta+' differing bytes');
      let lit=0;for(let k=0;k<a.length;k+=4)if(a[k]+a[k+1]+a[k+2]>60)lit++;
      check(`Fixture ${i}: visible sculpture?`,lit>1000,lit+' lit pixels');
    }
    const base=normalize(defaults),front={...base,rx:0,ry:0,rz:0},a=renderer.read(front);
    for(const axis of ['rx','ry','rz']){
      const other={...front,[axis]:67},delta=diff(a,renderer.read(other));
      check(`${axis}: real view change?`,delta>1000,delta+' changed bytes');
    }
    const orbit=rotationExperiment(base);check('3D thickness and rigid rotation invariance?',orbit.pass,orbit);
    check('Full turn returns exact image?',diff(a,renderer.read(normalize({...front,ry:360})))===0,'canonical 360° → 0°');
    const baseline=renderer.read(base);renderer.read({...base,rx:-52,ry:37,rz:61});
    check('Returning to orientation restores pixels?',diff(baseline,renderer.read(base))===0,'exact readback after intervening rotation');
    const normalized=normalize({...base,energy:999,harmonics:-20,twist:Infinity,zoom:-4,rx:720,phase:-1});
    check('Hostile input stays bounded?',normalized.energy===1&&normalized.harmonics===3&&normalized.twist===defaults.twist&&normalized.zoom===2.8&&normalized.rx===0&&normalized.phase===359,normalized);
    check('Energy alters geometry?',Math.abs(surfacePoint(0,0,base)[0]-surfacePoint(0,0,{...base,energy:1})[0])>.01,'model-space radius comparison');
    // Readback forces completed output, not merely command submission. Warm up first.
    renderer.read(base);const started=performance.now();for(let i=0;i<10;i++)renderer.read({...base,phase:i*12});
    const ms=(performance.now()-started)/10;check('Completed rendering under 33.34 ms?',ms<33.34,{msPerFrame:+ms.toFixed(2),width:canvas.width,height:canvas.height,includesReadback:true});
    const gl=renderer.gl;check('Healthy depth-tested WebGL context?',!gl.isContextLost()&&gl.getError()===gl.NO_ERROR&&gl.isEnabled(gl.DEPTH_TEST),renderer.stats);
  }
  state=saved;playing=was;origin=state.phase;clock=performance.now();dirty=true;sync();draw();
  $('#results').hidden=false;$('#results').textContent=JSON.stringify(results,null,2);window.qaResults=results;return results;
}
$('#qa').onclick=qa;
window.aether={qa,fixtures,defaults,get state(){return {...state};},setState,draw,share,rotationExperiment:()=>rotationExperiment(state),get stats(){return renderer?.stats;}};
sync();origin=state.phase;clock=performance.now();requestAnimationFrame(tick);
