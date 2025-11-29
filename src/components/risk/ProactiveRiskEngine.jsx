import { base44 } from '@/api/base44Client';
import { 
  getCached, setCache, generateCacheKey,
  extractStrategyEssentials, extractAssessmentEssentials,
  truncateToTokenBudget
} from '../utils/aiOptimization';

// Risk thresholds configuration
export const RISK_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 40,
  low: 20
};

export const TRIGGER_CONDITIONS = {
  progress_stall: { threshold: 14, unit: 'days' }, // No progress for X days
  risk_score_spike: { threshold: 20 }, // Risk score increased by X%
  milestone_delay: { threshold: 7, unit: 'days' }, // Milestone delayed by X days
  compliance_gap: { threshold: 3 }, // Number of unaddressed compliance issues
  budget_deviation: { threshold: 15 } // Budget deviation percentage
};

export async function analyzeStrategyRisks(strategy, assessment) {
  const risks = [];
  
  // Check progress stall
  const lastUpdate = new Date(strategy.updated_date);
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceUpdate > TRIGGER_CONDITIONS.progress_stall.threshold) {
    risks.push({
      category: 'operational',
      trigger: 'progress_stall',
      severity: daysSinceUpdate > 30 ? 'critical' : 'high',
      details: `No progress updates for ${daysSinceUpdate} days`
    });
  }
  
  // Check risk score
  const currentRiskScore = strategy.risk_analysis?.risk_score || 0;
  if (currentRiskScore >= RISK_THRESHOLDS.high) {
    risks.push({
      category: 'organizational',
      trigger: 'high_risk_score',
      severity: currentRiskScore >= RISK_THRESHOLDS.critical ? 'critical' : 'high',
      details: `Risk score at ${currentRiskScore}%`
    });
  }
  
  // Check milestone delays
  const delayedMilestones = (strategy.milestones || []).filter(m => {
    if (m.status === 'completed') return false;
    const targetDate = new Date(m.target_date);
    return targetDate < new Date();
  });
  
  if (delayedMilestones.length > 0) {
    risks.push({
      category: 'timeline',
      trigger: 'milestone_delay',
      severity: delayedMilestones.length > 2 ? 'critical' : 'high',
      details: `${delayedMilestones.length} milestone(s) are delayed`
    });
  }
  
  // Check unresolved critical risks
  const unresolvedCritical = (strategy.risk_analysis?.identified_risks || [])
    .filter(r => r.severity === 'critical' && r.status !== 'resolved');
  
  if (unresolvedCritical.length > 0) {
    risks.push({
      category: 'operational',
      trigger: 'unresolved_critical',
      severity: 'critical',
      details: `${unresolvedCritical.length} critical risk(s) unresolved`
    });
  }
  
  return risks;
}

export async function analyzeAssessmentRisks(assessment) {
  const risks = [];
  
  // Check overall risk score
  const riskScore = assessment.ai_assessment_score?.risk_score || 0;
  if (riskScore >= RISK_THRESHOLDS.high) {
    risks.push({
      category: 'organizational',
      trigger: 'high_assessment_risk',
      severity: riskScore >= RISK_THRESHOLDS.critical ? 'critical' : 'high',
      details: `Assessment risk score at ${riskScore}%`
    });
  }
  
  // Check compliance gaps
  const complianceIssues = assessment.ai_assessment_score?.key_risks?.filter(
    r => r.area === 'compliance' || r.area === 'regulatory'
  ) || [];
  
  if (complianceIssues.length >= TRIGGER_CONDITIONS.compliance_gap.threshold) {
    risks.push({
      category: 'compliance',
      trigger: 'compliance_gaps',
      severity: 'high',
      details: `${complianceIssues.length} compliance issues identified`
    });
  }
  
  // Check maturity level concerns
  if (assessment.ai_assessment_score?.maturity_level === 'beginner') {
    const hasComplexGoals = assessment.business_goals?.length > 3;
    if (hasComplexGoals) {
      risks.push({
        category: 'organizational',
        trigger: 'maturity_mismatch',
        severity: 'medium',
        details: 'Complex goals with beginner maturity level'
      });
    }
  }
  
  return risks;
}

