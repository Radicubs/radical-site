const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const parseOriginBody = (body) => {
  if (typeof body !== 'string' || body.trim().length === 0) return [];

  const blocks = body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    if (block.startsWith('>')) {
      return {
        type: 'quote',
        text: block.replace(/^>\s?/, ''),
      };
    }

    return {
      type: 'paragraph',
      text: block,
    };
  });
};

const mapIconName = (icon) => {
  const value = typeof icon === 'string' ? icon.trim() : '';
  if (['Target', 'Globe', 'Heart', 'Users'].includes(value)) return value;
  return 'Target';
};

export async function fetchAboutPage({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return null;

  const url = new URL('/api/about-page', baseUrl);
  const params = new URLSearchParams();
  params.set('populate[MissionCards]', '*');
  params.set('populate[DiversityCards]', '*');
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

    const missionCards = Array.isArray(attributes?.MissionCards)
      ? attributes.MissionCards
      : Array.isArray(attributes?.MissionCards?.data)
        ? attributes.MissionCards.data
        : [];

    const diversityCards = Array.isArray(attributes?.DiversityCards)
      ? attributes.DiversityCards
      : Array.isArray(attributes?.DiversityCards?.data)
        ? attributes.DiversityCards.data
        : [];

    return {
      originHeading: attributes?.OriginHeading ?? null,
      originSubheading: attributes?.OriginSubheading ?? null,
      originBody: attributes?.OriginBody ?? null,
      originBlocks: parseOriginBody(attributes?.OriginBody ?? ''),
      missionHeading: attributes?.MissionHeading ?? null,
      missionStatement: attributes?.MissionStatement ?? null,
      missionCards: missionCards.map((card) => {
        const data = card?.attributes ?? card;
        return {
          title: data?.Title ?? '',
          icon: mapIconName(data?.Icon),
        };
      }),
      diversityHeading: attributes?.DiversityHeading ?? null,
      diversityCards: diversityCards.map((card) => {
        const data = card?.attributes ?? card;
        return {
          title: data?.Title ?? '',
          description: data?.Description ?? '',
          icon: mapIconName(data?.Icon),
        };
      }),
    };
  } catch {
    return null;
  }
}
