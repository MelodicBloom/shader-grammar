# AETHER / Spatial Energy Observatory — v2

A reproducible GLSL ES 3.00 sculpture with actual 3D geometry, a depth buffer, perspective projection and independent X/Y/Z rotation. No rendering library, server or random state.

## Run and explore

Serve `dist/` with any static server, e.g. `python -m http.server 8080 --directory dist`.

- Drag the sculpture to rotate X/Y. Shift-drag rolls Z. Touch drag works too.
- Use explicit X/Y/Z sliders, camera distance and Front / Side / Edge / Home views.
- Focus the canvas: arrows rotate X/Y, Shift-left/right rolls Z, Home restores the default view.
- Shape sliders alter geometry. All edits pause animation for controlled comparisons.
- Undo restores an entire drag and its original phase, shape and camera. Reset restores fixture zero.
- Copy state saves version, shape, phase, all axes and camera distance. Links open paused.
- Export frame captures the current view as a PNG.
- The Socratic experiment measures rotation invariance on 512 model points.
- The on-page QA button repeats deterministic GPU checks on your device.

Reduced-motion preference starts paused. A paused instrument does not redraw unchanged frames. Animation changes phase at 12 degrees per second, based on elapsed playback time; it does not silently spin the camera.

## Done / failure

Done: a linked 3D shader, visible depth and occlusion, independent X/Y/Z controls, reversible gestures, exact state replay, responsive UI, measured QA, a reviewable repository and a deployed runtime. Failure: planar image warping presented as 3D, a rotation that deforms the mesh, unbounded or nonfinite inputs, broken replay, shader errors or an unverified runtime.

Completed render time under 33.34ms is the 30 FPS target. CI reports software-GPU timing separately and keeps any failed performance assertion visible. Physical GPU performance requires physical GPU evidence. A passing functional CI job does not mean a failed timing assertion passed.

## Method → action → outcome

1. **Determinism:** evaluate an analytic 3D parameterization directly from saved inputs → no accumulated particle simulation → any phase is seekable and reproducible.
2. **Engineering:** use a triangulated toroidal mesh with depth testing → near surfaces occlude distant ones → real thickness and spatial orientation, with no screen-pixel loop over 48 curves.
3. **Mathematics:** apply an orthogonal `Rz * Ry * Rx` matrix, then perspective → separate camera orientation from deformation → rotation preserves model distances. Tests check pairwise distance and radius invariance.
4. **Socratic inquiry:** ask “did the object change or only its view?” → hold shape fixed, rotate, test an invariant → the question has a falsifiable numerical answer.
5. **Reverse engineering:** distinguish desired observations from controls → side view changes Y; tube size changes visual energy → explicit forward relations. A single silhouette cannot uniquely identify arbitrary 3D geometry; no image-to-physics inverse solver is claimed.
6. **Art direction:** dark surfaces with luminous contour lines → a readable layered silhouette with occlusion and depth. The surface is an artistic construction, not a physical field solver.

Lenses explain the same state without changing its parameters. They are bounded text modes, not AI personas or external AI services.

## Geometry and controls

`R=.76+.12E+.09sin(nu+phase)`, `a=.22+.07E`, `w=v+T*pi*sin(2u+phase)`.

`p=((R+a cos w)cos u, (R+a cos w)sin u, a sin w+.055E sin(nu+phase))`.

The mesh has 9,457 vertices, 18,432 triangles and 10,368 contour segments. `model.js` contains the CPU reference; `renderer.js` evaluates the same equation in the GLSL vertex shader. A depth-tested surface pass is followed by luminous line and point passes. The perspective field of view is 42 degrees. Portrait framing scales camera distance by `1/min(1,aspect)`; saved zoom and viewport together determine the projection.

| Control | Bounds / meaning |
|---|---|
| Visual energy E | 0–1, radial expansion, tube radius and emission; not watts or joules |
| Harmonics n | Integer 3–12, major-radius lobes |
| Torsion T | 0–1, periodic tube winding |
| Spectrum | 0–1, palette offset |
| Phase | 0–360 degrees, canonical modulo 360 |
| X/Y/Z | Canonical -180 to <180 degrees; full turns are equivalent |
| Camera distance | 2.8–6.5 dimensionless model units |

Angles are quantized to whole degrees for edits, shape values to .01 and shared phase to .001 degree. Pixel ratio is capped at 1.5. Same-device determinism is verified at fixed dimensions; cross-GPU rasterization differences are possible. Version-1 links without a version adopt the new 3D geometry and default camera; they do not reproduce the retired 2D pixels. Unsupported future versions are rejected visibly.

## Known fixtures

| Fixture | E | n | T | Spectrum | Phase | X | Y | Z | Distance |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Resonance | .65 | 6 | .38 | .48 | 0 | 52 | -18 | 16 | 4.2 |
| Solar bloom | .90 | 9 | .72 | .08 | 90 | 38 | 24 | -12 | 4.2 |
| Afterglow | .35 | 4 | .18 | .72 | 180 | 68 | -28 | 32 | 4.2 |

## Verification

`npm run check` checks syntax and mathematical properties without a browser.

`npm install && npx playwright install chromium && npm test` runs Chromium/SwiftShader QA and saves `reports/qa.json` plus desktop, side-view, portrait and landscape screenshots. GitHub Actions exposes these as `visual-qa`. GPU tests check compile/link, exact fixture redraws, visible structure, axis response, whole-turn equivalence, restored pixels, depth, hostile inputs and completed readback timing. Interaction tests cover pose-only views, keyboard sliders, drag/roll undo, canvas keys, full replay in a fresh page, open-tab hash replay, version rejection, reduced motion, paused draw counts, export and browser errors.

The “competitive Q&A” is an adversarial acceptance scorecard. It is not a fabricated head-to-head competitor benchmark or empirical user satisfaction study.

## From pattern to real-world instrument

[Live applications essay](dist/applications.html) distinguishes mathematical construction from physical evidence, identifies established acoustic and photonic counterparts, and proposes a measured low-level acoustic experiment. It describes a constrained inverse problem `p=Hu`, held-out measurements, source-power accounting and closed-loop validation. No hardware or physical energy-harvesting effect is implemented.

## Research and scope

- [The Prow / Behance](https://www.behance.net/gallery/155704629/The-Prow-Generative-Sculpture): concentric volumetric sculpture and bounded controls; no assets copied.
- [Awwwards examples](https://assets.awwwards.com/awards/gallery/2023/07/HOT-RIGHT-NOW-BOOK-2023.pdf): immersive primary WebGL stages.
- [Superdesign](https://superdesign.dev/): reviewed as a UI composition reference; no authenticated product testing claimed.
- [Acoustic holographic manipulation, Bristol](https://research-information.bris.ac.uk/en/publications/holographic-acoustic-elements-for-manipulation-of-levitated-objec/).
- [Meep adjoint inverse design](https://meep.readthedocs.io/en/stable/Python_Tutorials/Adjoint_Solver/).
- [Optical tweezers, Nobel Physics 2018](https://www.nobelprize.org/prizes/physics/2018/press-release/).

This isolated example does not implement the repository's optical operator ontology or replace Nacre Atelier or other Aether experiments. Visual energy is dimensionless; the model does not claim conservation-law simulation, a new energy source, acoustic levitation, electromagnetic confinement or physical force generation.
