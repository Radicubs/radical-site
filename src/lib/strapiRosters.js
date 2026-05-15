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

const pickPhotoUrl = (photo) => {
  if (!photo) return null;

  // Common Strapi REST shapes for media:
  // - { data: { attributes: { url } } }
  // - { data: { url } }
  // - { url }
  const nested = photo?.data?.attributes?.url ?? photo?.data?.url ?? photo?.url ?? null;
  if (nested) return nested;

  // Sometimes media is returned as an array even when multiple=false
  const arrUrl = Array.isArray(photo?.data)
    ? photo.data?.[0]?.attributes?.url ?? photo.data?.[0]?.url
    : null;

  return arrUrl ?? null;
};

const getMembersArray = (membersField) => {
  if (!membersField) return [];

  // Strapi v5 commonly returns populated relations as arrays
  if (Array.isArray(membersField)) return membersField;

  // Older/common shapes
  if (Array.isArray(membersField?.data)) return membersField.data;

  return [];
};

const getRosterSpotsArray = (spotsField) => {
  if (!spotsField) return [];

  if (Array.isArray(spotsField)) return spotsField;
  if (Array.isArray(spotsField?.data)) return spotsField.data;

  return [];
};

const mapRoster = (row, baseUrl) => {
  const attributes = row?.attributes ?? row;

  const yearRaw = attributes?.Year;
  const year = yearRaw == null ? null : String(yearRaw);

  const rosterSpots = getRosterSpotsArray(attributes?.RosterSpots);
  const members = [];

  for (const spot of rosterSpots) {
    const spotAttrs = spot?.attributes ?? spot;
    const role = (spotAttrs?.Role ?? '').trim();

    const spotMembers = getMembersArray(spotAttrs?.members);

    for (const member of spotMembers) {
      const memberAttrs = member?.attributes ?? member;
      const name = (memberAttrs?.Name ?? '').trim();

      const photoRaw = pickPhotoUrl(memberAttrs?.Photo);
      const photoUrl = absolutizeUrl(photoRaw, baseUrl);

      if (!name) continue;

      members.push({
        name,
        role,
        photoUrl,
      });
    }
  }

  // Keep the roster even if empty; the UI uses that
  if (!year) return null;

  return {
    year,
    members,
  };
};

export async function fetchRosters({ signal, pageSize = 100 } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/rosters', baseUrl);
  const params = new URLSearchParams();

  // Verified working against the local Strapi v5 instance.
  params.set('populate[RosterSpots][populate][members][populate]', 'Photo');
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort', 'Year:desc');

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

    return rows.map((r) => mapRoster(r, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}
