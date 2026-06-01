import { fetchAlbumBySlug } from './src/lib/strapiAlbums.js';
import fetch from 'node-fetch'; // Polyfill for older Node if necessary, but node 18+ has it.

async function test() {
  // Mock import.meta.env
  globalThis.import = { meta: { env: { PUBLIC_STRAPI_URL: 'http://localhost:1337' } } };
  
  try {
    const album = await fetchAlbumBySlug({ slug: 'fortworth-2026' });
    console.log(JSON.stringify(album, null, 2));
  } catch(e) {
    console.error("Error", e);
  }
}
test();
