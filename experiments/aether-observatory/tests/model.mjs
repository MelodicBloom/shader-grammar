import assert from 'node:assert/strict';
import {defaults,normalize,rotationMatrix,rotate,surfacePoint,rotationExperiment} from '../dist/model.js';
const state=normalize(defaults);
assert.equal(normalize({...state,rx:360,ry:-720}).rx,0);
assert.equal(normalize({...state,rx:360,ry:-720}).ry,0);
assert.equal(normalize({...state,energy:Infinity}).energy,defaults.energy);
assert.equal(normalize({...state,harmonics:100,zoom:-10}).harmonics,12);
assert.equal(normalize({...state,harmonics:100,zoom:-10}).zoom,2.8);
assert.throws(()=>normalize({version:99}));assert.throws(()=>normalize(null));
const p=surfacePoint(.33,.89,state),q=surfacePoint(1.8,2.5,state);
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
for(const orientation of [{rx:90,ry:0,rz:0},{rx:0,ry:90,rz:0},{rx:0,ry:0,rz:90},{rx:52,ry:-18,rz:16}]){
 const m=rotationMatrix({...state,...orientation});assert.ok(Math.abs(distance(p,q)-distance(rotate(p,m),rotate(q,m)))<1e-12);
}
assert.deepEqual(rotate([0,1,0],rotationMatrix({...state,rx:90,ry:0,rz:0})).map(x=>Math.round(x)),[0,0,1]);
assert.ok(rotationExperiment(state).pass);
for(const i of [0,.4,2.8])for(const v of [0,.7,3]){
 assert.ok(distance(surfacePoint(i,v,state),surfacePoint(i,v,{...state,phase:360}))<1e-12);
 assert.ok(distance(surfacePoint(i,v,state),surfacePoint(i+2*Math.PI,v,state))<1e-12);
}
console.log('PASS: canonical angles, bounds, versions, rotation convention, pairwise invariance, nonzero depth, periodic seams.');
