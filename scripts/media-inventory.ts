// node --env-file=.env --import tsx scripts/media-inventory.ts
// Read-only: counts the media library by type and adds up what originals and resized copies take.
import { getPayload } from "payload";
import config from "../payload.config";

const payload = await getPayload({ config });
const byType = new Map<string, { count: number; original: number; copies: number }>();
let page = 1;
for (;;) {
  const result = await payload.find({ collection: "media", depth: 0, limit: 200, page, pagination: true });
  for (const doc of result.docs) {
    const type = doc.mimeType ?? "unknown";
    const row = byType.get(type) ?? { count: 0, original: 0, copies: 0 };
    row.count++;
    row.original += doc.filesize ?? 0;
    row.copies += Object.values(doc.sizes ?? {}).reduce((sum, size) => sum + ((size as { filesize?: number | null })?.filesize ?? 0), 0);
    byType.set(type, row);
  }
  if (!result.hasNextPage) break;
  page++;
}
const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;
for (const [type, row] of [...byType].sort((a, b) => b[1].original - a[1].original)) {
  console.log(`${type.padEnd(28)} ${String(row.count).padStart(5)} files  originals ${mb(row.original).padStart(10)}  resized copies ${mb(row.copies).padStart(10)}`);
}
process.exit(0);
