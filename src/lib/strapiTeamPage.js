const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

export async function fetchTeamPage({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return null;

  const url = new URL('/api/team-page', baseUrl);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!res.ok) return null;

    const json = await res.json();
    const attributes = json?.data?.attributes ?? json?.data ?? null;
    if (!attributes) return null;

    return {
      description: attributes?.Description ?? null,
      applicationLink: attributes?.ApplicationLink ?? null,
      applicationOpen: attributes?.ApplicationOpen ?? null,
    };
  } catch {
    return null;
  }
}
