import type { CollectionBeforeOperationHook, CollectionConfig } from "payload";
import { contentAccess, contentHooks } from "../access";

// Resized copies are made on upload, so visitors download the smallest image
// that fills its slot (the site builds an <img srcset> from these).
const webp = { format: "webp" as const, options: { quality: 80 } };

// Media is cached at Vercel's edge and in browsers, so every upload gets its own URL:
// a replaced photo can never reuse the old file's name and keep showing the old image.
// Names that already carry a content hash (from the upload scripts) are left alone.
const uniqueFilename: CollectionBeforeOperationHook = ({ operation, req }) => {
  const file = req.file;
  if ((operation !== "create" && operation !== "update") || !file?.name || /-[0-9a-f]{12}\./i.test(file.name)) return;
  const dot = file.name.indexOf(".");
  const [base, extension] = dot > 0 ? [file.name.slice(0, dot), file.name.slice(dot)] : [file.name, ""];
  file.name = `${base}-${Date.now().toString(36)}${extension}`;
};

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo or video", plural: "Photos & videos" },
  admin: {
    group: "Library",
    description: "Every photo, video and file on the site. Upload here, or straight from any image field.",
    defaultColumns: ["filename", "alt", "updatedAt"]
  },
  access: contentAccess,
  hooks: { ...contentHooks, beforeOperation: [uniqueFilename] },
  upload: {
    staticDir: "media",
    // Images narrower than the thumbnail size get no resized copy, so preview those
    // with the original. Videos and other files show the default file icon.
    adminThumbnail: ({ doc }) => {
      const media = doc as { mimeType?: string; url?: string; sizes?: { thumbnail?: { url?: string } } };
      if (!media.mimeType?.startsWith("image/")) return false;
      return media.sizes?.thumbnail?.url || media.url || false;
    },
    // Camera originals are shrunk on upload; nothing on the site is shown wider than this.
    resizeOptions: { width: 2560, height: 2560, fit: "inside", withoutEnlargement: true },
    focalPoint: true,
    crop: true,
    imageSizes: [
      { name: "thumbnail", width: 400, formatOptions: webp },
      { name: "small", width: 768, formatOptions: webp },
      { name: "medium", width: 1200, formatOptions: webp },
      { name: "large", width: 1920, formatOptions: webp }
    ]
  },
  fields: [
    {
      name: "alt",
      label: "Description",
      type: "text",
      admin: { description: "What's in the picture, for screen readers and search engines. e.g. \"Two students wiring the robot\"." }
    }
  ]
};
