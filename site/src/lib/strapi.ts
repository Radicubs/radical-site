interface Props {
  endpoint: string;
  query?: Record<string, string>;
  wrappedByKey?: string;
  wrappedByList?: boolean;
}

export interface Attributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Result<T> {
  id: string;
  attributes: T & Attributes;
}

export interface EmbeddedResult<T> {
  data: Result<T>;
}

export interface Media {
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: "todo";
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: "todo";
  provider: string;
  provider_metadata: "todo";
}

/**
 * Fetches data from the Strapi API
 * @param endpoint - The endpoint to fetch from
 * @param query - The query parameters to add to the url
 * @param wrappedByKey - The key to unwrap the response from
 * @param wrappedByList - If the response is a list, unwrap it
 * @returns
 */
export default async function fetchApi<T>({ endpoint, query, wrappedByKey, wrappedByList }: Props): Promise<T> {
  if (endpoint.startsWith("/")) {
    endpoint = endpoint.slice(1);
  }

  console.log(`${import.meta.env.STRAPI_URL}/api/${endpoint}`);
  const url = new URL(`${import.meta.env.STRAPI_URL}/api/${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  const res = await fetch(url.toString(), {
    headers: {
      authorization:
        "Bearer d5249ede0477c2fbb0efef55e6745df4a5018d57aeb17d73da8f91837b6320c5b7da26e82280ec9eb8f48801813bb874e189e378980dfbe7ae3f9f1fcb75f8fe67e58ae7ec8d71beeee72106c52eb4655d8fe7261bb66506df55623cfbc5e4892344884bfa91beb0ceca0052fec8f504d54fc7f141f4e97b260d6a8fec4c9638"
    }
  });
  let data = await res.json();

  if (wrappedByKey) {
    data = data[wrappedByKey];
  }

  if (wrappedByList) {
    data = data[0];
  }

  return data as T;
}
