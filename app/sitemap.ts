import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/cms";
import { absoluteUrl, seoPages } from "@/lib/seo";

// Cached like the pages; CMS saves clear it along with them.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  return [
    ...Object.keys(seoPages).map((path) => ({ url: absoluteUrl(path) })),
    ...posts.filter((post) => post.slug).map((post) => ({
      url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
      ...(post.updatedAt && !Number.isNaN(Date.parse(post.updatedAt)) ? { lastModified: post.updatedAt } : {})
    }))
  ];
}
