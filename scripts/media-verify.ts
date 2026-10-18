// node --env-file=.env --import tsx scripts/media-verify.ts
// Read-only: checks that every media file and resized copy loads from public storage.
import { getPayload } from "payload";
import config from "../payload.config";

const base = process.env.MEDIA_PUBLIC_URL!.replace(/\/$/, "");
const payload = await getPayload({ config });
const urls: { id: number; url: string }[] = [];
for (let page = 1; ; page++) {
  const result = await payload.find({ collection: "media", depth: 0, limit: 200, page });
  for (const doc of result.docs) {
    for (const url of [doc.url, ...Object.values(doc.sizes ?? {}).map((size) => (size as { url?: string | null } | undefined)?.url)]) {
      if (url) urls.push({ id: doc.id, url: url.startsWith("/media/") ? `${base}/${url.slice(7)}` : url });
    }
  }
  if (!result.hasNextPage) break;
}
const broken: string[] = [];
// Supabase rate-limits bursts (429), so go a few at a time and back off on those.
const check = async (url: string): Promise<number> => {
  for (let attempt = 0; attempt < 6; attempt++) {
    const status = (await fetch(url, { method: "HEAD" }).catch(() => undefined))?.status ?? 0;
    if (status !== 429) return status;
    await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
  }
  return 429;
};
for (let i = 0; i < urls.length; i += 4) {
  await Promise.all(urls.slice(i, i + 4).map(async ({ id, url }) => {
    const status = await check(url);
    if (status < 200 || status >= 300) broken.push(`#${id} ${status || "failed"} ${url}`);
  }));
}
console.log(`${urls.length} files checked, ${broken.length} broken`);
for (const line of broken) console.log(line);
process.exit(0);
