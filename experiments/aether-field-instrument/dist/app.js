const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
export const fixtures=[
 {name:'Resonance',energy:.48,coherence:.72,symmetry:5,palette:0,time:12,yaw:.28,pitch:.44,seed:314},
 {name:'Bloom',energy:.24,coherence:.38,symmetry:8,palette:0,time:8,yaw:.1,pitch:.85,seed:314},
 {name:'Vortex',energy:.86,coherence:.88,symmetry:3,palette:1,time:18,yaw:-.4,pitch:.22,seed:314}
];
const limits={energy:[0,1],coherence:[0,1],symmetry:[2,12],palette:[0,2],time:[0,60],yaw:[-Math.PI,Math.PI],pitch:[-Math.PI,Math.PI],seed:[1,9999]};
export function normalize(input){const result={};for(const [k,[lo,hi]] of Object.entries(limits)){let n=Number(input[k]);if(!Number.isFinite(n))n=fixtures[0][k];result[k]=Math.max(lo,Math.min(hi,n));if(['symmetry','palette','seed'].includes(k))result[k]=Math.round(result[k]);}return result;}
let state=normalize(fixtures[0]),history=[],playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,selected=0;
try{if(location.hash.startsWith('#state=')){state=normalize(JSON.parse(decodeURIComponent(location.hash.slice(7))));playing=false;selected=-1;}}catch{history.replaceState?.(null,'',location.pathname);}
const canvas=$('#field'),gl=canvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:true});
const vertex=`#version 300 es
precision highp float;
uniform vec2 resolution;uniform float time,energy,coherence,symmetry,yaw,pitch,seed;uniform int palette;
out vec3 color;out float brightness;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 float id=float(gl_VertexID),u=mod(id,720.)/720.,v=floor(id/720.)/180.;
 float a=u*6.28318530718, b=v*6.28318530718, t=time*.17;
 float winding=symmetry;
 float wobble=sin(a*winding+t+b*.35)*energy;
 float major=1.52+.13*cos(a*winding-t)+.14*energy*sin(a*3.+t);
 float tube=.38+.16*sin(a*winding+t)+energy*.18;
 float twist=b+a*(2.+floor(symmetry*.5))+t;
 float ribbon=sin(b*13.+a*winding-t)*(.018+.085*(1.-coherence));
 float r=major+(tube+ribbon)*cos(twist)+wobble*.20;
 vec3 p=vec3(r*cos(a),r*sin(a),(tube+ribbon)*sin(twist)*(.8+energy*.5));
 p.z+=energy*.20*sin(a*winding-t+b);
 p.xy=rot(yaw*.45)*p.xy;p.yz=rot(pitch+.38)*p.yz;p.xz=rot(-.24+yaw*.4)*p.xz;
 float depth=4.8-p.z;vec2 screen=p.xy*1.9/depth;
 float aspect=resolution.x/resolution.y;
 screen*=min(aspect,1.);screen.x/=aspect;
 screen+=vec2(aspect>1.0?.15:0.,aspect>1.0?-.16:-.33);
 gl_Position=vec4(screen,0.,1.);
 float h=fract(sin(id*127.1+seed*31.7)*43758.5453);
 gl_PointSize=clamp((.7+h*.8)*(resolution.y/700.)*(4.8/depth),.65,2.8);
 float glow=.5+.5*sin(a*winding-t+b*2.);
 color=mix(vec3(.44,.61,.24),vec3(.96,.72,.34),.5+.5*sin(twist+a));
 color=mix(color,vec3(.84,.96,.59),pow(glow,3.)*.75);
 if(palette==1)color=mix(vec3(.22,.44,.9),vec3(.53,1.,.84),.5+.5*sin(twist+a));
 if(palette==2)color=mix(vec3(.40,.29,.86),vec3(1.,.55,.72),.5+.5*sin(twist+a));
 brightness=(.32+.72*glow)*(.55+.45*h)*(1.+energy*.35);
}`;
const fragment=`#version 300 es
precision highp float;in vec3 color;in float brightness;out vec4 outColor;
void main(){float d=length(gl_PointCoord-.5)*2.;float soft=exp(-d*d*3.);outColor=vec4(color*brightness*soft,1.);}`;
const bgVert=`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const bgFrag=`#version 300 es
precision highp float;uniform vec2 resolution;out vec4 outColor;
void main(){vec2 uv=gl_FragCoord.xy/resolution;float aspect=resolution.x/resolution.y;vec2 p=(uv-.5)*vec2(aspect,1.);p-=vec2(aspect>1.?.075:0.,aspect>1.?-.105:-.165);float r=length(p);vec3 c=vec3(.025,.037,.034);c+=vec3(.025,.032,.012)*exp(-r*r*7.);float ring=pow(.5+.5*cos(r*110.),90.)*.012*step(.22,r)*step(r,.68);c+=vec3(.60,.68,.42)*ring;float grid=step(.993,fract(uv.x*resolution.x/55.))*step(.993,fract(uv.y*resolution.y/55.));c+=grid*.06;float n=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);c+=n*.006;outColor=vec4(c,1.);}`;
function program(v,f){const p=gl.createProgram();for(const [type,src] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
let field,bg,locations={};
function resize(){const dpr=Math.min(devicePixelRatio,1.75);const w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);}
function render(){if(!field)return;resize();gl.disable(gl.BLEND);gl.useProgram(bg);gl.uniform2f(gl.getUniformLocation(bg,'resolution'),canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(field);gl.uniform2f(locations.resolution,canvas.width,canvas.height);for(const k of Object.keys(limits)){if(k==='palette')gl.uniform1i(locations[k],state[k]);else gl.uniform1f(locations[k],k==='time'?Math.round(state.time*60)/60:state[k]);}gl.drawArrays(gl.POINTS,0,129600);}
try{if(!gl)throw Error('WebGL 2 is required. Open this instrument in a browser with hardware acceleration.');field=program(vertex,fragment);bg=program(bgVert,bgFrag);for(const k of ['resolution',...Object.keys(limits)])locations[k]=gl.getUniformLocation(field,k);gl.bindVertexArray(gl.createVertexArray());}catch(e){$('#error').hidden=false;$('#error').textContent=e.message;$('#performance').textContent='RENDERER UNAVAILABLE';}
const descriptions={energy:['Energy','Distortion amplitude · 0 → 1',.01],coherence:['Coherence','Wave alignment · scattered → ordered',.01],symmetry:['Symmetry','Rotational sectors · 2 → 12',1]};
for(const [key,[label,help,step]] of Object.entries(descriptions)){$('#parameters').insertAdjacentHTML('beforeend',`<div class="parameter"><div class="param-top"><label for="${key}">${label}</label><output id="${key}Value"></output></div><div class="param-help" id="${key}Help">${help}</div><input type="range" id="${key}" min="${limits[key][0]}" max="${limits[key][1]}" step="${step}" aria-describedby="${key}Help"></div>`);const el=$('#'+key);el.addEventListener('pointerdown',remember);el.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End','ArrowUp','ArrowDown'].includes(e.key))remember();});el.addEventListener('input',()=>{state=normalize({...state,[key]:el.value});selected=-1;sync();render();});}
function remember(){history.push({...state});if(history.length>50)history.shift();$('#undo').disabled=false;}
function sync(){for(const key of Object.keys(descriptions)){const el=$('#'+key);el.value=state[key];el.style.setProperty('--fill',`${(state[key]-limits[key][0])/(limits[key][1]-limits[key][0])*100}%`);$('#'+key+'Value').value=key==='symmetry'?`${state[key]}-fold`:state[key].toFixed(2);}$$('[data-preset]').forEach((e,i)=>{e.classList.toggle('active',i===selected);e.setAttribute('aria-pressed',i===selected);});$$('[data-palette]').forEach((e,i)=>{e.classList.toggle('selected',i===state.palette);e.setAttribute('aria-pressed',i===state.palette);});$('#figure').textContent=selected<0?'CUSTOM FIELD':fixtures[selected].name.toUpperCase();syncTime();$('#play').textContent=playing?'Ⅱ':'▶';$('#play').setAttribute('aria-label',playing?'Pause animation':'Play animation');$('#motionStatus').textContent=playing?'FIELD IN MOTION':'MOMENT HELD';$('#undo').disabled=!history.length;}
function syncTime(){$('#time').value=state.time;$('#time').style.setProperty('--fill',`${state.time/60*100}%`);$('#timeValue').value=state.time.toFixed(2);$('#phaseLabel').textContent=(state.time/60).toFixed(3);}
$$('[data-preset]').forEach((el,i)=>el.onclick=()=>{remember();state=normalize(fixtures[i]);selected=i;sync();render();toast(`${fixtures[i].name} · fixture restored`);});
$$('[data-palette]').forEach((el,i)=>el.onclick=()=>{remember();state.palette=i;sync();render();});
$('#play').onclick=()=>{playing=!playing;sync();};
$('#time').onpointerdown=remember;$('#time').onkeydown=e=>{if(e.key.startsWith('Arrow')||['Home','End'].includes(e.key))remember();};$('#time').oninput=e=>{playing=false;state.time=+e.target.value;sync();render();};
$('#reset').onclick=()=>{remember();state=normalize(fixtures[0]);selected=0;sync();render();};
$('#undo').onclick=()=>{if(!history.length)return;state=history.pop();selected=-1;playing=false;sync();render();};
let drag;canvas.onpointerdown=e=>{remember();drag={x:e.clientX,y:e.clientY,yaw:state.yaw,pitch:state.pitch};canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;state=normalize({...state,yaw:drag.yaw+(e.clientX-drag.x)*.008,pitch:drag.pitch+(e.clientY-drag.y)*.008});selected=-1;sync();render();};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),2500);}
$('#share').onclick=async()=>{playing=false;sync();const url=location.href.split('#')[0]+'#state='+encodeURIComponent(JSON.stringify(state));window.history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url);toast('Exact state link copied');}catch{toast('State saved in address bar. Copy the URL.');}};
$('#capture').onclick=()=>{render();const a=document.createElement('a');a.download=`aether-${Math.round(state.time*60)}.png`;a.href=canvas.toDataURL('image/png');a.click();toast('Moment captured');};
$('#about').onclick=()=>$('#info').showModal();$('.close').onclick=()=>$('#info').close();
function hash(){render();const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let h=2166136261;for(const p of pixels)h=Math.imul(h^p,16777619);return (h>>>0).toString(16);}
export function challenge(){const before={...state},wasPlaying=playing;playing=false;const checks=[];const check=(question,pass,detail)=>checks.push({question,pass,detail});try{state=normalize(fixtures[0]);const a=hash(),b=hash();check('Can the same frame reproduce exactly?',a===b,`${a} / ${b}`);state.energy=1;const c=hash();check('Does energy change the rendered outcome?',c!==a,`${a} → ${c}`);state.energy=fixtures[0].energy;check('Can the edit be reversed exactly?',hash()===a,`restored ${hash()}`);const hashes=fixtures.map(f=>{state=normalize(f);return hash();});check('Are all fixtures visually distinct?',new Set(hashes).size===3,hashes.join(' / '));const bad=normalize({energy:999,coherence:-9,symmetry:25,time:Infinity,palette:8,yaw:99,pitch:-99,seed:0});check('Are hostile inputs bounded?',bad.energy===1&&bad.coherence===0&&bad.symmetry===12&&bad.palette===2&&bad.yaw===Math.PI&&bad.seed===1,JSON.stringify(bad));check('Did the GPU report an error?',gl.getError()===gl.NO_ERROR,'WebGL error code 0 expected');}finally{state=before;playing=wasPlaying;sync();render();}return checks;}
$('#challenge').onclick=()=>{const results=challenge();$('#qa').textContent=`SYSTEM CHALLENGE — ${results.filter(x=>x.pass).length}/${results.length} PASS\n\n`+results.map(x=>`${x.pass?'PASS':'FAIL'} · ${x.question}\n${x.detail}`).join('\n\n');$('#info').showModal();};
window.aether={getState:()=>({...state}),setState:s=>{playing=false;state=normalize(s);sync();render();},fixtures,challenge,hash,render};
let last=0,frames=0,perfStart=0;function animate(now){if(last&&playing){state.time=(state.time+Math.min((now-last)/1000,.1))%60;syncTime();}last=now;if(field&&(playing||canvas.width!==Math.round(canvas.clientWidth*Math.min(devicePixelRatio,1.75))||canvas.height!==Math.round(canvas.clientHeight*Math.min(devicePixelRatio,1.75)))){render();frames++;}if(now-perfStart>1500){$('#performance').textContent=`${playing?Math.round(frames*1000/(now-perfStart))+' FPS':'PAUSED'} · 129,600 POINTS · SEED 314`;frames=0;perfStart=now;}requestAnimationFrame(animate);}sync();requestAnimationFrame(animate);
