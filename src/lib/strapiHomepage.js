import { getStrapiBaseUrl, resolveMediaUrl, strapiGet } from './strapiUtils.js';

export async function fetchHomepageTeamPhoto({ signal } = {}) {
  const homepage = await fetchHomepage({ signal });
  return homepage?.teamPhotoUrl ?? null;
}

export async function fetchHomepage({ signal } = {}) {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl) return null;

  const params = new URLSearchParams();
  params.set('populate', 'TeamPhoto');

  const json = await strapiGet('/api/homepage', params, signal);
  const attributes = json?.data?.attributes ?? json?.data ?? null;
  if (!attributes) return null;

  return {
    teamPhotoUrl: resolveMediaUrl(attributes?.TeamPhoto, baseUrl),
    foundingYear: attributes?.FoundingYear ?? null,
    teamNumber: attributes?.TeamNumber ?? null,
    activeSeasons: attributes?.ActiveSeasons ?? null,
    totalAwards: attributes?.TotalAwards ?? null,
    description: attributes?.Description ?? null,
  };
}
