const getPublicStrapiUrl = () => {
  const url = import.meta.env?.PUBLIC_STRAPI_URL;
  if (typeof url !== 'string' || url.trim().length === 0) return null;
  return url.trim().replace(/\/$/, '');
};

const pickArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const normalizeItem = (item) => item?.attributes ?? item;

const normalizeListItems = (maybeListItems) => {
  const rows = pickArray(maybeListItems);
  return rows
    .map((row) => {
      const data = normalizeItem(row);
      const text = typeof data?.Text === 'string' ? data.Text : '';
      return text.trim();
    })
    .filter(Boolean);
};

export async function fetchSponsorsPage({ signal } = {}) {
  const baseUrl = getPublicStrapiUrl();
  if (!baseUrl) return null;

  const url = new URL('/api/sponsors-page', baseUrl);
  const params = new URLSearchParams();

  params.set('populate[Buttons]', '*');
  params.set('populate[WaysCards][populate][ListItems]', '*');
  params.set('populate[BenefitsCards][populate][ListItems]', '*');
  params.set('populate[StatisticsCards][populate][ListItems]', '*');

  url.search = params.toString();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    });

    if (!res.ok) return null;

    const json = await res.json();
    const attributes = json?.data?.attributes ?? json?.data ?? null;
    if (!attributes) return null;

    const buttons = pickArray(attributes?.Buttons).map((row) => {
      const data = normalizeItem(row);
      return {
        label: typeof data?.Label === 'string' ? data.Label : '',
        variant: typeof data?.Variant === 'string' ? data.Variant : 'primary',
        action: typeof data?.Action === 'string' ? data.Action : 'link',
        href: typeof data?.Href === 'string' ? data.Href : '',
        openInNewTab: Boolean(data?.OpenInNewTab),
        downloadFilename: typeof data?.DownloadFilename === 'string' ? data.DownloadFilename : '',
        hasGreenBorder: Boolean(data?.HasGreenBorder),
      };
    });

    const waysCards = pickArray(attributes?.WaysCards).map((row) => {
      const data = normalizeItem(row);
      return {
        title: typeof data?.Title === 'string' ? data.Title : '',
        body: typeof data?.Body === 'string' ? data.Body : '',
        listItems: normalizeListItems(data?.ListItems),
      };
    });

    const benefitsCards = pickArray(attributes?.BenefitsCards).map((row) => {
      const data = normalizeItem(row);
      return {
        title: typeof data?.Title === 'string' ? data.Title : '',
        body: typeof data?.Body === 'string' ? data.Body : '',
        listItems: normalizeListItems(data?.ListItems),
      };
    });

    const statisticsCards = pickArray(attributes?.StatisticsCards).map((row) => {
      const data = normalizeItem(row);
      return {
        value: typeof data?.Value === 'string' ? data.Value : '',
        label: typeof data?.Label === 'string' ? data.Label : '',
        body: typeof data?.Body === 'string' ? data.Body : '',
        listItems: normalizeListItems(data?.ListItems),
      };
    });

    return {
      title: typeof attributes?.Title === 'string' ? attributes.Title : '',
      titleHighlightColor: typeof attributes?.TitleHighlightColor === 'string' ? attributes.TitleHighlightColor : '',
      body: typeof attributes?.Body === 'string' ? attributes.Body : '',
      buttons,
      logosHeading: typeof attributes?.LogosHeading === 'string' ? attributes.LogosHeading : '',
      waysHeading: typeof attributes?.WaysHeading === 'string' ? attributes.WaysHeading : '',
      waysCards,
      benefitsHeading: typeof attributes?.BenefitsHeading === 'string' ? attributes.BenefitsHeading : '',
      benefitsCards,
      statisticsText: typeof attributes?.StatisticsText === 'string' ? attributes.StatisticsText : '',
      statisticsCards,
    };
  } catch {
    return null;
  }
}
