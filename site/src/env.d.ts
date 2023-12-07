/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly STRAPI_API_TOKEN: string;
  readonly RESEND_API_TOKEN: string;
}
