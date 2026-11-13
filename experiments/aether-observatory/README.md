# AETHER / Shader Grammar

A deterministic GLSL ES 3.00 energy observatory. WebGL2, no rendering dependencies, no random state, no server.

## Run
Serve `dist/` with any static web server, e.g. `python -m http.server 8080 --directory dist`.

## Definition of done and failure
Done: linked WebGL2 shader, distinct responsive visual instrument, bounded parameters, fixed fixtures, reversible controls, state URLs, live runtime, repository, measured QA. Failure: compile errors, unbounded/nonfinite inputs, differing same-device redraws, nonfunctional controls, absent runtime. 30 FPS is a physical-GPU target; software CI timing is reported separately, not represented as physical GPU performance.

## Method → action → outcome
1. Engineering: analytic curves instead of accumulated particle simulation → evaluate directly from phase → seekable, reversible frames.
2. Mathematics: 48 filament layers, radial harmonic equation `r=.57+.12E+.08sin(nθ+φ+f·2πT)` → bounded E and T in [0,1], integer n in [3,12] → controlled radial expansion and lobes.
3. Art direction: layered warm/cool light with dark core and measurement rings → silhouette readable against restrained instrument UI.
4. Reverse inference: desired wider silhouette → increase energy; desired petal count → harmonics. No hidden parameter changes.
5. Socratic inquiry: hold energy fixed, pause, vary torsion, undo → isolate cause and compare effect.

Lenses are explanatory text only; no AI service or unbounded persona behavior. Animation advances phase at 12°/second; scrubbing pauses. Reduced-motion preference starts paused. Bounds apply to shared URL inputs, including nonfinite values. Determinism means same state, dimensions, browser/GPU produces identical redraw; floating point differences across GPUs are possible. State links include phase and open paused. PNG export captures the current canvas. Undo retains 100 actions in memory; reset returns fixture zero.

## Known fixtures
| Fixture | Energy | Harmonics | Torsion | Spectrum | Phase |
|---|---:|---:|---:|---:|---:|
| Resonance | .65 | 6 | .38 | .48 | 0° |
| Solar bloom | .90 | 9 | .72 | .08 | 90° |
| Afterglow | .35 | 4 | .18 | .72 | 180° |

## Competitive challenge / Q&A
This is an adversarial acceptance scorecard, not a fabricated third-party benchmark. Questions: does each fixture redraw byte-identically? Is visible structure present? Do hostile input values stay bounded? Does energy alter pixels? Does preset undo recover state? Does keyboard adjustment work? Does reset recover fixture zero? Is overflow absent at 390 and 844 pixels? Does URL replay restore the exact paused phase? Are there any runtime exceptions? Is rendering under 33.34ms?

`npm install && npx playwright install chromium && npm test` records answers and timings to `reports/qa.json` and desktop/mobile screenshots. GitHub Actions retains the `visual-qa` artifact. The in-app **Run fixture QA** button repeats the GPU checks on your own device. CI uses software SwiftShader; its timing is explicitly separate from hardware performance. No empirical competitor usability study is claimed.

## Research references
- [The Prow / Behance](https://www.behance.net/gallery/155704629/The-Prow-Generative-Sculpture): concentric rings, volumetric form, docent controls. Inspired layered silhouette and bounded control surface; no assets copied.
- [Awwwards Hot Right Now](https://assets.awwwards.com/awards/gallery/2023/07/HOT-RIGHT-NOW-BOOK-2023.pdf): immersive WebGL portfolio examples. Inspired a primary visual stage and quieter surrounding UI.
- [Superdesign](https://superdesign.dev/) and [its open source project](https://github.com/superdesigndev/superdesign): reviewed as a UI composition reference. Public homepage exposed no readable design detail; no claim of testing its authenticated product.
- [Shadertoy](https://www.shadertoy.com/): real-time fragment shader instrument precedent.

## Limits
WebGL2 required. No audio input. Phase is periodic, not a physics simulation. Fixed rendering pixel ratio capped at 1.5. Continuous animation remains device-dependent; use pause for precise comparisons. No formal user satisfaction study performed.

## Version 2: actual 3D and reproducible orientation

The previous version used image-space curves. V2 replaces them with a parametric 3D toroidal mesh, depth-tested triangles, contour lines and perspective projection. X/Y/Z are rigid model rotations, composed as `Rz * Ry * Rx`. Camera distance is separate. Drag changes X/Y; Shift-drag changes Z. The canvas also supports arrow keys and Shift-left/right; Home restores the view. Sliders provide touch and keyboard access to every axis. Undo restores a complete drag, camera and phase; reset restores the entire canonical fixture.

Versioned state URLs include shape, phase, all three axes and camera distance, and open paused. V1 URLs without a version remain valid parameter inputs but adopt the new 3D geometry and default camera; they do not reproduce the old 2D pixels. Future unsupported versions are rejected visibly. Determinism applies within the same graphics implementation, viewport and pixel ratio (capped at 1.5); hardware differences may change rasterization. Physical replay has measurement tolerances and is a separate question.

The model has 9,457 vertices and 18,432 triangles. Its parameterization is implemented in `model.js` and GLSL in `renderer.js`. `R=.76+.12E+.09sin(nu+phase)`, `a=.22+.07E`, `w=v+T*pi*sin(2u+phase)`, and `p=((R+a cos w)cos u,(R+a cos w)sin u,a sin w+.055E sin(nu+phase))`. All coordinates are dimensionless. The sculpture is a geometrical artistic model, not a numerical solution to a wave equation.

The new acceptance suite additionally checks nonzero depth, each rotation axis changing pixels, 360-degree canonical equivalence, rigid-distance invariance, restored pixel equality, drag/roll undo, full camera replay, keyboard orbit, reduced motion, PNG export, paused rendering and an on-page Socratic experiment. Software-GPU timing remains measured with completed pixel readback. Paused scenes do not redraw continuously.

[From pattern to instrument](dist/applications.html) develops the real-world abstraction and separates established acoustic/photonic examples from proposed work. Its research sources and a falsifiable acoustic experiment plan are included in the live demo.
