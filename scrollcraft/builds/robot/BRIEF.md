# Robot page brief — v3, calibrated exploded assembly

This brief supersedes the earlier video-based concept. A hierarchy-preserving GLB is now available, and the user's latest direction narrows the page to one silent, pinned 3D sequence with no visible labels, navigation, footer, or supporting copy.

## Objective

The complete 2026 robot occupies the opening viewport in its calibrated field position. Scrolling acts like a controlled assembly fixture: the complete machine rotates slightly around its true vertical axis while its real subsystem assemblies move away from the chassis. The final state holds fully exploded and still reads as one robot.

## Asset decision

- Authoritative geometry: `2026-robot-hierarchical.glb` from Strapi.
- Same-origin runtime URL: `/api/robot-assets/model`.
- Local fallback: `/public/robot/models/2026-robot-hierarchical.glb` (6.7 MB).
- Background plate: `Robot Background.png` from Strapi through `/api/robot-assets/background`.
- Rendering mode: true 3D over the unchanged supplied background plate. The GLB retains independently transformable subsystem parents, so 2D compositing is not needed.
- No geometry, mechanisms, electronics, or dimensions are invented.

Three.js sanitizes GLB node names at runtime. The animation therefore targets the actual names `Intake_v78`, `Extendable_Hopper_v19`, `Shooter_v3_v42`, `Electrical_Board`, and four `Inverted_MK4i_Swerve_Module_v6*` assemblies.

## Feeling curve

1. **Presence** — the robot is complete, large, heavy, and motionless.
2. **Anticipation** — an intentional assembled hold confirms the starting architecture.
3. **Release** — rotation and subsystem separation begin together with restrained easing.
4. **Technical clarity** — the assemblies reach readable positions while the chassis remains the datum.
5. **Resolution** — the fully exploded robot holds without further motion.

The engineered peak is the transition from one complete machine into its subsystem-level exploded state. There is no secondary motion device competing with it.

## Page grammar

One full-viewport sticky inspection stage over a long scroll track. The field plate is the environmental plane and the WebGL robot is the subject plane. The robot is the only spectacle; the page contains no visible UI or text.

The motion language is limited to transforms on actual subsystem parents, one restrained assembly rotation, and opacity-free physical lighting. Robot scale remains constant throughout the sequence. No component spins, arbitrary rotations, layout animation, cards, HUD, glow, particles, or autoplay loops.

## Scroll score

| Local progress | State |
|---|---|
| 0–15% | Fully assembled hold |
| 15–85% | Smoothstep separation plus reversed 22° rotation |
| 85–100% | Fully exploded hold |

Transforms are proportional to measured model bounds:

- Intake: forward-left.
- Hopper: rear-right and upward.
- Shooter: upward.
- Electronics: slightly lower, aligned to the chassis.
- Four MK4i-style swerve assemblies: radially outward and downward.
- Chassis and bumper: unmoved central datum.

Original local positions and quaternions are captured before animation and restored on every frame before the progress offset is applied. Subsystems remain internally assembled.

## Device patterns

- **Desktop:** sticky/pinned stage, 560vh track, constant calibrated scale `0.24`, and 90% of the full separation travel.
- **Mobile:** separate portrait fit, 440vh track, constant scale `0.18`, 24% of desktop separation travel, and an 8° rotation cap. The phone choreography favors vertical separation so the intact full-size assemblies remain inside the narrow viewport. The complete field plate remains contained rather than being destructively cropped.
- **Reduced motion:** two intentional stable states. Before the midpoint the robot is assembled; after it the robot is fully exploded. Continuous rotation is disabled.

## Performance and runtime contract

- The model is loaded once and heavy resources remain off the CMS client bundle.
- Scroll and resize only schedule one `requestAnimationFrame`; there is no permanent render loop.
- DPR is capped at 1.5 and post-processing is absent.
- Runtime state is exposed nonvisually on the section through `data-robot-ready`, `data-subsystem-count`, `data-swerve-count`, and `data-explosion-progress`.
- A valid ready state requires five subsystem categories and exactly four swerve assemblies.
