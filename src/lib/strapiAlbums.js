import { getStrapiBaseUrl, resolveMediaUrl, strapiGetMany, strapiGetSingle, attrs } from './strapiUtils.js';

const mapAlbum = (item, baseUrl) => {
  const a = attrs(item);
  if (!a) return null;

  const slug = typeof a?.Slug === 'string' ? a.Slug : '';
  const title = typeof a?.Title === 'string' ? a.Title : '';
  const year = a?.Year ? String(a.Year) : '';

  if (!slug || !title) return null;

  const coverPhoto = resolveMediaUrl(a?.CoverPhoto, baseUrl);

  let photos = [];
  const rawPhotos = a?.Photos?.data ?? a?.Photos;
  if (rawPhotos) {
    const photosData = Array.isArray(rawPhotos) ? rawPhotos : [rawPhotos];
    photos = photosData.map((photo) => resolveMediaUrl(photo, baseUrl)).filter(Boolean);
  }

  return {
    id: item?.id ?? a?.id ?? null,
    slug,
    title,
    year,
    coverPhoto,
    photos,
  };
};

export async function fetchAllAlbums({ signal } = {}) {
  const params = new URLSearchParams();
  // Sort descending by Year
  params.set('sort', 'Year:desc');
  // Only need the cover photo for the main gallery page
  params.set('populate', 'CoverPhoto');

  return strapiGetMany('/api/albums', params, mapAlbum, signal);
}

export async function fetchAlbumBySlug({ slug, signal } = {}) {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl || !slug) return null;

  const params = new URLSearchParams();
  params.set('filters[Slug][$eq]', slug);
  // Populate all relations including CoverPhoto and Photos array
  params.set('populate', '*');

  const { strapiGet } = await import('./strapiUtils.js');
  const json = await strapiGet('/api/albums', params, signal);
  const rows = Array.isArray(json?.data) ? json.data : [];
  const mapped = rows.map((row) => mapAlbum(row, baseUrl)).filter(Boolean);
  return mapped[0] ?? null;
}
