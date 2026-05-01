export const routeFor = (id, params = {}) => {
  switch (id) {
    case 'home':
      return '/';
    case 'about':
      return '/about';
    case 'history':
      return '/history';
    case 'projects':
      return '/projects';
    case 'team':
    case 'join':
      return '/team';
    case 'gallery':
      return '/gallery';
    case 'blog':
      return '/blog';
    case 'blogPost':
      return params.postId ? `/blog/${params.postId}` : '/blog';
    case 'sponsors':
      return '/sponsors';
    default:
      return '/';
  }
};

export const navigateTo = (id, params = {}) => {
  if (typeof window === 'undefined') return;
  const path = routeFor(id, params);
  window.location.href = path;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
