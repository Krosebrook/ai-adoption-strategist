// ─── Time Ranges ─────────────────────────────────────────────────────────────

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

// Maps TIME_RANGES values to the number of days they represent.
// Used by filterByTimeRange to avoid magic-string parsing.
export const TIME_RANGE_DAYS = {
  [TIME_RANGES.LAST_30_DAYS]: 30,
  [TIME_RANGES.LAST_90_DAYS]: 90,
  [TIME_RANGES.LAST_6_MONTHS]: 180,
  [TIME_RANGES.LAST_YEAR]: 365
};

// ─── Chart Colors ─────────────────────────────────────────────────────────────
// Each color is semantically unique — WARNING and QUATERNARY are intentionally
// different values to avoid accidental visual overlap.

export const CHART_COLORS = {
  PRIMARY: '#21808D',
  SECONDARY: '#2974FF',
  TERTIARY: '#8B5CF6',
  QUATERNARY: '#F59E0B',
  SUCCESS: '#10B981',
  WARNING: '#F97316', // orange — distinct from QUATERNARY amber
  DANGER: '#EF4444'
};

export const PLATFORM_COLORS = {
  'Google Gemini': CHART_COLORS.PRIMARY,
  'Microsoft Copilot': CHART_COLORS.SECONDARY,
  'Anthropic Claude': CHART_COLORS.TERTIARY,
  'OpenAI ChatGPT': CHART_COLORS.QUATERNARY
};

// ─── Status Enums ─────────────────────────────────────────────────────────────

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

// ─── Severity ─────────────────────────────────────────────────────────────────

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const SEVERITY_COLORS = {
  [SEVERITY_LEVELS.CRITICAL]: 'bg-red-200 text-red-900 border-red-400',
  [SEVERITY_LEVELS.HIGH]: 'bg-red-100 text-red-800 border-red-300',
  [SEVERITY_LEVELS.MEDIUM]: 'bg-amber-100 text-amber-800 border-amber-300',
  [SEVERITY_LEVELS.LOW]: 'bg-blue-100 text-blue-800 border-blue-300'
};

// ─── Priority ─────────────────────────────────────────────────────────────────

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// ─── Report Types ─────────────────────────────────────────────────────────────

export const REPORT_TYPES = {
  EXECUTIVE: 'executive',
  TECHNICAL: 'technical',
  FINANCIAL: 'financial',
  CUSTOM: 'custom'
};