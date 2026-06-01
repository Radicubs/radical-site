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

const mapAlbum = (item, baseUrl) => {
  const attributes = item?.attributes ?? item;
  if (!attributes) return null;

  const slug = typeof attributes?.Slug === 'string' ? attributes.Slug : '';
  const title = typeof attributes?.Title === 'string' ? attributes.Title : '';
  const year = attributes?.Year ? String(attributes.Year) : '';

  if (!slug || !title) return null;

  const coverPhoto = normalizeMediaUrl(attributes?.CoverPhoto, baseUrl);

  let photos = [];
  const rawPhotos = attributes?.Photos?.data ?? attributes?.Photos;
  if (rawPhotos) {
    const photosData = Array.isArray(rawPhotos) ? rawPhotos : [rawPhotos];
    photos = photosData.map(photo => normalizeMediaUrl(photo, baseUrl)).filter(Boolean);
  }

  return {
    id: item?.id ?? attributes?.id ?? null,
    slug,
    title,
    year,
    coverPhoto,
    photos,
  };
};

export async function fetchAllAlbums({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/albums', baseUrl);
  const params = new URLSearchParams();
  // Sort descending by Year
  params.set('sort', 'Year:desc');
  // Only need the cover photo for the main gallery page
  params.set('populate', 'CoverPhoto');
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
    return rows.map((row) => mapAlbum(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetchAlbumBySlug({ slug, signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl || !slug) return null;

  const url = new URL('/api/albums', baseUrl);
  const params = new URLSearchParams();
  params.set('filters[Slug][$eq]', slug);
  // Populate all relations including CoverPhoto and Photos array
  params.set('populate', '*');
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
    const mapped = rows.map((row) => mapAlbum(row, baseUrl)).filter(Boolean);
    return mapped[0] ?? null;
  } catch {
    return null;
  }
}
