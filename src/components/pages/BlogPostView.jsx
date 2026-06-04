import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';

import Button from '../ui/Button.jsx';
import { navigateTo } from '../../lib/navigation.js';
import { fetchBlogPostBySlug } from '../../lib/strapiBlogPosts.js';
import { useStrapiData } from '../../hooks/useStrapiData.js';
import { formatDate } from '../../utils/formatDate.js';
import { blogBlocksRendererConfig } from '../../utils/blocksRendererConfig.jsx';



const BlogPostView = ({ slug }) => {
  const navigate = navigateTo;
  const { data: post, loading } = useStrapiData(slug ? fetchBlogPostBySlug : null, { slug }, null);

  if (loading) {
    return (
      <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen text-center">
        <h3 className="text-white font-mono text-2xl mb-4">Loading post…</h3>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen text-center">
        <h3 className="text-white font-mono text-2xl mb-4">Post Data Syncing...</h3>
        <Button onClick={() => navigate('blog')} variant="outline" className="mx-auto">
          Return to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen pb-24">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('blog')}
          className="text-[#a9a9a9] hover:text-[#5ddb27] font-mono text-sm flex items-center gap-2 mb-8 transition-colors"
        >
          <ArrowRight size={16} className="rotate-180" /> Back to Blog
        </button>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 border border-[#2c303a]"
          />
        )}

        <div className="mb-8 border-b border-[#2c303a] pb-8">
          <div className="text-[#5ddb27] font-mono text-sm mb-4 flex items-center gap-2">
            <Calendar size={14} /> {formatDate(post.date)}
          </div>
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-white leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="text-lg text-[#d3d3d3] leading-relaxed space-y-6">
          {Array.isArray(post.body) && post.body.length > 0 ? (
            <BlocksRenderer content={post.body} {...blogBlocksRendererConfig} />
          ) : (
            <p>{post.description ?? ''}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPostView;
