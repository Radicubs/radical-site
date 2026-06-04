import { strapiGet } from './strapiUtils.js';

const parseOriginBody = (body) => {
  if (typeof body !== 'string' || body.trim().length === 0) return [];

  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('>')) {
        return { type: 'quote', text: block.replace(/^>\s?/, '') };
      }
      return { type: 'paragraph', text: block };
    });
};

const mapIconName = (icon) => {
  const value = typeof icon === 'string' ? icon.trim() : '';
  if (['Target', 'Globe', 'Heart', 'Users'].includes(value)) return value;
  return 'Target';
};

export async function fetchAboutPage({ signal } = {}) {
  const params = new URLSearchParams();
  params.set('populate[MissionCards]', '*');
  params.set('populate[DiversityCards]', '*');

  const json = await strapiGet('/api/about-page', params, signal);
  const attributes = json?.data?.attributes ?? json?.data ?? null;
  if (!attributes) return null;

  const pickCards = (field) => {
    if (Array.isArray(attributes?.[field])) return attributes[field];
    if (Array.isArray(attributes?.[field]?.data)) return attributes[field].data;
    return [];
  };

  return {
    originHeading: attributes?.OriginHeading ?? null,
    originSubheading: attributes?.OriginSubheading ?? null,
    originBody: attributes?.OriginBody ?? null,
    originBlocks: parseOriginBody(attributes?.OriginBody ?? ''),
    missionHeading: attributes?.MissionHeading ?? null,
    missionStatement: attributes?.MissionStatement ?? null,
    missionCards: pickCards('MissionCards').map((card) => {
      const data = card?.attributes ?? card;
      return { title: data?.Title ?? '', icon: mapIconName(data?.Icon) };
    }),
    diversityHeading: attributes?.DiversityHeading ?? null,
    diversityCards: pickCards('DiversityCards').map((card) => {
      const data = card?.attributes ?? card;
      return { title: data?.Title ?? '', description: data?.Description ?? '', icon: mapIconName(data?.Icon) };
    }),
  };
}
