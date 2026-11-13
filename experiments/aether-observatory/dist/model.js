// A deterministic artistic surface, in dimensionless model units.
export const TAU = 2 * Math.PI;
export const shapeKeys = ['energy', 'harmonics', 'twist', 'hue'];
export const defaults = Object.freeze({version: 2, energy: .65, harmonics: 6, twist: .38, hue: .48, phase: 0, rx: 52, ry: -18, rz: 16, zoom: 4.2});
export const fixtures = [
  {...defaults},
  {...defaults, energy: .9, harmonics: 9, twist: .72, hue: .08, phase: 90, rx: 38, ry: 24, rz: -12},
  {...defaults, energy: .35, harmonics: 4, twist: .18, hue: .72, phase: 180, rx: 68, ry: -28, rz: 32}
];
export const controls = {
  energy: [0, 1, .01, 'Energy · visual', 'Radial expansion & emission; dimensionless'],
  harmonics: [3, 12, 1, 'Harmonics', 'Number of major-radius lobes'],
  twist: [0, 1, .01, 'Torsion', 'Periodic tube winding / 0–1'],
  hue: [0, 1, .01, 'Spectrum', 'Palette offset / 0–1 cycle'],
  rx: [-180, 180, 1, 'X · pitch', 'Rotate about the X axis'],
  ry: [-180, 180, 1, 'Y · yaw', 'Rotate about the Y axis'],
  rz: [-180, 180, 1, 'Z · roll', 'Rotate about the Z axis'],
  zoom: [2.8, 6.5, .1, 'Camera distance', 'Model units; smaller is closer']
};
export function wrapAngle(n) { return ((n + 180) % 360 + 360) % 360 - 180; }
export function normalize(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Error('State must be an object.');
  if (input.version !== undefined && input.version !== 2) throw Error('Unsupported state version.');
  const output = {version: 2};
  for (const [key, [min, max, step]] of Object.entries(controls)) {
    let value = Number(input[key] ?? defaults[key]);
    if (!Number.isFinite(value)) value = defaults[key];
    if (['rx', 'ry', 'rz'].includes(key)) value = wrapAngle(value);
    output[key] = +((Math.round(Math.max(min, Math.min(max, value)) / step) * step).toFixed(4));
  }
  const p = Number(input.phase ?? defaults.phase);
  output.phase = Number.isFinite(p) ? +(((p % 360 + 360) % 360).toFixed(3)) % 360 : 0;
  return output;
}
export function rotationMatrix(state) {
  const [x, y, z] = [state.rx, state.ry, state.rz].map(v => wrapAngle(v) * Math.PI / 180);
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  // Column-major Rz * Ry * Rx; exactly this matrix is sent to the vertex shader.
  return [cz*cy, sz*cy, -sy, cz*sy*sx-sz*cx, sz*sy*sx+cz*cx, cy*sx, cz*sy*cx+sz*sx, sz*sy*cx-cz*sx, cy*cx];
}
export function rotate(p, matrix) {
  return [0,1,2].map(i => matrix[i]*p[0] + matrix[i+3]*p[1] + matrix[i+6]*p[2]);
}
export function surfacePoint(u, v, state) {
  const phase = state.phase * Math.PI / 180;
  const major = .76 + .12*state.energy + .09*Math.sin(state.harmonics*u + phase);
  const tube = .22 + .07*state.energy;
  const winding = v + state.twist*Math.PI*Math.sin(2*u + phase);
  const r = major + tube*Math.cos(winding);
  return [r*Math.cos(u), r*Math.sin(u), tube*Math.sin(winding) + .055*state.energy*Math.sin(state.harmonics*u + phase)];
}
export function rotationExperiment(state) {
  const matrix = rotationMatrix(state);
  let maxNormError = 0, minZ = Infinity, maxZ = -Infinity;
  for (let i=0; i<32; i++) for (let j=0; j<16; j++) {
    const p = surfacePoint(i*TAU/32, j*TAU/16, state), q = rotate(p, matrix);
    maxNormError = Math.max(maxNormError, Math.abs(Math.hypot(...p)-Math.hypot(...q)));
    minZ = Math.min(minZ, p[2]); maxZ = Math.max(maxZ, p[2]);
  }
  return {samples: 512, maxNormError, objectDepth: maxZ-minZ, pass: maxNormError < 1e-10 && maxZ-minZ > .3};
}
