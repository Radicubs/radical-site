import { strapiGet } from './strapiUtils.js';

export async function fetchTeamPage({ signal } = {}) {
  const json = await strapiGet('/api/team-page', {}, signal);
  const attributes = json?.data?.attributes ?? json?.data ?? null;
  if (!attributes) return null;

  return {
    description: attributes?.Description ?? null,
    applicationLink: attributes?.ApplicationLink ?? null,
    applicationOpen: attributes?.ApplicationOpen ?? null,
  };
}
