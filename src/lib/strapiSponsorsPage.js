import { getStrapiBaseUrl, strapiGet, attrs, pickArray } from './strapiUtils.js';

const normalizeListItems = (maybeListItems) => {
  return pickArray(maybeListItems)
    .map((row) => {
      const data = attrs(row);
      const text = typeof data?.Text === 'string' ? data.Text : '';
      return text.trim();
    })
    .filter(Boolean);
};

export async function fetchSponsorsPage({ signal } = {}) {
  const baseUrl = getStrapiBaseUrl();
  if (!baseUrl) return null;

  const params = new URLSearchParams();
  params.set('populate[Buttons][populate]', '*');
  params.set('populate[WaysCards][populate][ListItems]', '*');
  params.set('populate[BenefitsCards][populate][ListItems]', '*');
  params.set('populate[StatisticsCards][populate][ListItems]', '*');

  const json = await strapiGet('/api/sponsors-page', params, signal);
  const attributes = json?.data?.attributes ?? json?.data ?? null;
  if (!attributes) return null;

  const buttons = pickArray(attributes?.Buttons).map((row) => {
    const data = attrs(row);
    return {
      label: typeof data?.Label === 'string' ? data.Label : '',
      variant: typeof data?.Variant === 'string' ? data.Variant : 'primary',
      action: typeof data?.Action === 'string' ? data.Action : 'link',
      href: typeof data?.Href === 'string' ? data.Href : '',
      openInNewTab: Boolean(data?.OpenInNewTab),
      downloadFilename: typeof data?.DownloadFilename === 'string' ? data.DownloadFilename : '',
      hasGreenBorder: Boolean(data?.HasGreenBorder),
      fileUrl: attrs(data?.File)?.url ? new URL(attrs(data.File).url, baseUrl).toString() : null,
      toastTitle: typeof data?.ToastTitle === 'string' ? data.ToastTitle : 'Sponsorship Packet',
      toastText: typeof data?.ToastText === 'string' ? data.ToastText : 'Contact radicubs@gmail.com to get the packet.',
    };
  });

  const mapCard = (row) => {
    const data = attrs(row);
    return {
      title: typeof data?.Title === 'string' ? data.Title : '',
      body: typeof data?.Body === 'string' ? data.Body : '',
      listItems: normalizeListItems(data?.ListItems),
    };
  };

  const waysCards = pickArray(attributes?.WaysCards).map(mapCard);
  const benefitsCards = pickArray(attributes?.BenefitsCards).map(mapCard);

  const statisticsCards = pickArray(attributes?.StatisticsCards).map((row) => {
    const data = attrs(row);
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
}
