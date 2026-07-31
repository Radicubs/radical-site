/**
 * Shared utilities for all Strapi API modules.
 *
 * Import from this file instead of copy-pasting helpers into each strapi*.js file.
 */

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

/**
 * Returns the Strapi base URL from the environment variable, stripping any
 * trailing slash. Falls back to localhost:1337 in dev mode when the env var
 * hasn't been configured yet.
 *
 * @returns {string|null}
 */
export const getStrapiBaseUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url === 'string' && url.trim().length > 0) {
    return url.trim().replace(/\/$/, '');
  }
  if (import.meta.env?.DEV) return 'http://localhost:1337';
  return null;
};

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Makes a relative URL absolute using baseUrl.
 * Handles http(s) absolute URLs, protocol-relative URLs, and root-relative paths.
 *
 * @param {string|null|undefined} maybeRelativeUrl
 * @param {string} baseUrl
 * @returns {string|null}
 */
export const absolutizeUrl = (maybeRelativeUrl, baseUrl) => {
  if (typeof maybeRelativeUrl !== 'string' || maybeRelativeUrl.trim().length === 0) return null;
  const url = maybeRelativeUrl.trim();

  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (!baseUrl) return url;

  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

/**
 * Extracts a URL string from any Strapi media field shape, then makes it
 * absolute. Handles the following shapes:
 *
 *   - Array of file objects: [{ formats: { medium|small|thumbnail }, url }]  (populate=*)
 *   - { data: { attributes: { url } } }   (v4 REST)
 *   - { data: { url } }                   (v5 REST)
 *   - { url }                             (direct)
 *   - Array under data key
 *
 * @param {*} media  Raw Strapi media field value.
 * @param {string} baseUrl  Strapi base URL used to absolutize relative paths.
 * @returns {string|null}
 */
export const resolveMediaUrl = (media, baseUrl) => {
  if (!media) return null;

  let rawUrl = null;

  if (Array.isArray(media)) {
    // populate=* returns an array of file objects
    const first = media[0];
    rawUrl =
      first?.formats?.medium?.url ??
      first?.formats?.small?.url ??
      first?.formats?.thumbnail?.url ??
      first?.url ??
      null;
  } else {
    // Standard nested shapes
    rawUrl =
      media?.data?.attributes?.url ??
      media?.data?.url ??
      media?.url ??
      null;

    if (!rawUrl && Array.isArray(media?.data)) {
      rawUrl =
        media.data[0]?.attributes?.url ??
        media.data[0]?.url ??
        null;
    }
  }

  return absolutizeUrl(rawUrl, baseUrl);
};

// ---------------------------------------------------------------------------
// Generic Strapi collection fetch
// ---------------------------------------------------------------------------

/**
 * Windows often resolves `localhost` to IPv6 `::1` first; if Strapi is only
 * bound to IPv4, server-side fetch() can fail there while a browser still
 * succeeds. Returns candidate base URLs to try in order.
 *
 * @param {string} baseUrl
 * @returns {string[]}
 */
const candidateBaseUrls = (baseUrl) => {
  const candidates = [baseUrl];
  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
      candidates.push(parsed.toString().replace(/\/$/, ''));
    }
  } catch {
    // Ignore invalid URLs; the fetch below will fail and return null.
  }
  return candidates;
};

/**
 * Fetches a Strapi REST endpoint and returns the parsed JSON.
 * Returns null on network failure or non-2xx status.
 *
 * @param {string} endpoint   Path including leading slash, e.g. '/api/projects'.
 * @param {URLSearchParams|Record<string,string>} params
 * @param {AbortSignal|undefined} signal
 * @returns {Promise<object|null>}
 */
export const strapiGet = async (endpoint, params = {}, signal) => {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl) return null;

  const searchParams =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);

  for (const candidate of candidateBaseUrls(baseUrl)) {
    const url = new URL(endpoint, candidate);
    url.search = searchParams.toString();

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!res.ok) continue;
      return await res.json();
    } catch {
      // Try the next candidate base URL.
    }
  }

  return null;
};

/**
 * Convenience wrapper around strapiGet that returns the `data` array,
 * mapped through the provided `mapper` and with nulls filtered out.
 *
 * @template T
 * @param {string} endpoint
 * @param {URLSearchParams|Record<string,string>} params
 * @param {(item: object) => T|null} mapper
 * @param {AbortSignal|undefined} signal
 * @returns {Promise<T[]>}
 */
export const strapiGetMany = async (endpoint, params, mapper, signal) => {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl) return [];

  const json = await strapiGet(endpoint, params, signal);
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.map((row) => mapper(row, baseUrl)).filter(Boolean);
};

/**
 * Convenience wrapper around strapiGet for singleton endpoints.
 * Normalizes the `data` object by flattening `attributes` into the item.
 *
 * @param {string} endpoint
 * @param {URLSearchParams|Record<string,string>} params
 * @param {AbortSignal|undefined} signal
 * @returns {Promise<object|null>}  Flattened attributes object, or null.
 */
export const strapiGetSingle = async (endpoint, params, signal) => {
  const json = await strapiGet(endpoint, params, signal);
  return json?.data?.attributes ?? json?.data ?? null;
};

// ---------------------------------------------------------------------------
// Shared data helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes a Strapi item, returning its `attributes` object if present,
 * otherwise returning the item itself. Useful for handling both v4 and v5 shapes.
 *
 * @param {object} item
 * @returns {object}
 */
export const attrs = (item) => item?.attributes ?? item;

/**
 * Picks an array from a Strapi relation field that may be:
 *   - already an array
 *   - { data: [...] }
 *
 * @param {*} value
 * @returns {Array}
 */
export const pickArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};
