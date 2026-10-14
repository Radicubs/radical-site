import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/cms";
import { absoluteUrl, seoPages } from "@/lib/seo";

// Read the same published CMS content as /blog at request time.
export const dynamic = "force-dynamic";

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
