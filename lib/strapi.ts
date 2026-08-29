import "server-only";

type QueryValue = string | number | boolean | undefined;

export type StrapiMediaAttributes = {
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number;
  height?: number;
  url: string;
  formats?: Record<string, {
    url: string;
    width?: number;
    height?: number;
  }> | null;
};

export type StrapiEntity<T> = { id: number; attributes: T };
export type StrapiMedia = StrapiEntity<StrapiMediaAttributes>;
export type StrapiRelation<T> = { data: T | null };

const REVALIDATE_SECONDS = 300;

export async function strapiFetch<T>(
  endpoint: string,
  query: Record<string, QueryValue> = {}
): Promise<T | null> {
  const baseUrl = process.env.STRAPI_URL;
  const token = process.env.STRAPI_API_TOKEN;
  if (!baseUrl || !token) return null;

  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = new URL(`/api/${cleanEndpoint}`, baseUrl);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: REVALIDATE_SECONDS }
    });
    if (!response.ok) {
      console.error(`Strapi request failed for ${cleanEndpoint}: ${response.status}`);
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Strapi request failed for ${cleanEndpoint}`, error instanceof Error ? error.message : error);
    return null;
  }
}

export function strapiUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = process.env.STRAPI_URL;
  if (!baseUrl) return undefined;
  return new URL(path, baseUrl).toString();
}

export function mediaVariant(
  media: StrapiMediaAttributes,
  preferred: string[]
): { url: string; width?: number; height?: number } {
  for (const key of preferred) {
    const format = media.formats?.[key];
    if (format?.url) return format;
  }
  return { url: media.url, width: media.width, height: media.height };
}
