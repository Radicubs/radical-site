// node --env-file=.env --import tsx scripts/sweep-media-bucket.ts [--apply]
// Lists files in the media bucket that no media record points to: raw browser uploads the
// server later renamed, and copies left by interrupted saves. Without --apply it only
// reports them. With --apply it deletes them. A file is kept if its name appears anywhere
// in the CMS content (as a pasted link, say), even when no media record owns it.
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getPayload } from "payload";
import config from "../payload.config";

const apply = process.argv.includes("--apply");
const bucket = process.env.S3_BUCKET;
if (!bucket) throw new Error("S3_BUCKET is required.");
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! }
});
// Files this new are left alone: an upload may be between its storage and database steps.
const MIN_AGE_MS = 24 * 60 * 60 * 1000;

const payload = await getPayload({ config });
let failed = false;
try {
  const referenced = new Set<string>();
  for (let page = 1; ; page++) {
    const result = await payload.find({ collection: "media", depth: 0, limit: 200, page });
    for (const doc of result.docs) {
      const folder = [(doc as { prefix?: string | null }).prefix, doc._objectKey].filter(Boolean).join("/");
      for (const name of [doc.filename, ...Object.values(doc.sizes ?? {}).map((size) => (size as { filename?: string | null } | undefined)?.filename)]) {
        if (name) referenced.add(folder ? `${folder}/${name}` : name);
      }
    }
    if (!result.hasNextPage) break;
  }

  // Everything else the CMS stores, as one string to search for pasted file names.
  const content: unknown[] = [];
  for (const collection of payload.config.collections.map((c) => c.slug).filter((slug) => slug !== "media" && !slug.startsWith("payload-"))) {
    for (let page = 1; ; page++) {
      const result = await payload.find({ collection, depth: 0, limit: 200, page, draft: true });
      content.push(...result.docs);
      if (!result.hasNextPage) break;
    }
  }
  for (const global of payload.config.globals) content.push(await payload.findGlobal({ slug: global.slug, depth: 0, draft: true }));
  const contentText = decodeURIComponent(JSON.stringify(content).replace(/%(?![0-9a-f]{2})/gi, "%25"));

  const objects: { key: string; size: number; modified: Date }[] = [];
  let token: string | undefined;
  do {
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }));
    for (const object of listed.Contents ?? []) if (object.Key) objects.push({ key: object.Key, size: object.Size ?? 0, modified: object.LastModified ?? new Date() });
    token = listed.NextContinuationToken;
  } while (token);

  const unused = objects.filter(({ key, modified }) => !referenced.has(key)
    && !contentText.includes(key.split("/").pop()!)
    && Date.now() - modified.getTime() > MIN_AGE_MS);
  const total = unused.reduce((sum, object) => sum + object.size, 0);
  for (const object of unused) console.log(`${apply ? "delete" : "unused"} ${object.key} (${(object.size / 1e3).toFixed(0)} KB)`);
  console.log(`\n${objects.length} files in the bucket, ${referenced.size} owned by media records. ${unused.length} unused, ${(total / 1e6).toFixed(1)} MB.`);

  if (apply) {
    for (let i = 0; i < unused.length; i += 500) {
      await s3.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: unused.slice(i, i + 500).map(({ key }) => ({ Key: key })) } }));
    }
    console.log(`Deleted ${unused.length} files.`);
  }
} catch (error) {
  failed = true;
  console.error(error);
}
await Promise.race([
  Promise.allSettled([payload.db.pool.end(), payload.destroy()]),
  new Promise(resolve => setTimeout(resolve, 5000))
]);
process.exit(failed ? 1 : 0);
