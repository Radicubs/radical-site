import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: (ctx) => {
        const requestOrigin = ctx.request.header.origin;

        // Non-browser requests (no Origin header) don't need CORS.
        if (!requestOrigin) return '*';

        // Allow local dev frontends on any port.
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)) {
          return requestOrigin;
        }

        const allowList = env('CORS_ORIGIN', 'http://localhost:4321,http://127.0.0.1:4321')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

        if (allowList.includes(requestOrigin)) return requestOrigin;

        // Default-deny (no CORS) for unknown origins.
        return '';
      },
      headers: '*',
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
