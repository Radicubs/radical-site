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

const pickBestMediaUrl = (media) => {
  if (!media) return null;

  // Strapi v5 can return media directly (when populate=*) as an array of file objects
  // with { formats: { medium|small|thumbnail }, url }.
  if (Array.isArray(media)) {
    const first = media[0];
    return (
      first?.formats?.medium?.url ??
      first?.formats?.small?.url ??
      first?.formats?.thumbnail?.url ??
      first?.url ??
      null
    );
  }

  // Common Strapi REST shapes:
  // - { data: { attributes: { url } } }
  // - { data: { url } }
  // - { url }
  const nested = media?.data?.attributes?.url ?? media?.data?.url ?? media?.url ?? null;
  if (nested) return nested;

  // Sometimes returned as array under data
  const arrUrl = Array.isArray(media?.data)
    ? media.data?.[0]?.attributes?.url ?? media.data?.[0]?.url
    : null;

  return arrUrl ?? null;
};

const mapHistory = (item, baseUrl) => {
  const attributes = item?.attributes ?? item;

  const year = attributes?.Year ?? null;
  const game = attributes?.SeasonName ?? '';
  const robot = attributes?.RobotName ?? '';
  const description = attributes?.ShortDescription ?? '';
  const robotPictureUrl = absolutizeUrl(pickBestMediaUrl(attributes?.RobotPicture), baseUrl);

  if (year == null) return null;

  return {
    id: attributes?.id ?? item?.id ?? null,
    year,
    game,
    robot,
    description,
    robotPictureUrl,
  };
};

export async function fetchHistories({ signal, limit = 100 } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/histories', baseUrl);
  const params = new URLSearchParams();
  params.set('populate', 'RobotPicture');
  params.set('sort', 'Year:desc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'SeasonName');
  params.append('fields[1]', 'Year');
  params.append('fields[2]', 'RobotName');
  params.append('fields[3]', 'ShortDescription');
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

    return rows.map((row) => mapHistory(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}
