import { DeleteObjectsCommand, ListObjectsV2Command, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import type { CollectionAfterChangeHook, Plugin } from "payload";

// Browser uploads go straight to storage under their original name, in a folder of their
// own (_objectKey). The server then shrinks and converts that file and stores the result
// under the final name in the same folder, but nothing removes the raw upload. This
// deletes whatever else is in the folder once the photo and its resized copies are stored.
// Added after the storage plugin, so its hook has already finished uploading.
export const removeUploadLeftovers = (bucket: string, s3: S3ClientConfig): Plugin => (config) => {
  const client = new S3Client(s3);
  const cleanUp: CollectionAfterChangeHook = async ({ doc }) => {
    const media = doc as { _objectKey?: string | null; prefix?: string | null; filename?: string | null; sizes?: Record<string, { filename?: string | null } | undefined> };
    if (!media._objectKey || !media.filename) return doc;
    try {
      const folder = `${[media.prefix, media._objectKey].filter(Boolean).join("/")}/`;
      const keep = new Set([media.filename, ...Object.values(media.sizes ?? {}).map((size) => size?.filename)].filter(Boolean).map((name) => folder + name));
      const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: folder }));
      const keys = (listed.Contents ?? []).flatMap((object) => (object.Key ? [object.Key] : []));
      // Only tidy up once the final file is really there.
      if (!keys.includes(folder + media.filename)) return doc;
      const leftovers = keys.filter((key) => !keep.has(key));
      if (leftovers.length) await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: leftovers.map((Key) => ({ Key })) } }));
    } catch (error) {
      // A leftover file only costs storage; never fail the save over it.
      console.error("Couldn't remove upload leftovers:", error instanceof Error ? error.message : error);
    }
    return doc;
  };
  return {
    ...config,
    collections: config.collections?.map((collection) => collection.slug !== "media" ? collection : {
      ...collection,
      hooks: { ...collection.hooks, afterChange: [...(collection.hooks?.afterChange ?? []), cleanUp] }
    })
  };
};
