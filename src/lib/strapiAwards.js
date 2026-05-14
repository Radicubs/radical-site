const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const mapAward = (item) => {
  const attributes = item?.attributes ?? item;
  const year = attributes?.Year ?? null;
  const event = attributes?.Place ?? '';
  const name = attributes?.Name ?? '';

  if (year == null || (!event && !name)) return null;

  return {
    year,
    event,
    name,
  };
};

export async function fetchLatestAwards({ limit = 8, signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/awards', baseUrl);
  const params = new URLSearchParams();
  params.set('sort', 'Year:desc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'Year');
  params.append('fields[1]', 'Place');
  params.append('fields[2]', 'Name');
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

    return rows.map(mapAward).filter(Boolean);
  } catch {
    return [];
  }
}
