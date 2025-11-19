export function formatROI(value, unit = 'number') {
  if (value === null || value === undefined) return '$0';
  
  const num = Number(value);
  
  switch (unit) {
    case 'K':
      return `$${(num / 1000).toFixed(num >= 100000 ? 0 : 1)}K`;
    case 'M':
      return `$${(num / 1000000).toFixed(2)}M`;
    default:
      return `$${num.toLocaleString()}`;
  }
}

export function formatNumber(value, unit = 'number') {
  if (value === null || value === undefined) return '0';
  
  const num = Number(value);
  
  switch (unit) {
    case 'K':
      return `${(num / 1000).toFixed(num >= 100000 ? 0 : 1)}K`;
    case 'M':
      return `${(num / 1000000).toFixed(2)}M`;
    default:
      return num.toLocaleString();
  }
}