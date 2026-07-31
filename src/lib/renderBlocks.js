/**
 * Renders Strapi's "Blocks" rich-text JSON AST to an HTML string, for use
 * with Astro's `set:html`. Replaces @strapi/blocks-react-renderer — the
 * Blocks format is a plain, documented JSON tree, so no React is needed.
 */

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderInlineNode = (node) => {
  if (!node) return '';

  if (node.type === 'link') {
    const children = (node.children || []).map(renderInlineNode).join('');
    return `<a href="${escapeHtml(node.url)}" class="text-[#5ddb27] underline" target="_blank" rel="noreferrer">${children}</a>`;
  }

  let text = escapeHtml(node.text);
  if (node.code) text = `<code>${text}</code>`;
  if (node.bold) text = `<strong class="text-white">${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  if (node.strikethrough) text = `<s>${text}</s>`;
  if (node.highlight) text = `<mark class="bg-transparent text-[#5ddb27]">${text}</mark>`;
  return text;
};

const renderInline = (nodes = []) => nodes.map(renderInlineNode).join('');

const renderListItem = (item) =>
  `<li>${(item.children || [])
    .map((child) => (child.type === 'list' ? renderList(child) : renderInlineNode(child)))
    .join('')}</li>`;

const renderList = (node) => {
  const ordered = node.format === 'ordered';
  const tag = ordered ? 'ol' : 'ul';
  const cls = ordered
    ? 'list-decimal ml-6 space-y-2 text-[#d3d3d3]'
    : 'list-disc ml-6 space-y-2 text-[#d3d3d3]';
  const items = (node.children || []).map(renderListItem).join('');
  return `<${tag} class="${cls}">${items}</${tag}>`;
};

const HEADING_CLASSES = {
  2: 'text-2xl font-mono font-bold text-white',
  3: 'text-xl font-mono font-bold text-white',
};
const HEADING_CLASS_DEFAULT = 'text-3xl font-mono font-bold text-white';

const renderBlock = (node, { paragraphClass }) => {
  switch (node.type) {
    case 'paragraph':
      return `<p class="${paragraphClass}">${renderInline(node.children)}</p>`;
    case 'heading': {
      const level = node.level ?? 1;
      const cls = HEADING_CLASSES[level] ?? HEADING_CLASS_DEFAULT;
      return `<h${level} class="${cls}">${renderInline(node.children)}</h${level}>`;
    }
    case 'list':
      return renderList(node);
    case 'quote':
      return `<blockquote class="border-l-2 border-[#2c303a] pl-4 italic text-[#a9a9a9]">${renderInline(
        node.children
      )}</blockquote>`;
    case 'code':
      return `<pre class="bg-[#1b1d23] rounded p-4 overflow-x-auto"><code>${escapeHtml(
        (node.children || []).map((c) => c.text).join('')
      )}</code></pre>`;
    default:
      return renderInline(node.children ?? []);
  }
};

/**
 * @param {Array<object>} blocks  Strapi Blocks JSON AST.
 * @param {{ variant?: 'default'|'blog' }} [options]
 * @returns {string} HTML string.
 */
export const renderBlocks = (blocks, { variant = 'default' } = {}) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  const paragraphClass =
    variant === 'blog'
      ? 'text-lg text-[#d3d3d3] leading-relaxed'
      : 'text-[#d3d3d3] whitespace-pre-line leading-relaxed';

  return blocks.map((block) => renderBlock(block, { paragraphClass })).join('');
};
