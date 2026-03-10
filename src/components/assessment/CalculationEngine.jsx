/**
 * CalculationEngine.jsx
 *
 * Pure business-logic functions for the AI platform assessment.
 * No React dependencies — safe to import anywhere.
 *
 * Scoring model:
 *   totalScore = (roiScore * roiW) + (complianceScore * compW) +
 *                (integrationScore * intW) + (painScore * painW)
 *
 * Default weights: ROI 35 / Compliance 25 / Integration 25 / Pain 15
 */

import {
  ROI_BENCHMARKS,
  COMPLIANCE_DATA,
  INTEGRATION_SUPPORT,
  PAIN_POINT_SOLUTIONS,
  PLATFORM_PRICING,
  AI_PLATFORMS
} from './AssessmentData';

/** Ordered list of platform IDs evaluated by this engine. */
const PLATFORM_IDS = AI_PLATFORMS.map(p => p.id);

/** Weeks worked per year (excludes ~2 weeks vacation). */
const WEEKS_PER_YEAR = 50;

/** Default scoring weights (must sum to 1.0). */
const DEFAULT_WEIGHTS = {
  roi_weight: 0.35,
  compliance_weight: 0.25,
  integration_weight: 0.25,
  pain_point_weight: 0.15
};

// ─────────────────────────────────────────────────────────────────────────────
// ROI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates annualised ROI for a single platform across all departments.
 *
 * @param {Array<{name: string, user_count: number, hourly_rate: number}>} departments
 * @param {string} platform - Platform ID
 * @returns {object} ROI breakdown for this platform
 */
export function calculateROI(departments, platform) {
  let totalAnnualSavings = 0;
  let totalCost = 0;
  const departmentBreakdown = [];

  (departments || []).forEach(dept => {
    const hoursPerWeek = ROI_BENCHMARKS[dept.name]?.[platform] ?? 0;
    const annualHoursSaved = hoursPerWeek * WEEKS_PER_YEAR * (dept.user_count || 0);
    const hourlyRate = dept.hourly_rate || 0;
    const annualSavings = annualHoursSaved * hourlyRate;
    const platformCost = (PLATFORM_PRICING[platform] ?? 20) * 12 * (dept.user_count || 0);

    totalAnnualSavings += annualSavings;
    totalCost += platformCost;

    departmentBreakdown.push({
      department: dept.name,
      user_count: dept.user_count,
      hours_saved_per_user_per_week: hoursPerWeek,
      annual_hours_saved: annualHoursSaved,
      annual_savings: annualSavings,
      platform_cost: platformCost,
      net_savings: annualSavings - platformCost
    });
  });

  const netAnnualSavings = totalAnnualSavings - totalCost;
  const oneYearROI = totalCost > 0 ? (netAnnualSavings / totalCost) * 100 : 0;
  const threeYearROI = totalCost > 0 ? ((netAnnualSavings * 3) / totalCost) * 100 : 0;

  return {
    platform,
    total_annual_savings: totalAnnualSavings,
    total_cost: totalCost,
    net_annual_savings: netAnnualSavings,
    one_year_roi: oneYearROI,
    three_year_roi: threeYearROI,
    department_breakdown: departmentBreakdown
  };
}

/**
 * Calculates ROI for all platforms in PLATFORM_IDS.
 *
 * @param {Array} departments
 * @returns {Array} One ROI object per platform
 */
