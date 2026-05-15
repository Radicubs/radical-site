const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const mapProject = (item) => {
  const attributes = item?.attributes ?? item;

  const title = attributes?.Title ?? '';
  const description = attributes?.Description ?? '';
  const timeline = attributes?.Timeline ?? '';

  if (!title || !description) return null;

  return {
    id: attributes?.id ?? item?.id ?? null,
    title,
    description,
    timeline,
    button: Boolean(attributes?.Button),
    buttonText: attributes?.ButtonText ?? '',
    buttonLink: attributes?.ButtonLink ?? '',
  };
};

export async function fetchProjects({ signal, limit = 100 } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/projects', baseUrl);
  const params = new URLSearchParams();
  params.set('sort', 'createdAt:asc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'Title');
  params.append('fields[1]', 'Description');
  params.append('fields[2]', 'Timeline');
  params.append('fields[3]', 'Button');
  params.append('fields[4]', 'ButtonText');
  params.append('fields[5]', 'ButtonLink');
  url.search = params.toString();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    return rows.map(mapProject).filter(Boolean);
  } catch {
    return [];
  }
}
