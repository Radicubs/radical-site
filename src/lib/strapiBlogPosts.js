import { getStrapiBaseUrl, resolveMediaUrl, strapiGetMany, strapiGet } from './strapiUtils.js';

const mapBlogPost = (item, baseUrl) => {
  const a = item?.attributes ?? item;
  if (!a) return null;

  const slug = typeof a?.Slug === 'string' ? a.Slug : '';
  const title = typeof a?.Title === 'string' ? a.Title : '';
  const description = typeof a?.Description === 'string' ? a.Description : '';
  const date = a?.PublishedDate ?? a?.publishedAt ?? '';

  if (!slug || !title) return null;

  return {
    id: item?.id ?? a?.id ?? null,
    slug,
    title,
    description,
    date,
    imageUrl: resolveMediaUrl(a?.Image, baseUrl),
    body: Array.isArray(a?.Body) ? a.Body : a?.Body ?? [],
  };
};

export async function fetchAllBlogPosts({ signal } = {}) {
  const params = new URLSearchParams();
  params.set('sort', 'PublishedDate:desc');
  params.set('populate', 'Image');

  return strapiGetMany('/api/blog-posts', params, mapBlogPost, signal);
}

export async function fetchLatestBlogPosts({ limit = 4, signal } = {}) {
  const params = new URLSearchParams();
  params.set('sort', 'PublishedDate:desc');
  params.set('pagination[pageSize]', String(limit));
  params.set('populate', 'Image');

  return strapiGetMany('/api/blog-posts', params, mapBlogPost, signal);
}

export async function fetchBlogPostBySlug({ slug, signal } = {}) {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl || !slug) return null;

  const params = new URLSearchParams();
  params.set('filters[Slug][$eq]', slug);
  params.set('populate', 'Image');

  const json = await strapiGet('/api/blog-posts', params, signal);
  const rows = Array.isArray(json?.data) ? json.data : [];
  const mapped = rows.map((row) => mapBlogPost(row, baseUrl)).filter(Boolean);
  return mapped[0] ?? null;
}
