import type { CollectionConfig } from "payload";
import { contentAccess, contentHooks } from "../access";

// Resized copies are made on upload, so visitors download the smallest image
// that fills its slot (the site builds an <img srcset> from these).
const webp = { format: "webp" as const, options: { quality: 80 } };

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo or video", plural: "Photos & videos" },
  admin: {
    group: "Library",
    description: "Every photo, video and file on the site. Upload here, or straight from any image field.",
    defaultColumns: ["filename", "alt", "updatedAt"]
  },
  access: contentAccess,
  hooks: contentHooks,
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
