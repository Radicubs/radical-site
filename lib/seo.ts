import type { Metadata } from "next";

// Use the production origin even on preview deployments; never derive canonical
// URLs from the request Host header or a temporary Vercel deployment URL.
export const siteUrl = new URL(process.env.SITE_URL || "https://radicubs.com").origin;
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();
export const socialImage = {
  url: absoluteUrl("/social-card.png"),
  width: 1200,
  height: 630,
  alt: "Radicubs — FRC Team 7503 in Frisco, Texas"
};

// Pages listed in the sitemap. Their titles and descriptions are edited in the CMS
// (Page text → each page's "Search result" fields; defaults in lib/page-text.ts).
export const indexedPaths = ["/", "/team", "/mentors", "/journey", "/outreach", "/gallery", "/sponsors", "/blog", "/contact"] as const;

export function pageMetadata(path: string, content: { title: string; description: string; image?: string }): Metadata {
  const { title, description } = content;
  const images = content.image ? [{ url: absoluteUrl(content.image), alt: title }] : [socialImage];
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { title, description, url: absoluteUrl(path), siteName: "Radicubs", locale: "en_US", type: "website", images },
    twitter: { card: "summary_large_image", title, description, images: images.map((image) => image.url) }
  };
}

export const textMetadata = (path: string, text: { seoTitle: string; seoDescription: string }) =>
  pageMetadata(path, { title: text.seoTitle, description: text.seoDescription });

// CMS strings must never be able to close a JSON-LD script element.
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
