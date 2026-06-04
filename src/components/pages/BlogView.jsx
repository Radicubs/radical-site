import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';

import Card from '../ui/Card.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import { navigateTo } from '../../lib/navigation.js';
import { fetchAllBlogPosts } from '../../lib/strapiBlogPosts.js';
import { useStrapiData } from '../../hooks/useStrapiData.js';
import { formatDate } from '../../utils/formatDate.js';


const BlogView = () => {
  const navigate = navigateTo;
  const { data: posts, loading } = useStrapiData(fetchAllBlogPosts, {}, []);

  return (
    <div className="w-full pt-32 px-6 md:px-16 lg:px-24 bg-[#101215] min-h-screen">
      <SectionHeader title="Team Blog" subtitle="News, updates, and stories from the Radicubs." />

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-[#a9a9a9] font-mono text-sm">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="border border-dashed border-[#2c303a] rounded-lg p-16 text-center">
            <BookOpen size={48} className="mx-auto text-[#2c303a] mb-4" />
            <h3 className="text-xl font-mono text-white mb-2">Blog posts coming soon.</h3>
            <p className="text-[#a9a9a9]">We are currently syncing our latest updates from radicubs.com.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card
                key={post.slug ?? post.id}
                onClick={() => navigate('blogPost', { slug: post.slug })}
                className="flex flex-col h-full !p-0 overflow-hidden cursor-pointer"
              >
                <div className="w-full h-48 bg-[#2c303a] relative flex items-center justify-center border-b border-[#1b1d23]">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#101215] font-mono font-bold tracking-widest text-xs">BLOG IMAGE</span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow bg-[#1b1d23]">
                  <div className="flex items-center gap-2 text-[#a9a9a9] font-mono text-xs mb-3">
                    <Calendar size={14} />
                    {formatDate(post.date)}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-white mb-3">{post.title}</h3>
                  <p className="text-[#d3d3d3] text-sm mb-6 flex-grow">{post.description}</p>
                  <div className="text-[#5ddb27] font-mono text-sm flex items-center gap-2 mt-auto">
                    Read Article <ChevronRight size={16} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogView;
