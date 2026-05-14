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

const pickMediaUrl = (media) => {
  if (!media) return null;

  // Typical Strapi REST shapes:
  // - { data: { attributes: { url } } }
  // - { data: { url } }
  // - { url }
  const nested = media?.data?.attributes?.url ?? media?.data?.url ?? media?.url ?? null;
  if (nested) return nested;

  // Sometimes returned as array
  const arrUrl = Array.isArray(media?.data)
    ? media.data?.[0]?.attributes?.url ?? media.data?.[0]?.url
    : null;

  return arrUrl ?? null;
};

export async function fetchHomepageTeamPhoto({ signal } = {}) {
  const homepage = await fetchHomepage({ signal });
  return homepage?.teamPhotoUrl ?? null;
}

export async function fetchHomepage({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return null;

  const url = new URL('/api/homepage', baseUrl);
  const params = new URLSearchParams();
  params.set('populate', 'TeamPhoto');
  url.search = params.toString();

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

    const teamPhotoUrl = absolutizeUrl(pickMediaUrl(attributes?.TeamPhoto), baseUrl);

    const foundingYear = attributes?.FoundingYear ?? null;
    const teamNumber = attributes?.TeamNumber ?? null;
    const activeSeasons = attributes?.ActiveSeasons ?? null;
    const totalAwards = attributes?.TotalAwards ?? null;
    const description = attributes?.Description ?? null;

    return {
      teamPhotoUrl,
      foundingYear,
      teamNumber,
      activeSeasons,
      totalAwards,
      description,
    };
  } catch {
    return null;
  }
}
