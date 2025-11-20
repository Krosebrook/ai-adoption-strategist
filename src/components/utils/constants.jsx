// Time range options
export const TIME_RANGES = {
  ALL: 'all',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  LAST_6_MONTHS: '6m',
  LAST_YEAR: '1y'
};

export const TIME_RANGE_LABELS = {
  [TIME_RANGES.ALL]: 'All Time',
  [TIME_RANGES.LAST_30_DAYS]: 'Last 30 Days',
  [TIME_RANGES.LAST_90_DAYS]: 'Last 90 Days',
  [TIME_RANGES.LAST_6_MONTHS]: 'Last 6 Months',
  [TIME_RANGES.LAST_YEAR]: 'Last Year'
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#21808D',
  SECONDARY: '#2974FF',
  TERTIARY: '#8B5CF6',
  QUATERNARY: '#F59E0B',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444'
};

export const PLATFORM_COLORS = {
  'Google Gemini': CHART_COLORS.PRIMARY,
  'Microsoft Copilot': CHART_COLORS.SECONDARY,
  'Anthropic Claude': CHART_COLORS.TERTIARY,
  'OpenAI ChatGPT': CHART_COLORS.QUATERNARY
};

// Status types
export const ASSESSMENT_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed'
};

export const FEEDBACK_TYPES = {
  GENERAL: 'general',
  PLATFORM_RECOMMENDATION: 'platform_recommendation',
  RISK_ASSESSMENT: 'risk_assessment',
  ROI_ACCURACY: 'roi_accuracy',
  COMPLIANCE_SCORES: 'compliance_scores',
  AI_INSIGHTS: 'ai_insights',
  IMPLEMENTATION: 'implementation'
};

// Severity levels
export const SEVERITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const SEVERITY_COLORS = {
  [SEVERITY_LEVELS.HIGH]: 'bg-red-100 text-red-800 border-red-300',
  [SEVERITY_LEVELS.MEDIUM]: 'bg-amber-100 text-amber-800 border-amber-300',
  [SEVERITY_LEVELS.LOW]: 'bg-blue-100 text-blue-800 border-blue-300'
};

// Priority levels
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Report types
export const REPORT_TYPES = {
  EXECUTIVE: 'executive',
  TECHNICAL: 'technical',
  FINANCIAL: 'financial',
  CUSTOM: 'custom'
};