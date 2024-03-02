Website built in Astro and deployed using GitHub Pages

# Requirements

- Node.js
- Strapi instance

# Config

- `DONATE_URL` Just the link the button goes to
- `CONTACT_API_URL` URL for the Cloudflare Worker form (contact.radicubs.workers.dev, contact.radicubs.com)
- `STRAPI_URL` URL for the Strapi instance
- `STRAPI_API_TOKEN` Created in Strapi Dashboard > Settings > API Tokens
- `TURNSTILE_SITE_KEY` Public key used in the Cloudflare Turnstile widget

# Setup

1. Install yarn (`npm i -g yarn`)
1. Install dependencies (`yarn`)
1. Run website locally with `yarn dev`
1. Build website to `dist` folder with `yarn build`
