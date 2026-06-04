/**
 * Formats an ISO date string into a human-readable US English date.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
export const formatDate = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
