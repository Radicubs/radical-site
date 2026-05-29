const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const normalizeMediaUrl = (media, baseUrl) => {
  if (!media) return null;
  const data = media?.data ?? media;
  const attributes = data?.attributes ?? data;
  const url = attributes?.url;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${baseUrl}${url}`;
};

const mapBlogPost = (item, baseUrl) => {
  const attributes = item?.attributes ?? item;
  if (!attributes) return null;

  const slug = typeof attributes?.Slug === 'string' ? attributes.Slug : '';
  const title = typeof attributes?.Title === 'string' ? attributes.Title : '';
  const description = typeof attributes?.Description === 'string' ? attributes.Description : '';
  const date = attributes?.PublishedDate ?? attributes?.publishedAt ?? '';

  if (!slug || !title) return null;

  return {
    id: item?.id ?? attributes?.id ?? null,
    slug,
    title,
    description,
    date,
    imageUrl: normalizeMediaUrl(attributes?.Image, baseUrl),
    body: Array.isArray(attributes?.Body) ? attributes.Body : attributes?.Body ?? [],
  };
};

export async function fetchAllBlogPosts({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/blog-posts', baseUrl);
  const params = new URLSearchParams();
  params.set('sort', 'PublishedDate:desc');
  params.set('populate', 'Image');
  url.search = params.toString();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map((row) => mapBlogPost(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchLatestBlogPosts({ limit = 4, signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/blog-posts', baseUrl);
  const params = new URLSearchParams();
  params.set('sort', 'PublishedDate:desc');
  params.set('pagination[pageSize]', String(limit));
  params.set('populate', 'Image');
  url.search = params.toString();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map((row) => mapBlogPost(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchBlogPostBySlug({ slug, signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl || !slug) return null;

  const url = new URL('/api/blog-posts', baseUrl);
  const params = new URLSearchParams();
  params.set('filters[Slug][$eq]', slug);
  params.set('populate', 'Image');
  url.search = params.toString();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!res.ok) return null;

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const mapped = rows.map((row) => mapBlogPost(row, baseUrl)).filter(Boolean);
    return mapped[0] ?? null;
  } catch {
    return null;
  }
}