export async function generateMitigationPlan(risk, context) {
  // Check cache first
  const cacheKey = generateCacheKey('mitigation', { risk, context });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Compress context for token efficiency
  const compressedContext = {
    strategy: extractStrategyEssentials(context.strategy),
    assessment: extractAssessmentEssentials(context.assessment)
  };

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: truncateToTokenBudget(`Risk mitigation analysis needed.

RISK: ${risk.category} | ${risk.severity} | ${risk.trigger}
Details: ${risk.details}

CONTEXT: ${JSON.stringify(compressedContext)}

Provide 3-5 actionable mitigation steps with ownership and timelines.`),
    response_json_schema: {
      type: 'object',
      properties: {
        risk_analysis: { type: 'string' },
        potential_impact: { type: 'string' },
        mitigation_steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              step: { type: 'string' },
              priority: { type: 'string', enum: ['immediate', 'short-term', 'medium-term'] },
              owner: { type: 'string' },
              timeline: { type: 'string' }
            }
          }
        }
      }
    }
  });
  
  setCache(cacheKey, response);
  return response;
}

export async function generateComplianceDraft(risk, context) {
  if (risk.category !== 'compliance') return null;
  
  const cacheKey = generateCacheKey('compliance', { risk, context });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const compressedContext = {
    strategy: extractStrategyEssentials(context.strategy),
    assessment: extractAssessmentEssentials(context.assessment)
  };

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Compliance documentation needed for: ${risk.details} (${risk.severity})
Context: ${JSON.stringify(compressedContext)}
Generate compliance doc with requirements, gaps, and remediation.`,
    response_json_schema: {
      type: 'object',
      properties: {
        document_type: { type: 'string' },
        title: { type: 'string' },
        executive_summary: { type: 'string' },
        compliance_requirements: { type: 'array', items: { type: 'string' } },
        current_gaps: { type: 'array', items: { type: 'string' } },
        remediation_plan: { type: 'string' },
        timeline: { type: 'string' },
        verification_steps: { type: 'array', items: { type: 'string' } }
      }
    }
  });
  
  const result = {
    document_type: response.document_type,
    title: response.title,
    content: `# ${response.title}\n\n## Executive Summary\n${response.executive_summary}\n\n## Compliance Requirements\n${response.compliance_requirements?.map(r => `- ${r}`).join('\n')}\n\n## Current Gaps\n${response.current_gaps?.map(g => `- ${g}`).join('\n')}\n\n## Remediation Plan\n${response.remediation_plan}\n\n## Timeline\n${response.timeline}\n\n## Verification Steps\n${response.verification_steps?.map(s => `- ${s}`).join('\n')}`,
    generated_at: new Date().toISOString()
  };
  
  setCache(cacheKey, result);
  return result;
}

