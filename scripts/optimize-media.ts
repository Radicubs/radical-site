// node --env-file=.env --import tsx scripts/optimize-media.ts [--apply] [--limit N] [--id N]
// Re-encodes JPEG and PNG originals in the media library as WebP. Without --apply it only
// downloads, converts in memory and reports what would be saved. With --apply each photo's
// file is replaced through Payload (resized copies are rebuilt and the old files deleted
// from storage), after the original is copied to ./media-backup/<id>-<filename>.
// Local development shares the live database and bucket, so --apply changes the live site.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPayload, type Where } from "payload";
import sharp from "sharp";
import config from "../payload.config";
import type { Media } from "../cms/payload-types";

const apply = process.argv.includes("--apply");
const flag = (name: string) => {
  const index = process.argv.indexOf(name);
  return index > 0 ? Number(process.argv[index + 1]) : undefined;
};
const limit = flag("--limit");
const onlyId = flag("--id");
const publicBase = process.env.MEDIA_PUBLIC_URL?.replace(/\/$/, "");
if (!publicBase) throw new Error("MEDIA_PUBLIC_URL is required to download originals.");

// Same ceiling as the Media collection's resizeOptions.
const MAX_SIDE = 2560;
// Only replace a file when this saves at least 15%; smaller wins aren't worth a new URL.
const MIN_SAVING = 0.15;
const backupDir = path.resolve("media-backup");

async function encode(input: Buffer, mimeType: string) {
  const image = sharp(input, { failOn: "none" }).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
  const { hasAlpha } = await sharp(input).metadata();
  // Transparent or small PNGs are usually logos and graphics: near-lossless keeps their edges
  // crisp. Large opaque PNGs are photos, and get the same lossy setting as JPEGs.
  const graphic = mimeType === "image/png" && (hasAlpha || input.length < 500_000);
  return graphic ? image.webp({ nearLossless: true, quality: 60, effort: 6 }).toBuffer() : image.webp({ quality: 80, effort: 6, smartSubsample: true }).toBuffer();
}

// Drops the extension and the upload timestamp the Media collection adds, which it adds again on save.
const baseName = (filename: string) => filename.replace(/\.[^.]+$/, "").replace(/-(?=[0-9a-z]*\d)[0-9a-z]{8}$/, "");

const payload = await getPayload({ config });
let failed = false;
const totals = { checked: 0, replaced: 0, skipped: 0, errors: 0, before: 0, after: 0 };
try {
  const where: Where = onlyId ? { id: { equals: onlyId } } : { mimeType: { in: ["image/jpeg", "image/png"] } };
  const docs: Media[] = [];
  for (let page = 1; ; page++) {
    const result = await payload.find({ collection: "media", where, depth: 0, limit: 100, page, sort: "id" });
    docs.push(...result.docs);
    if (!result.hasNextPage) break;
  }
  if (apply) await mkdir(backupDir, { recursive: true });

  for (const doc of docs.slice(0, limit ?? docs.length)) {
    const label = `#${doc.id} ${doc.filename}`;
    try {
      if (!doc.url || !doc.filename || !doc.mimeType) throw new Error("no file");
      const source = doc.url.startsWith("/media/") ? `${publicBase}/${doc.url.slice("/media/".length)}` : doc.url;
      const response = await fetch(source);
      const backup = path.join(backupDir, `${doc.id}-${doc.filename}`);
      // If an earlier run was cut off after storage dropped the old file, its backup is the original.
      const input = response.ok ? Buffer.from(await response.arrayBuffer()) : await readFile(backup).catch(() => {
        throw new Error(`download failed (${response.status}) and no backup at ${backup}`);
      });
      const output = await encode(input, doc.mimeType);
      totals.checked++;
      const saving = 1 - output.length / input.length;
      if (saving < MIN_SAVING) {
        totals.skipped++;
        console.log(`skip   ${label}: ${(input.length / 1e3).toFixed(0)} KB → ${(output.length / 1e3).toFixed(0)} KB`);
        continue;
      }
      totals.before += input.length;
      totals.after += output.length;
      console.log(`${apply ? "write " : "would "} ${label}: ${(input.length / 1e3).toFixed(0)} KB → ${(output.length / 1e3).toFixed(0)} KB (−${Math.round(saving * 100)}%)`);
      if (!apply) continue;

      if (response.ok) await writeFile(backup, input);
      await payload.update({
        collection: "media",
        id: doc.id,
        // Keep the editor-chosen focal point; a new file would otherwise reset it to the centre.
        data: { focalX: doc.focalX, focalY: doc.focalY },
        file: { data: output, mimetype: "image/webp", name: `${baseName(doc.filename)}.webp`, size: output.length },
        depth: 0
      });
      totals.replaced++;
    } catch (error) {
      totals.errors++;
      console.error(`error  ${label}:`, error instanceof Error ? error.message : error);
    }
  }
  const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;
  console.log(`\n${apply ? "Replaced" : "Would replace"} ${apply ? totals.replaced : totals.checked - totals.skipped} of ${totals.checked} originals: ${mb(totals.before)} → ${mb(totals.after)} (saves ${mb(totals.before - totals.after)}). ${totals.skipped} already small enough, ${totals.errors} errors.`);
  if (apply && totals.replaced) console.log("Scripts can't clear the site's page cache: save anything in the live editor (e.g. Site settings) so pages pick up the new photo URLs.");
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
