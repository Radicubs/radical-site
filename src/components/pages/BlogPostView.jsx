import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';

import Button from '../ui/Button.jsx';
import { blogPosts } from '../../lib/api.js';
import { navigateTo } from '../../lib/navigation.js';

const BlogPostView = ({ postId }) => {
  const navigate = navigateTo;
  const post = blogPosts.find((p) => String(p.id) === String(postId));

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
            <Calendar size={14} /> {post.date}
          </div>
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-white leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="text-lg text-[#d3d3d3] leading-relaxed space-y-6">
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
};

export default BlogPostView;
