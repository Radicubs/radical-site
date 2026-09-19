// Converts the supplied subsystem label SVGs into a coordinate table the page
// can render as inline SVG, so each stroke carries its own index and can be
// drawn independently by the separation.
//
//   node scrollcraft/builds/robot/gen-label-strokes.mjs
import { readFileSync, writeFileSync } from "node:fs";

const ids = ["intake", "hopper", "shooter", "drivetrain", "electronics"];
let out =
  `// GENERATED from public/robot/labels/*.svg by\n` +
  `// scrollcraft/builds/robot/gen-label-strokes.mjs. Do not hand-edit.\n\n` +
  `export type LabelArt = { w: number; h: number; lines: [number, number, number, number][] };\n\n` +
  `export const labelArt: Record<string, LabelArt> = {\n`;

for (const id of ids) {
  const svg = readFileSync(`public/robot/labels/${id}.svg`, "utf8");
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const lines = [...svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"\/>/g)]
    .map((m) => m.slice(1, 5).map(Number));
  out += `  ${id}: { w: ${vb[1]}, h: ${vb[2]}, lines: [\n`;
  for (const l of lines) out += `    [${l.join(", ")}],\n`;
  out += `  ] },\n`;
}
out += `};\n`;

writeFileSync("components/robot/label-art.ts", out);
console.log(`components/robot/label-art.ts  ${ids.length} labels`);
