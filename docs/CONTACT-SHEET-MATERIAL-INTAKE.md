# Contact-sheet material intake — candidate routing, not grammar promotion

**Status:** intake proposal  
**Source state:** two user-supplied diagnostic/contact sheets reviewed 2026-10-13. The source images are not redistributed in this repository. Their purpose here is to preserve the routing decisions that connect the studies to Shader Grammar without recasting illustrated materials as calibrated samples.

## Decision

The twenty named studies below are **candidate references and QA targets**. They do not add operators, recipes, physics claims, renderer features, or canonical material parameters.

Shader Grammar remains the authority for mechanism vocabulary. Material names stay in candidate aliases and specimen recipes; operators remain closed until a separately governed change shows a mechanism cannot be expressed by the existing catalog.

## Source interpretation limits

- The right-hand tiles in the diagnostic sheet are labeled synthetic UV/base-color material studies. A base-color field does not establish roughness, metalness, normal, height, thickness, volume, geometry, lighting, or view-dependent behavior.
- The left-hand spheres are attractive look targets, not calibrated render evidence. Camera, scene fixture, environment, tone map, and shader implementation are unknown.
- Numeric values in a future preset must retain their own provenance and confidence. A static rainbow tile must never be accepted as proof of interference.

## Candidate routing

| Contact-sheet label | Candidate mechanism route | Existing grammar status | Required proof before promotion |
|---|---|---|---|
| Symmetry Fold | screen/object-space C8 fold + surface response | Outside current optical operator scope | Show stable coordinate fold; keep it a structural field, not a material effect flag |
| Woodgrain | directional structural field + dielectric microfacet scatter | Representable in part | Validate direction field separately from PBR response |
| Abalone Nacre | multilayer interference + dielectric Fresnel + view-dependent weight | Existing `nacre` specimen | Compare the synthetic hypothesis with a separately attributed Khronos 600–800 nm fixture; preserve variants |
| Marble | veining field + dielectric microfacet scatter | Representable in part | Demonstrate that veins are not being mistaken for subsurface/geometry proof |
| Cork | aggregate/porosity field + rough dielectric scatter | Representable in part | Acquire or author maps under provenance; test at grazing view |
| Turquoise | fracture/vein field + rough dielectric scatter | Representable in part | Separate blue-green albedo from actual mineral optical claims |
| Opal Fire | structural color/diffraction or internal volume hypothesis | Gap/compound candidate | Establish whether diffraction, photonic structure, volume scatter, or an art-directed approximation is being tested |
| Labradorite Schiller | multilayer interference + anisotropic orientation + microfacet scatter | Existing `labradorite` specimen | Prove directional flash under a light/view sweep; do not accept a static blue patch |
| Silver Specular | conductor Fresnel + anisotropic microfacet scatter + IBL | Existing operators | Use a fixed HDRI/studio fixture and a directional anisotropy field |
| Granite Aggregate | aggregate structure field + rough dielectric scatter | Representable in part | Compare density/scale under fixed camera and neutral light |
| Stone Relief | displacement/actual geometry + rough dielectric scatter | Geometry requirement, not a map-only result | Test silhouette and self-shadow change, not only a normal map |
| Quilled Paper | extruded ribbon/spiral geometry + fibrous rough surface | Geometry requirement | Demonstrate actual shadow and occlusion from the ribbon topology |
| Metallic Gold Foil | conductor Fresnel + microfacet/anisotropy + HDR IBL | Existing operators | Validate broad, directional highlights under rotating environment |
| Bloom / Flare Burst | HDR emission + post-process bloom/diffraction | Scene/post requirement | Record HDR threshold and compositing path; do not call an albedo a flare |
| Master Kaleidoscope | time-aware C8 fold structural field | Outside current optical operator scope | Add temporal loop test before considering a first-class time domain |
| Thin-Film Interference | two-interface film + view-dependent weight | Existing `soap-film`/`oil-slick` family | Verify color shift under camera and illumination movement |
| Fresnel Ramp | dielectric Fresnel + view-dependent weight | Existing operators | Separate artistic color LUT from the underlying Fresnel term in the evidence |
| Bubble Membrane | two-interface thin film + refraction + transmission geometry | Existing film/refraction operators; renderer work remains separate | Test front/back behavior, thickness/angle response, and background dependence |
| Prismatic Refraction | Snell refraction + dielectric Fresnel + faceted geometry | Existing operators plus geometry/renderer requirement | Test entry and exit geometry; do not substitute tinted transparency |
| Pearlescent Glow | nacre-family multilayer/weak-film hypothesis + dielectric Fresnel | Existing mechanism family; no new named operator | Compare against `nacre` parameters before proposing a distinct specimen |

## Five staged work items

These are intentionally ordered to reuse existing specimens and limit new scope.

1. **Abalone Nacre:** add a capture-scoped comparison record, not a new recipe. Contrast the synthetic candidate with the Khronos reference fixture, retaining each as an explicitly labeled variant.
2. **Thin-Film Interference:** run the existing two-interface film mechanism through a grazing-angle and light sweep. A static contact-sheet match is insufficient.
3. **Fresnel Ramp:** create a small operator-level diagnostic that isolates `dot(N,V)` response from an art-directed color ramp.
4. **Prismatic Refraction:** create a geometry/scene proposal only. It should define the required faceted object, background/IBL, entry-exit paths, and quality gate before a recipe is added.
5. **Pearlescent Glow:** treat as a nacre-family comparison hypothesis; identify the observed residual after a controlled nacre render before adding any new layer or operator.

## Gate for any subsequent recipe or operator change

A candidate may become a recipe/grammar proposal only with:

1. immutable reference locator and source/asset license;
2. declared scene fixture, camera, environment, exposure, tone mapping, browser/GPU/renderer version;
3. one stated mechanism and at least one alternative explanation;
4. controlled evidence over view angle and illumination where the mechanism requires it;
5. parameter provenance with confidence and a reversal trigger;
6. a valid experiment receipt; and
7. a decision that the closed catalog cannot express the tested mechanism, if proposing a new operator.

## Relationship to current grammar

This intake reinforces the current design rather than extending it. The contact-sheet vocabulary maps material names onto reusable mechanisms such as multilayer/two-interface interference, Fresnel, microfacet scatter, Snell refraction, volume behavior, emission, structural fields, and geometry. No `pearlescent: true`, `opalFire: true`, or `prism: true` named-effect key is introduced.
