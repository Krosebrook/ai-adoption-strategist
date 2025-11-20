// Filter assessments by time range
export function filterByTimeRange(items, timeRange) {
  if (timeRange === 'all') return items;
  
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (timeRange) {
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case '6m':
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return items;
  }
  
  return items.filter(item => new Date(item.created_date) >= cutoffDate);
}

// Group data by month
export function groupByMonth(items, getValue) {
  const grouped = {};
  
  items.forEach(item => {
    const date = new Date(item.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        month: monthKey,
        items: []
      };
    }
    
    grouped[monthKey].items.push(getValue ? getValue(item) : item);
  });
  
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}

// Calculate percentage
export function calculatePercentage(value, total, decimals = 0) {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

// Aggregate counts
export function aggregateCounts(items, getKey, filterFn = null) {
  const counts = {};
  
  items.forEach(item => {
    if (filterFn && !filterFn(item)) return;
    
    const key = getKey(item);
    if (!counts[key]) {
      counts[key] = 0;
    }
    counts[key]++;
  });
  
  return counts;
}

// Sort by frequency
export function sortByFrequency(countMap, limit = null) {
  const sorted = Object.entries(countMap)
    .map(([key, count]) => ({ name: key, value: count }))
    .sort((a, b) => b.value - a.value);
  
  return limit ? sorted.slice(0, limit) : sorted;
}