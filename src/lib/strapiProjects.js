const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url === 'string' && url.trim().length > 0) {
    return url.trim().replace(/\/$/, '');
  }

  // Local development fallback to reduce "silent" empty pages when the env var
  // hasn't been configured yet.
  if (import.meta.env?.DEV) return 'http://localhost:1337';

  return null;
};

const blocksToPlainText = (blocks) => {
  if (typeof blocks === 'string') return blocks;
  if (!Array.isArray(blocks)) return '';

  const out = [];

  const walk = (node) => {
    if (!node) return;

    if (typeof node === 'string') {
      out.push(node);
      return;
    }

    if (typeof node.text === 'string') {
      out.push(node.text);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  };

  for (const block of blocks) {
    walk(block);
    out.push('\n\n');
  }

  return out.join('').replace(/\n{3,}/g, '\n\n').trim();
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

  // Strapi can return media directly (when populate=*) as an array of file objects
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

const mapProject = (item, baseUrl) => {
  const attributes = item?.attributes ?? item;

  const title = attributes?.Title ?? '';
  const descriptionBlocks = attributes?.Description ?? null;
  const description = blocksToPlainText(descriptionBlocks);
  const timeline = attributes?.Timeline ?? '';
  const imageUrl = absolutizeUrl(pickBestMediaUrl(attributes?.Image), baseUrl);

  if (!title) return null;

  return {
    id: attributes?.id ?? item?.id ?? null,
    title,
    description,
    descriptionBlocks,
    timeline,
    imageUrl,
    button: Boolean(attributes?.Button),
    buttonText: attributes?.ButtonText ?? '',
    buttonLink: attributes?.ButtonLink ?? '',
  };
};

export async function fetchProjects({ signal, limit = 100 } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return [];

  const url = new URL('/api/projects', baseUrl);
  const params = new URLSearchParams();
  params.set('populate', 'Image');
  params.set('sort', 'createdAt:asc');
  params.set('pagination[pageSize]', String(limit));
  params.append('fields[0]', 'Title');
  params.append('fields[1]', 'Description');
  params.append('fields[2]', 'Timeline');
  params.append('fields[3]', 'Button');
  params.append('fields[4]', 'ButtonText');
  params.append('fields[5]', 'ButtonLink');
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

    return rows.map((row) => mapProject(row, baseUrl)).filter(Boolean);
  } catch {
    return [];
  }
}
