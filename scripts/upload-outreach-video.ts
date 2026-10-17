// node --env-file=.env --import tsx scripts/upload-outreach-video.ts encoded.mp4
// Encode first (960×720 keeps the VHS look at about half the bytes):
//   ffmpeg -i RadiCamp2026.mp4 -vf scale=960:720 -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p \
//     -c:a aac -b:a 96k -movflags +faststart encoded.mp4
// Uploads through Payload's Supabase adapter and selects it as the outreach hero video.
// The previous video stays in the media library, so switching back is one click.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getPayload } from "payload";
import config from "../payload.config";

for (const name of ["S3_BUCKET", "S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "MEDIA_PUBLIC_URL"]) {
  if (!process.env[name]) throw new Error(`${name} is required to upload to Supabase.`);
}
const source = process.argv[2];
if (!source) throw new Error("Pass the encoded MP4 path as the first argument.");
const data = await readFile(source);
if (data.toString("ascii", 4, 8) !== "ftyp") throw new Error("The video must be an MP4.");
const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
const filename = `radicamp-hero-${hash}.mp4`;
const payload = await getPayload({ config });
try {
  const existing = await payload.find({ collection: "media", where: { filename: { equals: filename } }, depth: 0, limit: 1 });
  const media = existing.docs[0] ?? await payload.create({
    collection: "media",
    data: { alt: "RadiCamp 2026 summer robotics camp" },
    file: { data, mimetype: "video/mp4", name: filename, size: data.length }
  });
  const publicUrl = `${process.env.MEDIA_PUBLIC_URL!.replace(/\/$/, "")}/${encodeURIComponent(media.filename!)}`;
  const response = await fetch(publicUrl);
  if (!response.ok) throw new Error(`Supabase video verification failed (${response.status}).`);
  if (!Buffer.from(await response.arrayBuffer()).equals(data)) throw new Error("The uploaded video does not match the source.");

  const before = await payload.findGlobal({ slug: "outreach-page", depth: 0 });
  await payload.updateGlobal({ slug: "outreach-page", data: { heroVideo: media.id }, depth: 0 });
  const confirmed = await payload.findGlobal({ slug: "outreach-page", depth: 0 });
  if (confirmed.heroVideo !== media.id) throw new Error("Outreach page did not retain the uploaded video.");
  console.log(JSON.stringify({ mediaId: media.id, filename: media.filename, bytes: data.length, previousVideo: before.heroVideo, editor: "Outreach page → Background video" }));
} finally {
  await payload.db.pool.end();
  await payload.destroy();
}
