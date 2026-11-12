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

This isolated visual experiment does not claim to implement the repository’s optical operator ontology or physical energy conservation. Energy is a normalized artistic parameter. It does not replace archived Aether or Nacre Atelier.
