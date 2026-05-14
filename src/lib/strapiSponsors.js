const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const absolutizeUrl = (maybeRelativeUrl, baseUrl) => {
  if (typeof maybeRelativeUrl !== 'string' || maybeRelativeUrl.trim().length === 0) return null;
  const url = maybeRelativeUrl.trim();

  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (!baseUrl) return url;

  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

const pickLogoUrl = (logo) => {
  if (!logo) return null;

  // Common Strapi REST shapes
  // - { data: { attributes: { url } } }
  // - { data: { url } }
  // - { url }
  const nested = logo?.data?.attributes?.url ?? logo?.data?.url ?? logo?.url ?? null;
  if (nested) return nested;

  // Sometimes media is returned as an array even when multiple=false
  const arrUrl = Array.isArray(logo?.data)
    ? logo.data?.[0]?.attributes?.url ?? logo.data?.[0]?.url
    : null;

  return arrUrl ?? null;
};

const mapSponsor = (item, baseUrl) => {
  const attributes = item?.attributes ?? item;

  const name = attributes?.Name ?? '';
  const website = attributes?.Website ?? '';
  const logoRaw = pickLogoUrl(attributes?.Logo);
  const logoUrl = absolutizeUrl(logoRaw, baseUrl);

  if (!logoUrl) return null;

  return {
    name,
    website,
    logoUrl,
  };
};

const fetchSponsorsPage = async ({ baseUrl, page, pageSize, signal } = {}) => {
  const url = new URL('/api/sponsors', baseUrl);
  const params = new URLSearchParams();
  params.set('populate', 'Logo');
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));
  params.append('fields[0]', 'Name');
  params.append('fields[1]', 'Website');
  url.search = params.toString();

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!res.ok) return { data: [], meta: null };
  const json = await res.json();

  return {
    data: Array.isArray(json?.data) ? json.data : [],
    meta: json?.meta ?? null,
  };
};

export async function fetchSponsors({ signal, pageSize = 100 } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  try {
    const allRows = [];
    const maxPages = 50;

    for (let page = 1; page <= maxPages; page++) {
      const { data, meta } = await fetchSponsorsPage({ baseUrl, page, pageSize, signal });
      allRows.push(...data);

      const pagination = meta?.pagination;
      const pageCount = typeof pagination?.pageCount === 'number' ? pagination.pageCount : null;

      // If Strapi doesn't return pagination info, assume single page.
      if (!pageCount) break;
      if (page >= pageCount) break;
    }

    return allRows.map((row) => mapSponsor(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}
