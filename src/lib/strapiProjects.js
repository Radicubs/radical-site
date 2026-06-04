import { resolveMediaUrl, strapiGetMany } from './strapiUtils.js';

const blocksToPlainText = (blocks) => {
  if (typeof blocks === 'string') return blocks;
  if (!Array.isArray(blocks)) return '';

  const out = [];

  const walk = (node) => {
    if (!node) return;
    if (typeof node === 'string') { out.push(node); return; }
    if (typeof node.text === 'string') out.push(node.text);
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

const mapProject = (item, baseUrl) => {
  const a = item?.attributes ?? item;

  const title = a?.Title ?? '';
  const descriptionBlocks = a?.Description ?? null;
  const description = blocksToPlainText(descriptionBlocks);
  const timeline = a?.Timeline ?? '';
  const imageUrl = resolveMediaUrl(a?.Image, baseUrl);

  if (!title) return null;

  return {
    id: a?.id ?? item?.id ?? null,
    title,
    description,
    descriptionBlocks,
    timeline,
    imageUrl,
    button: Boolean(a?.Button),
    buttonText: a?.ButtonText ?? '',
    buttonLink: a?.ButtonLink ?? '',
  };
};

export async function fetchProjects({ signal, limit = 100 } = {}) {
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

  return strapiGetMany('/api/projects', params, mapProject, signal);
}
