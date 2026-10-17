// node --env-file=.env --import tsx scripts/upload-cad-model.ts [optimized.glb]
// Upload through Payload's existing Supabase adapter, then select the file in
// the CAD card's existing `photo` relationship. No schema changes are needed.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getPayload } from "payload";
import config from "../payload.config";

for (const name of ["S3_BUCKET", "S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "MEDIA_PUBLIC_URL"]) {
  if (!process.env[name]) throw new Error(`${name} is required to upload to Supabase.`);
}
const source = process.argv[2] ?? "public/models/2026-robot-viewer-v2.glb";
const data = await readFile(source);
if (data.toString("ascii", 0, 4) !== "glTF") throw new Error("The model must be a binary GLB.");
const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
const filename = `cad-robot-${hash}.glb`;
const payload = await getPayload({ config });
try {
  // Check that the destination card exists before creating an upload.
  const home = await payload.findGlobal({ slug: "home-page", depth: 0 });
  if (!home.disciplines?.some(card => card.title.trim().toLowerCase() === "cad")) throw new Error("The homepage has no CAD discipline card.");
  const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, depth: 0, limit: 1 });
  const media = existing.docs[0] ?? await payload.create({
    collection: "media",
    data: { alt: "Interactive 2026 Radicubs robot CAD model" },
    file: { data, mimetype: "model/gltf-binary", name: filename, size: data.length }
  });
  if (!media.url) throw new Error("The uploaded media record has no file URL.");
  const publicUrl = `${process.env.MEDIA_PUBLIC_URL!.replace(/\/$/, "")}/${encodeURIComponent(media.filename!)}`;
  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error(`Supabase model verification failed (${response.status}).`);
  const uploaded = Buffer.from(await response.arrayBuffer());
  if (!uploaded.equals(data)) throw new Error("The uploaded model does not match the source.");

  // Read again immediately before saving to preserve other card edits.
  const latest = await payload.findGlobal({ slug: "home-page", depth: 0 });
  const cards = latest.disciplines!.map(card => card.title.trim().toLowerCase() === "cad" ? { ...card, photo: media.id } : card);
  await payload.updateGlobal({ slug: "home-page", data: { disciplines: cards }, depth: 0 });
  const confirmed = await payload.findGlobal({ slug: "home-page", depth: 1 });
  const selected = confirmed.disciplines?.find(card => card.title.trim().toLowerCase() === "cad")?.photo;
  if (!selected || typeof selected !== "object" || selected.id !== media.id) throw new Error("CAD card did not retain the uploaded model.");
  console.log(JSON.stringify({ mediaId: media.id, filename: media.filename, url: media.url, bytes: uploaded.length, verified: true, editor: "Homepage → Discipline cards → CAD → Photo or 3D model" }));
} finally {
  await payload.db.pool.end();
  await payload.destroy();
}
