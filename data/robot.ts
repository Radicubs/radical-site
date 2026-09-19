/** The five subsystem groups of the 7503 2026 machine.
 *
 * Every description here is drawn from the team's own dated build notes and is
 * historical: it records what was built, not a specification for a competition
 * revision nobody has verified. There are no performance, motor, gearing or
 * dimension figures anywhere in this file, because the notes contain none and
 * the page does not invent them.
 *
 * `zone` is where that group's hardware sits in the separated frame, as a
 * fraction of the stage. It anchors a leader line to a region, not to a tracked
 * part. `draw` is the window, in the teardown act's own progress, over which
 * the group clears the body and its label is written by that motion.
 */
export type RobotSystem = (typeof robotSystems)[number];

export const robotSystems = [
  {
    id: "intake",
    name: "Intake",
    line: "Bring the game piece into the robot.",
    description:
      "A three-roller, over-the-bumper intake. The team added a roller specifically to guide the game piece over the high bumper more smoothly, and drove the whole mechanism on belts and custom-made pulleys.",
    note: "Three rollers · Custom pulleys · Belt driven",
    caveat: "Internal path obscured in this view",
    source: "week-5-rebuilt-2026",
    sourceLabel: "Week 5 build notes",
    plate: "/robot/sys-intake.webp",
    plateAlt:
      "Close view of the front of the 7503 robot: two green compliant rollers on shafts above the blue bumper.",
    zone: [0.19, 0.33],
    label: [0.045, 0.26],
    draw: [0.22, 0.38],
  },
  {
    id: "hopper",
    name: "Hopper",
    line: "Hold the piece and hand it on.",
    description:
      "Belts and pulleys running through the mid-section of the chassis carry a piece from collection to the shooting mechanism. The team made its own pulleys, then tuned the transfer alongside the intake and the shooter rather than in isolation.",
    note: "Belt-driven transfer · Custom pulleys",
    caveat: "Route through the chassis is not visible from outside",
    source: "week-6-rebuilt-2026",
    sourceLabel: "Week 6 build notes",
    plate: "/robot/sys-hopper.webp",
    plateAlt:
      "The whole assembled 7503 robot from the front, smoked polycarbonate side panels over the chassis and blue bumper.",
    zone: [0.82, 0.36],
    label: [0.745, 0.2],
    draw: [0.32, 0.48],
  },
  {
    id: "shooter",
    name: "Shooter",
    line: "Turn control into consistency.",
    description:
      "A double-barrel shooter, refined through repeated testing. PID and feedforward tuning is what made it consistent, which is where the mechanical design and the software that drives it stop being separate problems.",
    note: "Double-barrel · PID and feedforward tuned",
    caveat: "Shooting assembly visible above the frame",
    source: "week-7-rebuilt-2026",
    sourceLabel: "Week 7 build notes",
    plate: "/robot/sys-shooter.webp",
    plateAlt:
      "The shooter assembly separated from the machine: green flywheels on shafts inside a black frame.",
    zone: [0.6, 0.22],
    label: [0.395, 0.115],
    draw: [0.42, 0.58],
  },
  {
    id: "drivetrain",
    name: "Drivetrain",
    line: "The foundation of every play.",
    description:
      "Four swerve modules under the chassis. The base was the first system wired and brought online: CAN IDs assigned, firmware updated, CANCoder offsets set and swerve feedforward tuned before any mechanism went on top of it.",
    note: "Four swerve modules · Calibrated steering offsets",
    caveat: "Module bodies sit behind the bumper when assembled",
    source: "week-1-rebuilt-2026",
    sourceLabel: "Week 1 build notes",
    plate: "/robot/sys-drivetrain.webp",
    plateAlt:
      "The drivetrain separated from the machine: four wheels and their swerve modules around the blue bumper base.",
    zone: [0.3, 0.78],
    label: [0.05, 0.71],
    draw: [0.52, 0.68],
  },
  {
    id: "electronics",
    name: "Electronics",
    line: "Connect the whole machine.",
    description:
      "The electrical layout moved with the mechanical design. During the rebuild the team prepared a new board and lowered the belly pan on 1.5-inch standoffs, purely to give the intake belts the clearance they needed.",
    note: "Reconfigured board · Belly pan lowered on standoffs",
    caveat: "Board sits under the mechanisms and is hidden when assembled",
    source: "week-8-rebuilt-2026",
    sourceLabel: "Week 8 build notes",
    plate: "/robot/sys-electronics.webp",
    plateAlt:
      "The control board and wiring harness separated from the machine, red and orange leads running out to the motors.",
    zone: [0.42, 0.34],
    label: [0.66, 0.68],
    draw: [0.62, 0.78],
  },
] as const;
