import { ROI_BENCHMARKS, COMPLIANCE_DATA, INTEGRATION_SUPPORT, PAIN_POINT_SOLUTIONS, PLATFORM_PRICING, AI_PLATFORMS } from './AssessmentData';

export function calculateROI(departments, platform) {
  let totalAnnualSavings = 0;
  let totalCost = 0;
  const departmentBreakdown = [];

  departments.forEach(dept => {
    const hoursPerWeek = ROI_BENCHMARKS[dept.name]?.[platform] || 0;
    const weeksPerYear = 50; // Account for vacation
    const annualHoursSaved = hoursPerWeek * weeksPerYear * dept.user_count;
    const annualSavings = annualHoursSaved * dept.hourly_rate;
    
    const platformCost = (PLATFORM_PRICING[platform] || 20) * 12 * dept.user_count;
    totalCost += platformCost;
    totalAnnualSavings += annualSavings;

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
  const oneYearROI = totalCost > 0 ? ((netAnnualSavings / totalCost) * 100) : 0;
  const threeYearROI = totalCost > 0 ? (((netAnnualSavings * 3) / totalCost) * 100) : 0;

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

export function calculateAllROI(departments) {
  const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
  return platforms.map(platform => calculateROI(departments, platform));
}

export function assessCompliance(complianceRequirements) {
  const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
  const results = {};

  platforms.forEach(platform => {
    let certifiedCount = 0;
    let inProgressCount = 0;
    let notCertifiedCount = 0;
    const statusDetails = {};

    complianceRequirements.forEach(requirement => {
      const status = COMPLIANCE_DATA[platform]?.[requirement] || 'unknown';
      statusDetails[requirement] = status;
      
      if (status === 'certified') certifiedCount++;
      else if (status === 'in_progress') inProgressCount++;
      else if (status === 'not_certified') notCertifiedCount++;
    });

    const totalRequirements = complianceRequirements.length;
    const complianceScore = totalRequirements > 0 
      ? ((certifiedCount / totalRequirements) * 100) 
      : 0;

    results[platform] = {
      compliance_score: complianceScore,
      certified: certifiedCount,
      in_progress: inProgressCount,
      not_certified: notCertifiedCount,
      status_details: statusDetails
    };
  });

  return results;
}

export function assessIntegrations(desiredIntegrations) {
  const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
  const results = {};

  platforms.forEach(platform => {
    let nativeCount = 0;
    let apiCount = 0;
    let limitedCount = 0;
    let notSupportedCount = 0;
    const integrationDetails = {};

    desiredIntegrations.forEach(integration => {
      const support = INTEGRATION_SUPPORT[platform]?.[integration] || 'not_supported';
      integrationDetails[integration] = support;
      
      if (support === 'native') nativeCount++;
      else if (support === 'api') apiCount++;
      else if (support === 'limited') limitedCount++;
      else notSupportedCount++;
    });

    const totalIntegrations = desiredIntegrations.length;
    const integrationScore = totalIntegrations > 0 
      ? (((nativeCount * 1.0) + (apiCount * 0.8) + (limitedCount * 0.4)) / totalIntegrations) * 100
      : 0;

    results[platform] = {
      integration_score: integrationScore,
      native: nativeCount,
      api: apiCount,
      limited: limitedCount,
      not_supported: notSupportedCount,
      integration_details: integrationDetails
    };
  });

  return results;
}

export function assessPainPoints(painPoints) {
  const platformScores = {
    'google_gemini': 0,
    'microsoft_copilot': 0,
    'anthropic_claude': 0,
    'openai_chatgpt': 0
  };

  const mappings = [];

  painPoints.forEach(painPoint => {
    const solution = PAIN_POINT_SOLUTIONS[painPoint];
    if (solution) {
      solution.platforms.forEach((platform, index) => {
        // Weight: first platform gets 3 points, second gets 2, third gets 1
        platformScores[platform] += (3 - index);
      });

      mappings.push({
        pain_point: painPoint,
        solution: solution.solution,
        recommended_platforms: solution.platforms.map(p => 
          AI_PLATFORMS.find(plat => plat.id === p)?.name || p
        )
      });
    }
  });

  return {
    platform_scores: platformScores,
    pain_point_mappings: mappings
  };
}

export function generateRecommendations(roiData, complianceData, integrationData, painPointData, customWeights = null) {
  const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
  const recommendations = [];

  // Use custom weights from AI analysis or default weights
  const weights = customWeights || {
    roi_weight: 0.35,
    compliance_weight: 0.25,
    integration_weight: 0.25,
    pain_point_weight: 0.15
  };

  platforms.forEach(platformId => {
    const roi = roiData.find(r => r.platform === platformId);
    const compliance = complianceData[platformId];
    const integration = integrationData[platformId];
    const painPointScore = painPointData.platform_scores[platformId] || 0;

    // Weighted scoring
    const roiScore = roi ? (roi.one_year_roi / 10) : 0; // Scale to 0-100
    const complianceScore = compliance?.compliance_score || 0;
    const integrationScore = integration?.integration_score || 0;
    const painScore = (painPointScore / 10) * 100; // Normalize

    // Apply dynamic weights
    const totalScore = 
      (roiScore * weights.roi_weight) + 
      (complianceScore * weights.compliance_weight) + 
      (integrationScore * weights.integration_weight) + 
      (painScore * weights.pain_point_weight);

    const platformName = AI_PLATFORMS.find(p => p.id === platformId)?.name || platformId;

    let justification = `${platformName} scores ${totalScore.toFixed(1)}/100. `;
    
    if (roi && roi.one_year_roi > 200) {
      justification += `Strong ROI at ${roi.one_year_roi.toFixed(0)}%. `;
    }
    if (compliance && compliance.compliance_score > 80) {
      justification += `Excellent compliance coverage (${compliance.compliance_score.toFixed(0)}%). `;
    }
    if (integration && integration.integration_score > 70) {
      justification += `Robust integration support. `;
    }

    recommendations.push({
      platform: platformId,
      platform_name: platformName,
      score: totalScore,
      justification: justification.trim(),
      roi_score: roiScore,
      compliance_score: complianceScore,
      integration_score: integrationScore,
      pain_point_score: painScore
    });
  });

  // Sort by total score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

export function generateExecutiveSummary(assessmentData, recommendations) {
  const topPlatform = recommendations[0];
  const runnerUp = recommendations[1];
  
  const totalUsers = assessmentData.departments.reduce((sum, d) => sum + d.user_count, 0);
  const topROI = assessmentData.roi_calculations?.[topPlatform.platform];

  let summary = `# Executive Summary\n\n`;
  summary += `**Organization:** ${assessmentData.organization_name}\n`;
  summary += `**Assessment Date:** ${new Date(assessmentData.assessment_date).toLocaleDateString()}\n`;
  summary += `**Total Users Evaluated:** ${totalUsers}\n\n`;
  
  summary += `## Top Recommendation: ${topPlatform.platform_name}\n\n`;
  summary += `${topPlatform.justification}\n\n`;
  
  if (topROI) {
    summary += `### Financial Impact\n`;
    summary += `- **Annual Net Savings:** $${topROI.net_annual_savings.toLocaleString()}\n`;
    summary += `- **1-Year ROI:** ${topROI.one_year_roi.toFixed(0)}%\n`;
    summary += `- **3-Year ROI:** ${topROI.three_year_roi.toFixed(0)}%\n\n`;
  }
  
  summary += `### Key Strengths\n`;
  summary += `- Compliance Score: ${topPlatform.compliance_score.toFixed(0)}%\n`;
  summary += `- Integration Compatibility: ${topPlatform.integration_score.toFixed(0)}%\n`;
  summary += `- Pain Point Alignment: ${topPlatform.pain_point_score.toFixed(0)}%\n\n`;
  
  summary += `## Alternative Option: ${runnerUp.platform_name}\n\n`;
  summary += `${runnerUp.justification}\n\n`;
  
  summary += `## Next Steps\n\n`;
  summary += `1. Schedule pilot program with ${topPlatform.platform_name}\n`;
  summary += `2. Identify 10-20 early adopters from key departments\n`;
  summary += `3. Establish success metrics and KPIs\n`;
  summary += `4. Plan phased rollout over 6-12 months\n`;

  return summary;
}