export function calculateAllROI(departments) {
  return PLATFORM_IDS.map(platform => calculateROI(departments, platform));
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scores each platform against the provided compliance requirements.
 *
 * @param {string[]} complianceRequirements
 * @returns {Record<string, object>} Compliance result keyed by platform ID
 */
export function assessCompliance(complianceRequirements) {
  const results = {};

  PLATFORM_IDS.forEach(platform => {
    let certified = 0;
    let inProgress = 0;
    let notCertified = 0;
    const statusDetails = {};

    (complianceRequirements || []).forEach(req => {
      const status = COMPLIANCE_DATA[platform]?.[req] || 'unknown';
      statusDetails[req] = status;
      if (status === 'certified') certified++;
      else if (status === 'in_progress') inProgress++;
      else if (status === 'not_certified') notCertified++;
    });

    const total = complianceRequirements?.length || 0;
    const complianceScore = total > 0 ? (certified / total) * 100 : 0;

    results[platform] = {
      compliance_score: complianceScore,
      certified,
      in_progress: inProgress,
      not_certified: notCertified,
      status_details: statusDetails
    };
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Integrations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Integration support weights:
 *   native = 1.0, api = 0.8, limited = 0.4, not_supported = 0
 */
const INTEGRATION_WEIGHTS = { native: 1.0, api: 0.8, limited: 0.4, not_supported: 0 };

/**
 * Scores each platform against the desired integrations.
 *
 * @param {string[]} desiredIntegrations
 * @returns {Record<string, object>}
 */
export function assessIntegrations(desiredIntegrations) {
  const results = {};

  PLATFORM_IDS.forEach(platform => {
    let native = 0, api = 0, limited = 0, notSupported = 0;
    let weightedSum = 0;
    const integrationDetails = {};

    (desiredIntegrations || []).forEach(integration => {
      const support = INTEGRATION_SUPPORT[platform]?.[integration] || 'not_supported';
      integrationDetails[integration] = support;
      weightedSum += INTEGRATION_WEIGHTS[support] ?? 0;

      if (support === 'native') native++;
      else if (support === 'api') api++;
      else if (support === 'limited') limited++;
      else notSupported++;
    });

    const total = desiredIntegrations?.length || 0;
    const integrationScore = total > 0 ? (weightedSum / total) * 100 : 0;

    results[platform] = {
      integration_score: integrationScore,
      native,
      api,
      limited,
      not_supported: notSupported,
      integration_details: integrationDetails
    };
  });

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pain Points
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps pain points to platforms using a ranked-choice scoring model.
 * First-ranked platform gets 3 pts, second gets 2, third gets 1.
 *
 * @param {string[]} painPoints
 * @returns {{ platform_scores: Record<string,number>, pain_point_mappings: Array }}
 */
export function assessPainPoints(painPoints) {
  const platformScores = Object.fromEntries(PLATFORM_IDS.map(id => [id, 0]));
  const mappings = [];

  (painPoints || []).forEach(painPoint => {
    const solution = PAIN_POINT_SOLUTIONS[painPoint];
    if (!solution) return;

    solution.platforms.forEach((platform, index) => {
      if (platformScores[platform] !== undefined) {
        platformScores[platform] += Math.max(0, 3 - index);
      }
    });

    mappings.push({
      pain_point: painPoint,
      solution: solution.solution,
      recommended_platforms: solution.platforms.map(
        p => AI_PLATFORMS.find(plat => plat.id === p)?.name || p
      )
    });
  });

  return { platform_scores: platformScores, pain_point_mappings: mappings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derives budget fit label for a platform given the assessment's budget constraints.
 *
 * @param {number} platformCost - Annual total cost for this platform
 * @param {object} budgetConstraints - { max_budget, budget_period }
 * @returns {'excellent'|'good'|'moderate'|'exceeds'}
 */
function deriveBudgetFit(platformCost, budgetConstraints) {
  if (!budgetConstraints?.max_budget) return 'moderate';

  const { max_budget, budget_period } = budgetConstraints;
  const annualMax = budget_period === 'monthly' ? max_budget * 12 : max_budget;

  if (platformCost <= annualMax * 0.7) return 'excellent';
  if (platformCost <= annualMax) return 'good';
  if (platformCost <= annualMax * 1.2) return 'moderate';
  return 'exceeds';
}

/**
 * Generates a ranked list of platform recommendations.
 *
 * @param {Array}  roiData
 * @param {object} complianceData
 * @param {object} integrationData
 * @param {object} painPointData
 * @param {object|null} customWeights    - From AIEnhancer feedback analysis
 * @param {object|null} refinedWeights   - From DynamicScoringEngine
 * @param {object|null} assessment       - Full assessment object for budget/goal context
 * @returns {Array} Sorted recommendations (highest score first)
 */
export function generateRecommendations(
  roiData,
  complianceData,
  integrationData,
  painPointData,
  customWeights = null,
  refinedWeights = null,
  assessment = null
) {
  // Priority: refinedWeights > customWeights > defaults
  const weights = refinedWeights?.recommended_weights || customWeights || DEFAULT_WEIGHTS;

  const recommendations = PLATFORM_IDS.map(platformId => {
    const roi = roiData.find(r => r.platform === platformId);
    const compliance = complianceData[platformId];
    const integration = integrationData[platformId];
    const rawPainScore = painPointData.platform_scores[platformId] ?? 0;

    // Normalise each dimension to 0–100
    const roiScore = roi ? Math.min(roi.one_year_roi / 10, 100) : 0;
    const complianceScore = compliance?.compliance_score ?? 0;
    const integrationScore = integration?.integration_score ?? 0;
    const painScore = Math.min((rawPainScore / 10) * 100, 100);

    const totalScore =
      roiScore * weights.roi_weight +
      complianceScore * weights.compliance_weight +
      integrationScore * weights.integration_weight +
      painScore * weights.pain_point_weight;

    const platformInfo = AI_PLATFORMS.find(p => p.id === platformId);
    const platformName = platformInfo?.name || platformId;

    // Narrative justification
    let justification = `${platformName} scores ${totalScore.toFixed(1)}/100. `;
    if (roi?.one_year_roi > 200) justification += `Strong ROI at ${roi.one_year_roi.toFixed(0)}%. `;
    if (complianceScore > 80) justification += `Excellent compliance coverage (${complianceScore.toFixed(0)}%). `;
    if (integrationScore > 70) justification += `Robust integration support. `;

    // Pros / cons
    const pros = [];
    const cons = [];

    if (roi?.one_year_roi > 150) pros.push(`Exceptional ROI: ${roi.one_year_roi.toFixed(0)}% in year 1`);
    if (complianceScore > 80) pros.push('Strong compliance coverage');
    if (integrationScore > 80) pros.push('Excellent integration support');
    if (platformInfo?.features?.includes('enterprise_ready')) pros.push('Enterprise-grade security and scalability');

    if (roi?.one_year_roi < 100) cons.push('Lower ROI compared to alternatives');
    if (complianceScore < 60) cons.push('Limited compliance certifications');
    if (integrationScore < 50) cons.push('May require custom integration work');

    const budgetFit = deriveBudgetFit(roi?.total_cost ?? 0, assessment?.budget_constraints);
    if (budgetFit === 'exceeds') cons.push('Exceeds stated budget constraints');

    // Best-use-case labels derived from business goals
    const bestFor = [];
    (assessment?.business_goals || []).forEach(goal => {
      const lower = goal.toLowerCase();
      if (lower.includes('customer') && platformId === 'openai_chatgpt') bestFor.push('Customer-facing AI applications');
      if (lower.includes('productivity') && platformId === 'microsoft_copilot') bestFor.push('Enterprise productivity enhancement');
      if (lower.includes('research') && platformId === 'anthropic_claude') bestFor.push('Research and analysis tasks');
    });
    if (bestFor.length === 0) bestFor.push(platformInfo?.ideal_for || 'General purpose AI tasks');

    return {
      platform: platformId,
      platform_name: platformName,
      score: totalScore,
      justification: justification.trim(),
      roi_score: roiScore,
      compliance_score: complianceScore,
      integration_score: integrationScore,
      pain_point_score: painScore,
      pros: pros.length > 0 ? pros : ['Solid overall performance', 'Proven enterprise platform'],
      cons: cons.length > 0 ? cons : ['Consider specific use case requirements'],
      best_for: bestFor,
      budget_fit: budgetFit
    };
  });

  return recommendations.sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Executive Summary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a markdown executive summary from assessment results.
 *
 * @param {object} assessmentData
 * @param {Array}  recommendations - Sorted (highest score first)
 * @returns {string} Markdown string
 */
export function generateExecutiveSummary(assessmentData, recommendations) {
  if (!recommendations?.length) return '# Executive Summary\n\nNo recommendations available.';

  const top = recommendations[0];
  const runnerUp = recommendations[1];
  const totalUsers = (assessmentData.departments || []).reduce((sum, d) => sum + (d.user_count || 0), 0);
  const topROI = assessmentData.roi_calculations?.[top.platform];

  const lines = [
    '# Executive Summary',
    '',
    `**Organization:** ${assessmentData.organization_name}`,
    `**Assessment Date:** ${new Date(assessmentData.assessment_date).toLocaleDateString()}`,
    `**Total Users Evaluated:** ${totalUsers}`,
    '',
    `## Top Recommendation: ${top.platform_name}`,
    '',
    top.justification,
    ''
  ];

  if (topROI) {
    lines.push(
      '### Financial Impact',
      `- **Annual Net Savings:** $${topROI.net_annual_savings.toLocaleString()}`,
      `- **1-Year ROI:** ${topROI.one_year_roi.toFixed(0)}%`,
      `- **3-Year ROI:** ${topROI.three_year_roi.toFixed(0)}%`,
      ''
    );
  }

  lines.push(
    '### Key Strengths',
    `- Compliance Score: ${top.compliance_score.toFixed(0)}%`,
    `- Integration Compatibility: ${top.integration_score.toFixed(0)}%`,
    `- Pain Point Alignment: ${top.pain_point_score.toFixed(0)}%`,
    ''
  );

  if (runnerUp) {
    lines.push(
      `## Alternative Option: ${runnerUp.platform_name}`,
      '',
      runnerUp.justification,
      ''
    );
  }

  lines.push(
    '## Recommended Next Steps',
    '',
    `1. Schedule a pilot program with ${top.platform_name} (10–20 early adopters)`,
    '2. Define success metrics and KPIs before launch',
    '3. Identify change-management stakeholders across key departments',
    '4. Plan phased rollout over 6–12 months with quarterly reviews'
  );

  return lines.join('\n');
}