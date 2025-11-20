/**
 * Format currency values
 */
export function formatCurrency(value, options = {}) {
  const { decimals = 0, compact = false } = options;
  
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(decimals)}K`;
  }
  
  return `$${value.toLocaleString(undefined, { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  })}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value, decimals = 0) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format dates consistently
 */
export function formatDate(date, options = {}) {
  const { format = 'short' } = options;
  const dateObj = new Date(date);
  
  if (format === 'long') {
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return dateObj.toLocaleDateString();
}

/**
 * Get severity badge styling
 */
export function getSeverityStyle(severity) {
  const styles = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };
  return styles[severity] || 'bg-slate-100 text-slate-800 border-slate-300';
}

/**
 * Get status badge styling
 */
export function getStatusStyle(status) {
  const styles = {
    completed: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800'
  };
  return styles[status] || 'bg-slate-100 text-slate-800';
}

/**
 * Get priority badge styling (alias for severity)
 */
export function getPriorityStyle(priority) {
  return getSeverityStyle(priority);
}