export async function generateStrategyAdjustments(risk, strategy) {
  const cacheKey = generateCacheKey('adjustments', { risk, strategyId: strategy.id });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const essentials = extractStrategyEssentials(strategy);

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Strategy adjustment for ${risk.category} risk (${risk.severity}): ${risk.details}
Strategy: ${JSON.stringify(essentials)}
Propose 2-4 concrete adjustments with priority and impact.`,
    response_json_schema: {
      type: 'object',
      properties: {
        adjustments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              adjustment: { type: 'string' },
              rationale: { type: 'string' },
              impact: { type: 'string' },
              priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
            }
          }
        }
      }
    }
  });
  
  const result = response.adjustments || [];
  setCache(cacheKey, result);
  return result;
}

/**
 * Generate training recommendations for risk mitigation
 * Triggered for compliance, organizational, and strategic risks
 */
export async function generateRiskTrainingRecommendations(risk, context) {
  // Only generate training for relevant risk categories
  const trainingRelevantCategories = ['compliance', 'organizational', 'operational', 'technical'];
  if (!trainingRelevantCategories.includes(risk.category)) {
    return [];
  }

  const cacheKey = generateCacheKey('risk_training', { risk, contextId: context.strategy?.id || context.assessment?.id });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const compressedContext = {
    strategy: extractStrategyEssentials(context.strategy),
    assessment: extractAssessmentEssentials(context.assessment)
  };

  // Extract owners from mitigation steps if available
  const potentialOwners = context.mitigationSteps?.map(s => s.owner).filter(Boolean) || [];

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: truncateToTokenBudget(`AI Training Coach: Recommend training modules to address this risk.

RISK: ${risk.category} | ${risk.severity}
Details: ${risk.details}
${potentialOwners.length > 0 ? `Assigned Owners: ${potentialOwners.join(', ')}` : ''}

CONTEXT: ${JSON.stringify(compressedContext)}

Recommend 2-4 training modules that would help team members address this specific risk.
Focus on practical skills needed to mitigate the identified risk.`),
    response_json_schema: {
      type: 'object',
      properties: {
        training_modules: {
          type: 'array',
          maxItems: 4,
          items: {
            type: 'object',
            properties: {
              module_title: { type: 'string' },
              description: { type: 'string' },
              target_role: { type: 'string' },
              skill_focus: { type: 'array', items: { type: 'string' }, maxItems: 3 },
              priority: { type: 'string', enum: ['critical', 'high', 'medium'] },
              estimated_duration: { type: 'string' },
              relevance_reason: { type: 'string' }
            }
          }
        }
      }
    }
  });

  const result = response.training_modules || [];
  setCache(cacheKey, result, 10 * 60 * 1000); // 10 min cache
  return result;
}

export async function runProactiveRiskScan(strategies, assessments) {
  const alerts = [];
  
  // Collect all risks first (no LLM calls yet)
  const strategyRisks = [];
  for (const strategy of strategies) {
    const assessment = assessments.find(a => a.id === strategy.assessment_id);
    const risks = await analyzeStrategyRisks(strategy, assessment);
    strategyRisks.push(...risks.map(r => ({ risk: r, strategy, assessment, type: 'strategy' })));
  }
  
  const assessmentRisks = [];
  for (const assessment of assessments) {
    const hasStrategy = strategies.some(s => s.assessment_id === assessment.id);
    if (hasStrategy) continue;
    const risks = await analyzeAssessmentRisks(assessment);
    assessmentRisks.push(...risks.map(r => ({ risk: r, assessment, type: 'assessment' })));
  }
  
  // Process strategy risks with parallel LLM calls where possible
  const strategyAlertPromises = strategyRisks.map(async ({ risk, strategy, assessment }) => {
    const context = { strategy, assessment };
    
    // Run LLM calls in parallel for each risk
    const [mitigation, complianceDraft, adjustments] = await Promise.all([
      generateMitigationPlan(risk, context),
      generateComplianceDraft(risk, context),
      generateStrategyAdjustments(risk, strategy)
    ]);
    
    // Generate training recommendations with mitigation context
    const trainingContext = { ...context, mitigationSteps: mitigation.mitigation_steps };
    const recommendedTraining = await generateRiskTrainingRecommendations(risk, trainingContext);
    
    return {
      source_type: 'strategy',
      source_id: strategy.id,
      source_name: strategy.organization_name,
      risk_category: risk.category,
      severity: risk.severity,
      risk_score: risk.severity === 'critical' ? 90 : risk.severity === 'high' ? 70 : 50,
      trigger_reason: risk.trigger,
      risk_description: risk.details,
      potential_impact: mitigation.potential_impact,
      mitigation_steps: mitigation.mitigation_steps?.map(s => ({ ...s, status: 'pending' })),
      compliance_draft: complianceDraft,
      strategy_adjustments: adjustments,
      recommended_training: recommendedTraining,
      status: 'new'
    };
  });
  
  // Process assessment risks
  const assessmentAlertPromises = assessmentRisks.map(async ({ risk, assessment }) => {
    const [mitigation, complianceDraft] = await Promise.all([
      generateMitigationPlan(risk, { assessment }),
      generateComplianceDraft(risk, { assessment })
    ]);
    
    // Generate training recommendations
    const trainingContext = { assessment, mitigationSteps: mitigation.mitigation_steps };
    const recommendedTraining = await generateRiskTrainingRecommendations(risk, trainingContext);
    
    return {
      source_type: 'assessment',
      source_id: assessment.id,
      source_name: assessment.organization_name,
      risk_category: risk.category,
      severity: risk.severity,
      risk_score: risk.severity === 'critical' ? 90 : risk.severity === 'high' ? 70 : 50,
      trigger_reason: risk.trigger,
      risk_description: risk.details,
      potential_impact: mitigation.potential_impact,
      mitigation_steps: mitigation.mitigation_steps?.map(s => ({ ...s, status: 'pending' })),
      compliance_draft: complianceDraft,
      strategy_adjustments: [],
      recommended_training: recommendedTraining,
      status: 'new'
    };
  });
  
  // Wait for all alerts to be generated
  const strategyAlerts = await Promise.all(strategyAlertPromises);
  const assessmentAlerts = await Promise.all(assessmentAlertPromises);
  
  return [...strategyAlerts, ...assessmentAlerts];
}