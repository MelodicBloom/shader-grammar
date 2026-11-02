# PBR real-time implementation profile — governed proposal v0.1

**Status:** candidate, additive; not a change to the v0.1 operator catalog, recipe schema, experiment receipts, or canonical material approvals.
**Owning repository:** `qt314wink/shader-grammar`.
**Consumers:** shader-gallery / Nacre Atelier / WebGL or Three.js specimen viewers. Seed Loom owns material semantics; design-standards owns UI motion and budgets; .github owns cross-repository automation permission.

## Use cases
1. Compare metallic/roughness reflection to a controlled analytic BRDF reference.
2. Test whether a photographed highlight can be explained by isotropic GGX or demands anisotropy, thin film, diffraction or scattering.
3. Provide a stable baseline for the 12 optical specimens without pretending that every structural-color specimen is solved by metallic-roughness PBR.
4. Carry reference shader metadata to a gallery, a garment inspection view, or an architectural scene without authoring material-named operators.

## Mechanism and mathematical contract
For normalized N,L,V,H=normalize(L+V), the specular BRDF is `D_GGX(N,H,alpha)*F_Schlick(V,H,F0)*G(N,L,V)/(4*max(N.L,eps)*max(N.V,eps))`.
The isotropic GGX normal distribution is `alpha^2 / (pi * ((N.H)^2*(alpha^2-1)+1)^2)`; `alpha=r*r`, with perceptual roughness `r` clamped inside shader for numeric stability. Lambertian diffuse, when applicable, is `baseColor/pi` modulated by a dielectric/metallic energy allocation; metal diffuse is zero in the simple metallic workflow. Incident light and `max(N.L,0)` are applied **outside** the BRDF. Preserve linear-light math and input color-space metadata.

For the historical punctual-light Schlick-Smith fit, `k=(r+1)^2/8`, `G1(x)=N.x/(N.x*(1-k)+k)`, `G=G1(L)*G1(V)`. Do **not** quietly reuse this fit for IBL. Schlick Fresnel: `F=F0+(1-F0)*(1-V.H)^5`. The RGB conductor shortcut `mix(vec3(0.04),baseColor,metalness)` is a viewport interchange model, not a replacement for wavelength-dependent conductor Fresnel.

IBL: use a roughness-prefiltered environment cubemap and a BRDF integration LUT with axes `NdotV` and `roughness`. Specular contribution is approximately `prefilteredEnv(reflection,r)*(F0*LUT.r+LUT.g)`. The historical `N=V` prefiltering assumption loses view-dependent highlight stretching. Include separate, higher-sample reference images before assigning an error or performance claim.

## Interoperability contract
- Canonical optical mechanism IDs remain the 13 entries in `catalog/operators.json`; no new material-name effect switch.
- Proposed companion schema: `schemas/implementation-profile.schema.json`.
- Example: `examples/implementation-profiles/ggx-reference.json`.
- Shader consumers map typed mechanism input to backend-specific uniforms; the backend is not canonical source for material names, provenance, or semantic intent.
- Scene, optical and acoustic parameters are different domains. An image-based roughness estimate does not infer frequency-dependent sound absorption.
- Runtime contract covers WebGL2/GLSL ES 3.00 reference; Three.js standard/physical material adapter; HTML/static fallback. WebGPU/WGSL remains an experimental port until equivalent tests pass.

## Verification and acceptance
1. JSON schema validates the implementation profile; operator IDs resolve to existing `catalog/operators.json` (companion validation task, not currently wired to CI).
2. Direct terms are compared numerically at grazing angles and roughness boundaries. Compare radiance rather than judging highlight shape alone.
3. IBL output is compared against importance-sampled integration under fixed HDR environment, multiple viewing angles and roughness steps. Declare metric, sampling, reference image hash and hardware.
4. No passing GPU result is claimed until browser screenshots, frame timing, pixel comparisons and fallback behavior are captured in an experiment receipt.
5. Promotion to approved requires review consistent with `schemas/experiment-receipt.schema.json`; `supported` does not imply `canonical`.

## Source-to-inference register
- **Karis 2013 slides 5-17:** Lambert, GGX, Schlick, split-sum IBL selection and illustrations — historical source.
- **Shader Grammar v0.1:** mechanism ontology, typed fields, recipes and experiment evidence — existing authority.
- **Proposed:** backend adapter, candidate profile metadata, tests, acceptance criteria, GPU fallback — not reported experimental results.

**Open decisions:** measured error thresholds, spectral-vs-RGB policy by specimen, clearcoat-layer model, multiple-scatter compensation, LUT reference integration, and renderer adoption. Revisit after controlled benchmark, not from appearance alone.
