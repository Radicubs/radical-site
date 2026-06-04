import { strapiGetMany } from './strapiUtils.js';

const mapAward = (item) => {
  const a = item?.attributes ?? item;
  const year = a?.Year ?? null;
  const event = a?.Place ?? '';
  const name = a?.Name ?? '';

  if (year == null || (!event && !name)) return null;

  return { year, event, name };
};

export async function fetchLatestAwards({ limit = 8, signal } = {}) {
  const params = new URLSearchParams();
  params.set('sort', 'Year:desc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'Year');
  params.append('fields[1]', 'Place');
  params.append('fields[2]', 'Name');

  return strapiGetMany('/api/awards', params, mapAward, signal);
}
