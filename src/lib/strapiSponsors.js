import { getStrapiBaseUrl, resolveMediaUrl, strapiGet, attrs } from './strapiUtils.js';

const mapSponsor = (item, baseUrl) => {
  const a = attrs(item);

  const name = a?.Name ?? '';
  const website = a?.Website ?? '';
  const logoUrl = resolveMediaUrl(a?.Logo, baseUrl);

  if (!logoUrl) return null;

  return { name, website, logoUrl };
};

const fetchSponsorsPageRaw = async ({ baseUrl, page, pageSize, signal } = {}) => {
  const params = new URLSearchParams();
  params.set('populate', 'Logo');
  params.set('pagination[page]', String(page));
  params.set('pagination[pageSize]', String(pageSize));
  params.append('fields[0]', 'Name');
  params.append('fields[1]', 'Website');

  const json = await strapiGet('/api/sponsors', params, signal);

  return {
    data: Array.isArray(json?.data) ? json.data : [],
    meta: json?.meta ?? null,
  };
};

export async function fetchSponsors({ signal, pageSize = 100 } = {}) {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl) return [];

  try {
    const allRows = [];
    const maxPages = 50;

    for (let page = 1; page <= maxPages; page++) {
      const { data, meta } = await fetchSponsorsPageRaw({ baseUrl, page, pageSize, signal });
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
