import { TIME_RANGES, TIME_RANGE_DAYS } from './constants';

/**
 * Filters an array of items by a time range constant.
 * Items must have a `created_date` field (ISO string or Date-parseable value).
 *
 * @param {Array} items
 * @param {string} timeRange - One of the TIME_RANGES values
 * @returns {Array}
 */
export function filterByTimeRange(items, timeRange) {
  if (!items?.length || timeRange === TIME_RANGES.ALL) return items || [];

  const days = TIME_RANGE_DAYS[timeRange];
  if (!days) return items; // unknown range — return unfiltered

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return items.filter(item => new Date(item.created_date) >= cutoff);
}

/**
 * Groups an array of items by calendar month (YYYY-MM).
 *
 * @param {Array} items - Each item must have `created_date`
 * @param {Function} [getValue] - Optional transform applied to each item before grouping
 * @returns {Array<{ month: string, items: Array }>} Sorted ascending by month
 */
export function groupByMonth(items, getValue) {
  if (!items?.length) return [];

  const grouped = {};

  items.forEach(item => {
    const date = new Date(item.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped[monthKey]) {
      grouped[monthKey] = { month: monthKey, items: [] };
    }

    grouped[monthKey].items.push(getValue ? getValue(item) : item);
  });

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculates (value / total) * 100, safe against division by zero.
 *
 * @param {number} value
 * @param {number} total
 * @param {number} [decimals=0]
 * @returns {number}
 */
export function calculatePercentage(value, total, decimals = 0) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Counts items by a derived key, with optional pre-filter.
 *
 * @param {Array} items
 * @param {Function} getKey - Returns the string key for an item
 * @param {Function} [filterFn] - Optional predicate; items failing this are skipped
 * @returns {Record<string, number>}
 */
export function aggregateCounts(items, getKey, filterFn = null) {
  const counts = {};

  (items || []).forEach(item => {
    if (filterFn && !filterFn(item)) return;
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

/**
 * Converts a count-map to a sorted array of { name, value } objects.
 *
 * @param {Record<string, number>} countMap
 * @param {number|null} [limit] - If provided, caps the result length
 * @returns {Array<{ name: string, value: number }>}
 */
export function sortByFrequency(countMap, limit = null) {
  const sorted = Object.entries(countMap)
    .map(([key, count]) => ({ name: key, value: count }))
    .sort((a, b) => b.value - a.value);

  return limit ? sorted.slice(0, limit) : sorted;
}