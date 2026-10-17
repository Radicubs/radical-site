// node --env-file=.env --import tsx scripts/upload-cad-model.ts optimized.glb [--use]
// Storage serves files exactly as uploaded (no compression), so the model is stored
// gzipped as .glb.gz and the viewer unpacks it in the browser. A plain .glb is gzipped
// here; a .glb.gz is uploaded as is. Uploads through Payload's Supabase adapter.
// Without --use the file is only uploaded and verified. With --use it also becomes the
// CAD card's model; only do that once the site code that reads .glb.gz is deployed.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync, gzipSync, constants } from "node:zlib";
import { getPayload } from "payload";
import config from "../payload.config";

for (const name of ["S3_BUCKET", "S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "MEDIA_PUBLIC_URL"]) {
  if (!process.env[name]) throw new Error(`${name} is required to upload to Supabase.`);
}
const source = process.argv.find((arg, i) => i > 1 && !arg.startsWith("--"));
if (!source) throw new Error("Pass the optimized .glb (or .glb.gz) path.");
const use = process.argv.includes("--use");
const input = await readFile(source);
const gzipped = input[0] === 0x1f && input[1] === 0x8b;
const glb = gzipped ? gunzipSync(input) : input;
if (glb.toString("ascii", 0, 4) !== "glTF") throw new Error("The model must be a binary GLB.");
const data = gzipped ? input : gzipSync(glb, { level: constants.Z_BEST_COMPRESSION });
const hash = createHash("sha256").update(glb).digest("hex").slice(0, 12);
const filename = `cad-robot-${hash}.glb.gz`;
const payload = await getPayload({ config });
let failed = false;
try {
  // Check that the destination card exists before creating an upload.
  const home = await payload.findGlobal({ slug: "home-page", depth: 0 });
  if (!home.disciplines?.some(card => card.title.trim().toLowerCase() === "cad")) throw new Error("The homepage has no CAD discipline card.");
  const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, depth: 0, limit: 1 });
  const media = existing.docs[0] ?? await payload.create({
    collection: "media",
    data: { alt: "Interactive 2026 Radicubs robot CAD model" },
    file: { data, mimetype: "application/gzip", name: filename, size: data.length }
  });
  if (!media.url) throw new Error("The uploaded media record has no file URL.");
  const publicUrl = `${process.env.MEDIA_PUBLIC_URL!.replace(/\/$/, "")}/${encodeURIComponent(media.filename!)}`;
  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error(`Supabase model verification failed (${response.status}).`);
  const uploaded = Buffer.from(await response.arrayBuffer());
  // fetch() unpacks the body itself if storage ever labels it Content-Encoding: gzip.
  if (!uploaded.equals(data) && !uploaded.equals(glb)) throw new Error("The uploaded model does not match the source.");

  if (use) {
    // Read again immediately before saving to preserve other card edits.
    const latest = await payload.findGlobal({ slug: "home-page", depth: 0 });
    const cards = latest.disciplines!.map(card => card.title.trim().toLowerCase() === "cad" ? { ...card, photo: media.id } : card);
    await payload.updateGlobal({ slug: "home-page", data: { disciplines: cards }, depth: 0 });
    const confirmed = await payload.findGlobal({ slug: "home-page", depth: 1 });
    const selected = confirmed.disciplines?.find(card => card.title.trim().toLowerCase() === "cad")?.photo;
    if (!selected || typeof selected !== "object" || selected.id !== media.id) throw new Error("CAD card did not retain the uploaded model.");
  }
  console.log(JSON.stringify({ mediaId: media.id, filename: media.filename, glbBytes: glb.length, storedBytes: data.length, verified: true, selectedOnCadCard: use, editor: "Homepage → Discipline cards → CAD → Photo or 3D model" }));
} catch (error) {
  failed = true;
  console.error(error);
}
// Payload's shutdown can hang after the work is done; give it a few seconds, then exit.
await Promise.race([
  Promise.allSettled([payload.db.pool.end(), payload.destroy()]),
  new Promise(resolve => setTimeout(resolve, 5000))
]);
process.exit(failed ? 1 : 0);
