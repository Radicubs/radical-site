// Usage: node scripts/optimize-cad-model.mjs /path/to/original.glb [/path/to/studio.hdr]
// Studio HDR source: https://raw.githubusercontent.com/pmndrs/drei-assets/master/hdri/studio_small_03_1k.hdr
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FloatType } from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

const source = process.argv[2];
if (!source) throw new Error("Pass the original GLB path as the first argument.");
const root = new URL("../", import.meta.url);
const model = fileURLToPath(new URL("public/models/2026-robot-viewer-v2.glb", root));
const cli = fileURLToPath(new URL("node_modules/@gltf-transform/cli/bin/cli.js", root));
const optimized = spawnSync(process.execPath, [cli, "optimize", source, model,
  "--compress", "meshopt", "--texture-compress", "webp", "--texture-size", "256",
  "--simplify-error", "0.001", "--simplify-ratio", "0.2", "--instance-min", "2"
], { stdio: "inherit" });
if (optimized.status !== 0) process.exit(optimized.status ?? 1);

if (process.argv[3]) {
  const input = await readFile(process.argv[3]);
  const hdr = new HDRLoader().setDataType(FloatType).parse(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
  const width = 256;
  const height = Math.round(hdr.height * width / hdr.width);
  const chunks = [Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${height} +X ${width}\n`)];
  for (let y = 0; y < height; y++) {
    const scanline = new Uint8Array(width * 4);
    for (let x = 0; x < width; x++) {
      const color = [0, 0, 0];
      let count = 0;
      for (let sy = Math.floor(y * hdr.height / height); sy < Math.floor((y + 1) * hdr.height / height); sy++) {
        for (let sx = Math.floor(x * hdr.width / width); sx < Math.floor((x + 1) * hdr.width / width); sx++) {
          const offset = (sy * hdr.width + sx) * 4;
          for (let c = 0; c < 3; c++) color[c] += hdr.data[offset + c];
          count++;
        }
      }
      const maximum = Math.max(...color) / count;
      if (maximum < 1e-32) continue;
      const exponent = Math.floor(Math.log2(maximum)) + 1;
      const scale = 256 / (2 ** exponent * count);
      for (let c = 0; c < 3; c++) scanline[c * width + x] = Math.min(255, Math.floor(color[c] * scale));
      scanline[3 * width + x] = exponent + 128;
    }
    chunks.push(Buffer.from([2, 2, width >> 8, width & 255]));
    // Radiance RLE literal blocks, one channel at a time.
    for (let offset = 0; offset < scanline.length; offset += 128) {
      chunks.push(Buffer.from([128]), Buffer.from(scanline.subarray(offset, offset + 128)));
    }
  }
  const output = Buffer.concat(chunks);
  // Decode the generated map to verify dimensions and numeric data before writing.
  const decoded = new HDRLoader().setDataType(FloatType).parse(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength));
  if (decoded.width !== width || decoded.height !== height || !decoded.data.every(Number.isFinite)) throw new Error("Invalid optimized HDR map");
  await writeFile(new URL("public/models/studio-small-03-256.hdr", root), output);
  console.log(`Lighting: ${input.length} → ${output.length} bytes`);
}
