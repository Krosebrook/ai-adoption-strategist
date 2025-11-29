/**
 * AI Cost Optimization Utilities
 * Axis: Performance & AI Cost-Efficiency
 * 
 * Provides:
 * - Prompt compression
 * - Response caching
 * - Token estimation
 * - Batch request optimization
 */

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs = CACHE_TTL) {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
}

export function generateCacheKey(prefix, data) {
  // Create deterministic key from data
  const hash = JSON.stringify(data)
    .split('')
    .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return `${prefix}_${hash}`;
}

/**
 * Compress context objects for prompts
 * Removes null/undefined values, truncates long strings
 */
export function compressContext(obj, maxStringLength = 200) {
  if (!obj) return null;
  if (typeof obj === 'string') {
    return obj.length > maxStringLength 
      ? obj.substring(0, maxStringLength) + '...' 
      : obj;
  }
  if (Array.isArray(obj)) {
    return obj.slice(0, 10).map(item => compressContext(item, maxStringLength));
  }
  if (typeof obj === 'object') {
    const compressed = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      if (key.startsWith('_')) continue; // Skip private fields
      compressed[key] = compressContext(value, maxStringLength);
    }
    return compressed;
  }
  return obj;
}

/**
 * Extract only essential fields from strategy for prompts
 */
export function extractStrategyEssentials(strategy) {
  if (!strategy) return null;
  return {
    org: strategy.organization_name,
    platform: strategy.platform,
    phase: strategy.progress_tracking?.current_phase,
    progress: strategy.progress_tracking?.overall_progress,
    riskScore: strategy.risk_analysis?.risk_score,
    activeRisks: (strategy.risk_analysis?.identified_risks || [])
      .filter(r => r.status !== 'resolved')
      .slice(0, 5)
      .map(r => ({ desc: r.description, severity: r.severity })),
    delayedMilestones: (strategy.milestones || [])
      .filter(m => m.status === 'delayed')
      .slice(0, 3)
      .map(m => m.milestone_name)
  };
}

/**
 * Extract only essential fields from assessment for prompts
 */
export function extractAssessmentEssentials(assessment) {
  if (!assessment) return null;
  return {
    org: assessment.organization_name,
    topPlatform: assessment.recommended_platforms?.[0]?.platform_name,
    maturity: assessment.ai_assessment_score?.maturity_level,
    readiness: assessment.ai_assessment_score?.readiness_score,
    riskScore: assessment.ai_assessment_score?.risk_score,
    keyRisks: (assessment.ai_assessment_score?.key_risks || [])
      .slice(0, 3)
      .map(r => r.description),
    compliance: (assessment.compliance_requirements || []).slice(0, 5)
  };
}

/**
 * Estimate token count (rough approximation)
 * ~4 chars per token for English text
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Truncate prompt if it exceeds token budget
 */
export function truncateToTokenBudget(text, maxTokens = 2000) {
  const estimated = estimateTokens(text);
  if (estimated <= maxTokens) return text;
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars) + '\n[Truncated for token efficiency]';
}