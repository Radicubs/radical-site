/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTACT_API_URL: string;
  readonly STRAPI_URL: string;
  readonly STRAPI_API_TOKEN: string;
  readonly TURNSTILE_SITE_KEY: string;
}
