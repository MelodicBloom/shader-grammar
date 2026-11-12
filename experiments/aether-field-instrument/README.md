# AETHER — Field instrument

[Open the live instrument](https://aether-field-instrument-314.qt-314wink.chatgpt.site) · [Verified browser challenge](https://github.com/MelodicBloom/shader-grammar/actions/runs/43131175637)

Final browser result: **19/19 passed** on revision `5529e8c`. Desktop, portrait and landscape screenshots and the measured results are committed under `reports/`. The live Site is owner-private.

An independent GLSL ES 3.00 / WebGL 2 experiment. Open `dist/index.html` through any static HTTP server. No build, runtime libraries, backend, or AI API is required. Fonts have system fallbacks.

## Definition of done

A live runtime, committed source, bounded meaningful controls, complete fixed fixtures, deterministic analytic replay, reversible changes, captured visual evidence, and adversarial measurable QA. Browser interaction validation must be distinguished from direct GPU tests. Failure includes compile errors, identical outcomes across all fixtures, irreversible parameter edits, unbounded state inputs, or claiming unrun checks passed.

## Method → action → outcome

- Engineering: fixed 129,600 vertices, two draw calls, capped pixel ratio → bounded work per frame.
- Mathematics: toroidal coordinates, harmonic sector counts, seeded modulation → procedural architecture without accumulated numerical drift.
- Art direction: near-black stage, lime/gold filaments, restrained typography → clear visual hierarchy around the field.
- Reverse inference: choose an outcome description → select Resonance, Bloom, or Vortex → known complete state.
- Socratic inquiry: change one uniform → compare → undo → repeatable exploration.

These are bounded interaction/design lenses, not an AI reasoning engine. No hidden model calls or persona-based randomness.

## Control contracts

| Action | Range | Outcome |
|---|---|---|
| Energy | 0–1 | Distortion amplitude and brightness |
| Coherence | 0–1 | Alignment through decreasing high-frequency perturbation |
| Symmetry | integer 2–12 | Harmonic sector count |
| Chromatic lens | 0, 1, 2 | Solar, Glacial, Orchid palette |
| Drag | yaw/pitch clamped to ±π | Orbit projection |
| Time scrub | 0–60 seconds | Analytic field phase; pauses playback |
| Preset | 3 fixed fixtures | Restores parameters, seed, orientation, time |
| Undo | previous 50 states | Restores prior configuration and pauses |
| Copy state | normalized JSON URL fragment | Exact paused replay |
| Capture | current framebuffer | PNG export |

Time is quantized to 1/60 second. There is no feedback simulation. Same GPU, dimensions, uniforms and quantized time produce the same frame. Floating-point operations (including seeded sine) may differ between GPU implementations. Viewport size affects projection and the rasterized image. State schema is normalized on import; malformed URL JSON falls back to the default fixture. Reduced-motion users start paused.

## Research and precedents

- [Behance — Proteus](https://www.behance.net/gallery/68146261/Proteus): interactive public particle installation. Search-index evidence described Kinect response; direct page access returned 403. This informed direct manipulation, not copied imagery.
- [Behance — MOMENTS by MELT](https://www.behance.net/gallery/103073817/MOMENTS-Immersive-Experience-by-MELT): particle parameters and data influence motion and color; a precedent for explicit parameter/outcome mapping.
- [Awwwards — WebGL collection](https://www.awwwards.com/websites/webgl/): spatial interactive presentation references. Its listings informed a large immersive stage, not a claim that awards prove usability.
- [Superdesign](https://superdesign.dev/) and its [public repository](https://github.com/superdesigndev/superdesign): interface exploration references. The landing page had no readable content through the research tool. No Superdesign-generated assets were used.

The architecture also draws on interference patterns and synthesizer instruments: explicit bounded inputs with immediate visible response. No assets were copied from these references.

## Competitive Q&A

The challenge is adversarial self-testing against explicit claims, not an independently judged comparison with other products.

Direct EGL / GLES3 software rendering at 1000×700 compiled and linked all four shader stages. Seven rendered frames verified identical replay, visible energy response, exact reversal, three unique fixture hashes, and zero GL errors. See `reports/gpu-results.json` and `reports/field.png`. Timing is software rasterizer time, not hardware/browser FPS.

The embedded **Run system challenge** button executes six tests in the actual runtime. The separate GitHub Actions workflow tests those plus UI inputs, undo, preset restoration, drag, URL replay, PNG download, mobile overflow, reduced motion, and browser runtime errors. It exports desktop, portrait and landscape screenshots. See the workflow run for authoritative results; pending tests are not passes.

Local shared-browser QA was unavailable because the environment omitted the required browser-control tool. Sites instructions prohibit replacing the managed preview infrastructure. Direct EGL tests and GitHub-hosted CI keep verification separate from that unavailable preview.

## Verification

`npm install` then `npx playwright install --with-deps chromium`; `npm run check && npm test`.

Production controls are keyboard-accessible native buttons and sliders. The canvas has a textual alternative. Orientation uses pointer drag; the three fixtures provide accessible alternate orientation states. Cross-device bit identity and a universal FPS target are outside the guarantee.
