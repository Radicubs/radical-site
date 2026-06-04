import { resolveMediaUrl, strapiGetMany } from './strapiUtils.js';

const mapHistory = (item, baseUrl) => {
  const a = item?.attributes ?? item;

  const year = a?.Year ?? null;
  const game = a?.SeasonName ?? '';
  const robot = a?.RobotName ?? '';
  const description = a?.ShortDescription ?? '';
  const robotPictureUrl = resolveMediaUrl(a?.RobotPicture, baseUrl);

  if (year == null) return null;

  return {
    id: a?.id ?? item?.id ?? null,
    year,
    game,
    robot,
    description,
    robotPictureUrl,
  };
};

export async function fetchHistories({ signal, limit = 100 } = {}) {
  const params = new URLSearchParams();
  params.set('populate', 'RobotPicture');
  params.set('sort', 'Year:desc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'SeasonName');
  params.append('fields[1]', 'Year');
  params.append('fields[2]', 'RobotName');
  params.append('fields[3]', 'ShortDescription');

  return strapiGetMany('/api/histories', params, mapHistory, signal);
}
