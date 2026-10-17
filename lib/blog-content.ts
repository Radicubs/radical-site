import type { BlogBlock, BlogSection } from "@/data/blog";

export type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  listType?: string;
  indent?: number;
  children?: LexicalNode[];
  value?: unknown;
  fields?: { blockType?: string; code?: string; language?: string };
};

const nodeText = (node: LexicalNode): string =>
  node.type === "linebreak" ? "\n" : node.text ?? (node.children ?? []).map(nodeText).join("");

const emptySection = (heading: string): BlogSection => ({ heading, paragraphs: [], blocks: [] });

// The post template lays a post out as titled sections, so each Heading in the
// editor starts a new section. Anything before the first heading goes under "Update".
export function lexicalToSections(content: unknown, resolveImage: (value: unknown) => Extract<BlogBlock, { kind: "image" }> | undefined = () => undefined): BlogSection[] | undefined {
  const nodes = (content as { root?: LexicalNode } | null)?.root?.children;
  if (!nodes?.length) return undefined;

  const sections: BlogSection[] = [];
  let current = emptySection("Update");
  const flush = () => { if (current.blocks!.length) sections.push(current); };
  const push = (block: BlogBlock) => current.blocks!.push(block);

  for (const node of nodes) {
    if (node.type === "heading") {
      const text = nodeText(node).trim();
      if (!text) continue;
      flush();
      current = emptySection(text);
    } else if (node.type === "list") {
      const items = (node.children ?? []).map(nodeText);
      if (items.length) push({ kind: "list", ordered: node.listType === "number", items });
    } else if (node.type === "upload") {
      const image = resolveImage(node.value);
      if (image) push(image);
    } else if (node.type === "block" && node.fields?.blockType === "Code") {
      const code = node.fields.code?.replace(/\s+$/, "");
      if (code) push({ kind: "code", code, lang: node.fields.language || undefined });
    } else {
      const text = nodeText(node);
      // Empty paragraphs are intentional blank lines, not missing content.
      if (text || node.type === "paragraph") push({ kind: "text", text, ...(node.indent ? { indent: node.indent } : {}) });
    }
  }
  flush();
  return sections.length ? sections : undefined;
}

