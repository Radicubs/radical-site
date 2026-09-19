# Verification — `/robot`, calibrated exploded assembly

Verified in local Chrome against the Next development server on 2026-09-16. The checks drive the real page through Chrome DevTools Protocol, inspect its nonvisual runtime state, and capture the WebGL result at intermediate positions.

## Runtime gate

The page passed the acceptance gate before screenshots were evaluated:

- `data-robot-ready="true"`
- `data-subsystem-count="5"`
- `data-swerve-count="4"`
- no browser exceptions or error-level log entries
- TypeScript: `npx tsc --noEmit` passed

## Desktop — 1440 × 900

Captured local scroll positions 0%, 10%, 25%, 50%, 75%, 90%, and 100%.

| Scroll | Explosion value | Observed state |
|---:|---:|---|
| 0% | 0.000 | Complete robot, calibrated starting orientation |
| 10% | 0.000 | Assembled hold |
| 25% | 0.055 | Early separation visible |
| 50% | 0.500 | Clear intermediate rotation and subsystem travel |
| 75% | 0.945 | Near-final exploded assembly |
| 90% | 1.000 | Fully exploded hold |
| 100% | 1.000 | Same stable final state |

The chassis and bumper stay centered. The intake finishes at the far left, the shooter rises into the upper field, the hopper/guards clear to the right, electronics settle below, and the swerve assemblies distribute across the lower field. The robot remains at the calibrated `0.24` scale for the entire sequence; only subsystem transforms and the bounded assembly rotation change.

## Mobile — 390 × 844

Captured the same seven positions using the portrait composition. Values were 0.000, 0.000, 0.056, 0.500, 0.945, 1.000, and 1.000. The robot remains at scale `0.18` throughout. Mobile uses 24% of desktop travel, an 8° rotation cap, and a small horizontal recentering so the full-size assemblies remain inside the usable width. The full background image remains contained.

## Reduced motion

Emulated `prefers-reduced-motion: reduce` at 1440 × 900:

- top: stable assembled state, explosion 0.000
- bottom: stable exploded state, explosion 1.000
- no continuous rotation

## Resilience

- **Reload at mid-scroll:** before reload 0.500; after reload ready was true and progress restored to 0.500 at the same scroll position.
- **CMS model failure:** blocking `/api/robot-assets/model` still produced ready true, five subsystem categories, and four swerve groups from the local GLB fallback.
- **Rendering:** Three.js, GLTFLoader, and Meshopt are statically bundled with the route to avoid the prior development chunk-load failure. No WebGL context loss, console exception, model parse error, or dead final scroll was observed during the final passes.

## Captures

Verification captures were written outside the repository to `/private/tmp/robot-constant-fit-desktop-*.png`, `/private/tmp/robot-constant-mobile-shift-*.png`, and `/private/tmp/robot-constant-reduced-*.png`.
