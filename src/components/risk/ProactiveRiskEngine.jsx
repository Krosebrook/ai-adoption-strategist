import { base44 } from '@/api/base44Client';

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
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `You are an expert risk mitigation strategist. Generate a detailed mitigation plan.

RISK DETAILS:
- Category: ${risk.category}
- Severity: ${risk.severity}
- Trigger: ${risk.trigger}
- Details: ${risk.details}

CONTEXT:
${JSON.stringify(context, null, 2)}

Provide actionable mitigation steps with clear ownership and timelines.`,
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
              timeline: { type: 'string' },
              success_criteria: { type: 'string' }
            }
          }
        },
        escalation_triggers: { type: 'array', items: { type: 'string' } }
      }
    }
  });
  
  return response;
}

export async function generateComplianceDraft(risk, context) {
  if (risk.category !== 'compliance') return null;
  
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the Compliance Analyst AI. Generate a compliance documentation draft.

RISK DETAILS:
- Description: ${risk.details}
- Severity: ${risk.severity}

CONTEXT:
${JSON.stringify(context, null, 2)}

Generate appropriate compliance documentation to address this risk.`,
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
        responsible_parties: { type: 'array', items: { type: 'string' } },
        verification_steps: { type: 'array', items: { type: 'string' } }
      }
    }
  });
  
  return {
    document_type: response.document_type,
    title: response.title,
    content: `# ${response.title}\n\n## Executive Summary\n${response.executive_summary}\n\n## Compliance Requirements\n${response.compliance_requirements?.map(r => `- ${r}`).join('\n')}\n\n## Current Gaps\n${response.current_gaps?.map(g => `- ${g}`).join('\n')}\n\n## Remediation Plan\n${response.remediation_plan}\n\n## Timeline\n${response.timeline}\n\n## Verification Steps\n${response.verification_steps?.map(s => `- ${s}`).join('\n')}`,
    generated_at: new Date().toISOString()
  };
}

export async function generateStrategyAdjustments(risk, strategy) {
  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `You are the Strategy Advisor AI. Propose strategy adjustments based on identified risks.

RISK DETAILS:
- Category: ${risk.category}
- Severity: ${risk.severity}
- Details: ${risk.details}

CURRENT STRATEGY:
- Organization: ${strategy.organization_name}
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Progress: ${strategy.progress_tracking?.overall_progress}%

Propose concrete strategy adjustments to mitigate this risk.`,
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
              priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
              effort: { type: 'string' }
            }
          }
        },
        timeline_impact: { type: 'string' },
        resource_implications: { type: 'string' }
      }
    }
  });
  
  return response.adjustments || [];
}

export async function runProactiveRiskScan(strategies, assessments) {
  const alerts = [];
  
  // Scan strategies
  for (const strategy of strategies) {
    const assessment = assessments.find(a => a.id === strategy.assessment_id);
    const risks = await analyzeStrategyRisks(strategy, assessment);
    
    for (const risk of risks) {
      const context = { strategy, assessment };
      
      // Generate mitigation plan
      const mitigation = await generateMitigationPlan(risk, context);
      
      // Generate compliance draft if needed
      const complianceDraft = await generateComplianceDraft(risk, context);
      
      // Generate strategy adjustments
      const adjustments = await generateStrategyAdjustments(risk, strategy);
      
      alerts.push({
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
        status: 'new'
      });
    }
  }
  
  // Scan assessments without strategies
  for (const assessment of assessments) {
    const hasStrategy = strategies.some(s => s.assessment_id === assessment.id);
    if (hasStrategy) continue;
    
    const risks = await analyzeAssessmentRisks(assessment);
    
    for (const risk of risks) {
      const mitigation = await generateMitigationPlan(risk, { assessment });
      const complianceDraft = await generateComplianceDraft(risk, { assessment });
      
      alerts.push({
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
        status: 'new'
      });
    }
  }
  
  return alerts;
}