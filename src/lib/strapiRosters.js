import { absolutizeUrl, resolveMediaUrl, strapiGetMany, pickArray, attrs } from './strapiUtils.js';

const pickPhotoUrl = (photo) => resolveMediaUrl(photo, '');

const getMembersArray = (membersField) => {
  if (!membersField) return [];
  if (Array.isArray(membersField)) return membersField;
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
  const a = attrs(row);

  const yearRaw = a?.Year;
  const year = yearRaw == null ? null : String(yearRaw);

  const rosterSpots = getRosterSpotsArray(a?.RosterSpots);
  const members = [];

  for (const spot of rosterSpots) {
    const spotAttrs = attrs(spot);
    const role = (spotAttrs?.Role ?? '').trim();

    const spotMembers = getMembersArray(spotAttrs?.members);

    for (const member of spotMembers) {
      const memberAttrs = attrs(member);
      const name = (memberAttrs?.Name ?? '').trim();
      const photoUrl = absolutizeUrl(pickPhotoUrl(memberAttrs?.Photo), baseUrl);

      if (!name) continue;

      members.push({ name, role, photoUrl });
    }
  }

  if (!year) return null;

  return { year, members };
};

export async function fetchRosters({ signal, pageSize = 100 } = {}) {
  const params = new URLSearchParams();
  // Verified working against the local Strapi v5 instance.
  params.set('populate[RosterSpots][populate][members][populate]', 'Photo');
  params.set('pagination[pageSize]', String(pageSize));
  params.set('sort', 'Year:desc');

  return strapiGetMany('/api/rosters', params, mapRoster, signal);
}
