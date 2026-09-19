// Regenerates the subsystem label SVGs in the radicubs wordmark style
// (public/robot/labels/*.svg). Baseline reference: Downloads/wordmark green.svg
//  - round-capped straight strokes, subtle notch at every junction
//  - stroke ~= 0.09 * cell height, generous letter width and tracking
//  - flat #5ddb27, no glow (page CSS adds a drop-shadow for legibility)
//
// Run:  node scrollcraft/builds/robot/gen-labels.mjs
import { writeFileSync } from "node:fs";

const T = 12;     // stroke width
const CW = 88;    // cell inner width   (CW/CH ~= wordmark 0.667)
const CH = 132;   // cell inner height  (T/CH  ~= wordmark 0.091)
const S = 9;      // orthogonal end shrink -> corner notch
const SD = 11;    // diagonal end shrink
const ADV = 150;  // per-character advance
const PAD = T;    // viewBox padding so round caps never clip
const COLOR = "#5ddb27";

const Lx = 0, Rx = CW, Cx = CW / 2;
const Ty = 0, My = CH / 2, By = CH;

function shrink(x1, y1, x2, y2, s) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const t = Math.min(s, Math.max(0, (len - T) / 2)) / len;
  return [x1 + dx * t, y1 + dy * t, x2 - dx * t, y2 - dy * t];
}
const O = (x1, y1, x2, y2) => shrink(x1, y1, x2, y2, S);
const D = (x1, y1, x2, y2) => shrink(x1, y1, x2, y2, SD);

const SEG = {
  TOP:   O(Lx, Ty, Rx, Ty),
  BOT:   O(Lx, By, Rx, By),
  MID:   O(Lx, My, Rx, My),
  LEFT:  O(Lx, Ty, Lx, By),
  RIGHT: O(Rx, Ty, Rx, By),
  LTOP:  O(Lx, Ty, Lx, My),
  RTOP:  O(Rx, Ty, Rx, My),
  RBOT:  O(Rx, My, Rx, By),
  CVERT: O(Cx, Ty, Cx, By),
  NDIAG: D(Lx, Ty, Rx, By),
  KUP:   D(Lx, My, Rx, Ty),
  KDN:   D(Lx, My, Rx, By),
  VL:    D(Lx, Ty, Cx, By),
  VR:    D(Rx, Ty, Cx, By),
  RLEG:  D(Cx, My, Rx, By),
};

// Letterforms follow the hand-drawn set the user supplied earlier: full-height
// side strokes, a single full-height centre stroke for I / T, one long diagonal
// for N, mid-left diagonals for K, bottom-centre diagonals for V.
const GLYPH = {
  A: ["LEFT", "RIGHT", "TOP", "MID"],
  C: ["LEFT", "TOP", "BOT"],
  D: ["LEFT", "RIGHT", "TOP", "BOT"],
  E: ["LEFT", "TOP", "MID", "BOT"],
  H: ["LEFT", "RIGHT", "MID"],
  I: ["CVERT"],
  K: ["LEFT", "KUP", "KDN"],
  L: ["LEFT", "BOT"],
  N: ["LEFT", "RIGHT", "NDIAG"],
  O: ["LEFT", "RIGHT", "TOP", "BOT"],
  P: ["LEFT", "TOP", "RTOP", "MID"],
  R: ["LEFT", "TOP", "RTOP", "MID", "RLEG"],
  S: ["TOP", "LTOP", "MID", "RBOT", "BOT"],
  T: ["TOP", "CVERT"],
  V: ["VL", "VR"],
  " ": [],
};

function render(word) {
  const chars = [...word.toUpperCase()];
  const w = (chars.length - 1) * ADV + CW + PAD * 2;
  const h = CH + PAD * 2;
  let body = "";
  chars.forEach((ch, i) => {
    const ox = PAD + i * ADV;
    const oy = PAD;
    for (const name of GLYPH[ch] ?? []) {
      const [x1, y1, x2, y2] = SEG[name];
      body += `  <line x1="${(ox + x1).toFixed(1)}" y1="${(oy + y1).toFixed(1)}" x2="${(ox + x2).toFixed(1)}" y2="${(oy + y2).toFixed(1)}"/>\n`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
<g stroke="${COLOR}" stroke-width="${T}" stroke-linecap="round" stroke-linejoin="round">
${body}</g>
</svg>
`;
}

const outDir = new URL("../../../public/robot/labels/", import.meta.url);
const words = { intake: "INTAKE", hopper: "HOPPER", shooter: "SHOOTER", drivetrain: "DRIVETRAIN", electronics: "ELECTRONICS" };
for (const [file, word] of Object.entries(words)) {
  writeFileSync(new URL(`${file}.svg`, outDir), render(word));
  console.log(`${file}.svg  <-  ${word}`);
}
