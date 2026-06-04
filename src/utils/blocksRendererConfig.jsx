import React from 'react';

/**
 * Shared BlocksRenderer configuration for the @strapi/blocks-react-renderer.
 *
 * Provides two configs:
 *   - `blocksRendererConfig`      — default config for body/description text
 *   - `blogBlocksRendererConfig`  — extended config with heading and blockquote
 *     support for full blog-post bodies.
 *
 * Import whichever fits the rendering context.
 */

const sharedModifiers = {
  bold: ({ children }) => <strong className="text-white">{children}</strong>,
  link: ({ children, url }) => (
    <a href={url} className="text-[#5ddb27] underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  highlight: ({ children }) => <mark className="bg-transparent text-[#5ddb27]">{children}</mark>,
};

const sharedList = ({ children, format }) => {
  if (format === 'ordered') {
    return <ol className="list-decimal ml-6 space-y-2 text-[#d3d3d3]">{children}</ol>;
  }
  return <ul className="list-disc ml-6 space-y-2 text-[#d3d3d3]">{children}</ul>;
};

/**
 * Standard config for description / body text fields (ProjectsView, etc.).
 */
export const blocksRendererConfig = {
  blocks: {
    paragraph: ({ children }) => (
      <p className="text-[#d3d3d3] whitespace-pre-line leading-relaxed">{children}</p>
    ),
    list: sharedList,
  },
  modifiers: sharedModifiers,
};

/**
 * Extended config for full blog post bodies — adds heading and blockquote support.
 */
export const blogBlocksRendererConfig = {
  blocks: {
    paragraph: ({ children }) => (
      <p className="text-lg text-[#d3d3d3] leading-relaxed">{children}</p>
    ),
    heading: ({ children, level }) => {
      const Tag = `h${level}`;
      const className =
        level === 2
          ? 'text-2xl font-mono font-bold text-white'
          : level === 3
            ? 'text-xl font-mono font-bold text-white'
            : 'text-3xl font-mono font-bold text-white';
      return <Tag className={className}>{children}</Tag>;
    },
    list: sharedList,
    quote: ({ children }) => (
      <blockquote className="border-l-2 border-[#2c303a] pl-4 italic text-[#a9a9a9]">
        {children}
      </blockquote>
    ),
  },
  modifiers: sharedModifiers,
};
