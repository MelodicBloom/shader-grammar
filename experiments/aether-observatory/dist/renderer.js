import {rotationMatrix} from './model.js';
const vertex = `#version 300 es
precision highp float;
in vec2 uv;
uniform mat3 rotation;
uniform float energy, harmonics, twist, phase, cameraDistance, aspect;
out vec3 worldPosition;
out float strand, angle;
const float PI=3.141592653589793;
vec3 field(vec2 t){
  float major=.76+.12*energy+.09*sin(harmonics*t.x+phase);
  float tube=.22+.07*energy;
  float winding=t.y+twist*PI*sin(2.*t.x+phase);
  float r=major+tube*cos(winding);
  return vec3(r*cos(t.x),r*sin(t.x),tube*sin(winding)+.055*energy*sin(harmonics*t.x+phase));
}
void main(){
  vec3 p=rotation*field(uv);
  worldPosition=p;strand=uv.y;angle=uv.x;
  float depth=cameraDistance-p.z;
  float f=2.605089; // cot(42 degrees / 2)
  float near=.1,far=30.;
  gl_Position=vec4(p.x*f/aspect,p.y*f,(far+near)/(far-near)*depth-2.*far*near/(far-near),depth);
  gl_PointSize=clamp(11./depth,1.,5.);
}`;
const fragment = `#version 300 es
precision highp float;
in vec3 worldPosition;
in float strand, angle;
uniform float hue,energy,phase;
uniform int mode;
out vec4 color;
vec3 palette(float t){return .52+.48*cos(6.2831853*(vec3(0.,.20,.38)+t));}
void main(){
  vec3 tint=palette(hue+.055*sin(strand)+.035*cos(angle));
  if(mode==0){
    vec3 n=normalize(cross(dFdx(worldPosition),dFdy(worldPosition)));
    float light=.25+.75*abs(dot(n,normalize(vec3(-.4,.8,1.))));
    color=vec4(vec3(.006,.012,.018)+tint*.06*light,1.);
  }else{
    float pulse=.65+.35*pow(.5+.5*cos(3.*angle+strand-phase),6.);
    float front=.65+.35*clamp(worldPosition.z+.5,0.,1.);
    float alpha=mode==2?.35:.9;
    if(mode==2){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;alpha*=pow(1.-r,2.);}
    color=vec4(tint*(.8+energy*.8)*pulse*front,alpha);
  }
}`;
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = this.gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: true, alpha: true});
    if (!gl) throw Error('WebGL 2 is required. Enable hardware acceleration or try a WebGL 2 browser.');
    const compile = (type, code) => {
      const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p=this.program=gl.createProgram();
    gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    this.uniforms=Object.fromEntries(['rotation','energy','harmonics','twist','phase','cameraDistance','aspect','hue','mode'].map(k=>[k,gl.getUniformLocation(p,k)]));
    this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
    const U=192,V=48,uv=[],faces=[],lines=[],points=[];
    for(let i=0;i<=U;i++)for(let j=0;j<=V;j++)uv.push(i/U*2*Math.PI,j/V*2*Math.PI);
    const id=(i,j)=>i*(V+1)+j;
    for(let i=0;i<U;i++)for(let j=0;j<V;j++){
      const a=id(i,j),b=id(i+1,j),c=id(i+1,j+1),d=id(i,j+1);
      faces.push(a,b,c,a,c,d);lines.push(a,b);
      if(i%8===0)lines.push(a,d);
      if(i%6===0&&j%3===0)points.push(a);
    }
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uv),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(p,'uv');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    this.meshes=[faces,lines,points].map(indices=>{
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
      return {buffer,count:indices.length};
    });
    this.stats={draws:0,vertices:uv.length/2,triangles:faces.length/3,segments:lines.length/2};
  }
  draw(state) {
    const {canvas,gl,uniforms:u}=this;this.stats.draws++;
    if(gl.isContextLost())throw Error('WebGL context lost. Reload to restore the renderer.');
    const ratio=Math.min(devicePixelRatio,1.5),w=Math.max(1,Math.round(canvas.clientWidth*ratio)),h=Math.max(1,Math.round(canvas.clientHeight*ratio));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);gl.bindVertexArray(this.vao);
    gl.uniformMatrix3fv(u.rotation,false,new Float32Array(rotationMatrix(state)));
    for(const k of ['energy','harmonics','twist','hue'])gl.uniform1f(u[k],state[k]);
    gl.uniform1f(u.phase,state.phase*Math.PI/180);gl.uniform1f(u.aspect,w/h);
    // Keep the whole sculpture framed in portrait without changing its geometry.
    gl.uniform1f(u.cameraDistance,state.zoom/Math.min(1,w/h));
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);
    gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
    this.pass(0,gl.TRIANGLES);gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
    this.pass(1,gl.LINES);this.pass(2,gl.POINTS);gl.depthMask(true);gl.disable(gl.BLEND);
  }
  pass(index,primitive){const {gl}=this;gl.uniform1i(this.uniforms.mode,index);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.meshes[index].buffer);gl.drawElements(primitive,this.meshes[index].count,gl.UNSIGNED_SHORT,0);}
  read(state){this.draw(state);const {gl,canvas}=this;const p=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,p);return p;}
}
