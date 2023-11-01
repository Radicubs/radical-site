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

  const url = new URL(`${import.meta.env.STRAPI_URL}/api/${endpoint}`);
  console.log(url.toString());
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  //const res = await fetch(url.toString(), {
  const res = await fetch(url.toString(), {
    headers: {
      authorization:
        `Bearer ${import.meta.env.STRAPI_API_TOKEN}`
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
