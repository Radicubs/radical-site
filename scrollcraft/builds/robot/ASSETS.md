# Robot page assets

Nothing on this page is generated. Every pixel comes from one of two supplied
sources, and both are photographs or footage of the actual machine.

## The two sources

| Source | What it is |
|---|---|
| `scrollcraft/builds/robot/source.mp4` (gitignored master) | 5.04s, 1280x720, 24fps. **A real exploded-view sequence of this robot.** Frame 0 is the assembled machine in a match photograph; the camera dollies in while it separates into four wheels and swerve modules, eight roller/motor assemblies, the shooter frame and flywheels, the control board and wiring harness, and the bumper base. Monotonic: it only ever comes apart. |
| `public/radicubs-2026-hero.png` | 2048x1152 competition photograph, machine assembled, sharp on the subject with a shallow-focus arena behind it. |

**There is no GLB, GLTF, FBX or CAD export anywhere in this repository.** There
is no mesh hierarchy to inspect and no separable geometry to transform, so the
page uses scrubbed real footage plus 2.5D compositing rather than 3D. Modelling
this robot from photographs would be the invented geometry the brief forbids,
and it would be less accurate than the footage already in hand.

## Derived assets, and how to regenerate them

All produced with the bundled `ffmpeg-static` binary (a devDependency).

### Clips

```bash
FF=node_modules/ffmpeg-static/ffmpeg
SRC=scrollcraft/builds/robot/source.mp4

# reversed master -> the reassembly is the teardown run backwards
$FF -y -i $SRC -an -vf "reverse,format=yuv420p" -c:v libx264 -profile:v high \
   -preset slow -crf 20 -g 6 -keyint_min 6 -sc_threshold 0 -movflags +faststart /tmp/rev.mp4

# desktop, native 720p, dense GOP so a currentTime seek decodes a few frames
for pair in "$SRC:public/robot/teardown.mp4" "/tmp/rev.mp4:public/robot/rebuild.mp4"; do
  $FF -y -i "${pair%%:*}" -an -vf "format=yuv420p" -c:v libx264 -profile:v high \
     -preset slow -crf 21 -g 6 -keyint_min 6 -sc_threshold 0 -movflags +faststart "${pair##*:}"
done

# phone, 480p, GOP 4
for pair in "$SRC:public/robot/teardown-m.mp4" "/tmp/rev.mp4:public/robot/rebuild-m.mp4"; do
  $FF -y -i "${pair%%:*}" -an -vf "scale=-2:480:flags=lanczos,format=yuv420p" \
     -c:v libx264 -profile:v high -preset slow -crf 24 -g 4 -keyint_min 4 \
     -sc_threshold 0 -movflags +faststart "${pair##*:}"
done
```

A dense GOP is the whole point: a normal web encode plays perfectly and scrubs
like mud, because seeking walks from the previous keyframe. Audio is stripped.

The source is 720p, so nothing is ever upscaled to 1080p on the way out.

### Stills

One grade is shared by every plate, so the machine reads as one shoot across the
whole page. The vignette does the work rather than the exposure: the arena the
photographs were taken in is not the subject, so it falls into the page's ground
and the machine stays the only lit thing.

```bash
G="eq=brightness=-0.02:contrast=1.14:saturation=0.86,vignette=angle=PI/4.4:x0=w/2:y0=h/2"
SH="unsharp=5:5:0.6"
```

| File | Cut from |
|---|---|
| `public/robot/hero-subject.webp` | The photograph, graded, masked at runtime to the machine |
| `public/robot/hero-env.webp` | The photograph, blurred to sigma 34 and dropped to 22% saturation. Atmosphere only |
| `public/robot/hero-mask.svg` | The machine's silhouette, traced off the photograph in its own pixel coordinates and feathered with `feGaussianBlur stdDeviation=16` |
| `public/robot/poster-{assembled,exploded}.webp` | First and last frames of the clip; the two scrub acts' frame holders |
| `public/robot/sys-intake.webp` | Photograph, `crop=620:420:960:390`. The front rollers over the bumper |
| `public/robot/sys-hopper.webp` | Photograph, `crop=1000:560:530:320`. The whole assembled machine, so the game-piece route can be drawn across it |
| `public/robot/sys-shooter.webp` | Clip at t=3.6s, `crop=420:310:550:20`. The shooter frame and flywheels leaving the machine |
| `public/robot/sys-drivetrain.webp` | Last frame, `crop=1060:380:110:325`. Four modules and the bumper base |
| `public/robot/sys-electronics.webp` | Last frame, `crop=480:330:430:95`. The control board and the harness |

### The hero mask

`hero-mask.svg` is why the hero has real occlusion without a matting tool. It is
a polygon in the photograph's own 2048x1152 coordinates, applied with
`mask-size: 100% 100%` to a frame that is always sized to the photograph's own
aspect ratio, so it stays registered to the machine at every viewport. Two
things make it hold up:

- **The plane behind the cutout is the same photograph**, blurred and darkened.
  An error in the trace therefore lands on matching pixels and can never open a
  hole or duplicate the subject.
- **The edge is feathered, not cut.** A hard `clip-path` produced a visible
  straight line where sharp met blurred. The Gaussian in the mask makes the
  subject fall off into depth the way real depth of field does.

Re-trace by editing the `points` attribute; the coordinates are picture pixels.

### Label SVGs

`public/robot/labels/{intake,hopper,shooter,drivetrain,electronics}.svg` are the
supplied subsystem titles, generated by
`node scrollcraft/builds/robot/gen-labels.mjs` to match the radicubs wordmark.
**Every glyph is `<line>` elements**, which is what makes the signature move
possible: each stroke can be drawn independently.

`node scrollcraft/builds/robot/gen-label-strokes.mjs` converts them into
`components/robot/label-art.ts`, a plain coordinate table the page renders as
inline SVG so each line can carry its own `--i` index. Re-run it after changing
a label SVG. The accessible name is a real `<h2>` beside the drawing; no text is
baked into any image anywhere on this page.

## Accuracy notes, including what is not verified

- No elevator. Five subsystem groups only. Four swerve modules, shown at the
  angle the footage shows them.
- **No numbers.** The build notes contain no verified motor, gearing, speed or
  performance figures, so the page publishes none and has no counters.
- The robot's name and revision are unverified, so the page says "7503 · 2026"
  and never a model name.
- **Intake and hopper hardware cannot be told apart in the separated frame.**
  Both are roller and belt assemblies and the footage does not distinguish
  which flying roller belongs to which. Their leader lines therefore point at
  *regions* of the frame, not at tracked parts, and both carry the honest
  caveat already recorded in `data/robot.ts`. Drivetrain, electronics and
  shooter are unambiguous in the separated frame and are anchored to their
  actual hardware.
- The game-piece route drawn in the hopper act is labelled indicative on its
  face, because the path through the chassis is genuinely not visible from
  outside in any supplied asset.

## What would unlock more

A GLB/GLTF of the intended competition revision with the assemblies separated in
its hierarchy (plus units, front/up axes, and approved separation directions),
or transparent subsystem renders from one locked camera at identical canvas size
and assembled registration. Either would allow per-subsystem transforms and true
per-part isolation. Neither exists today, and reconstructing them from the
current photographs is not a substitute.
