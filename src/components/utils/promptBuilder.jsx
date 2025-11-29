/**
 * Centralized Prompt Builder
 * Axis: Performance & AI Cost-Efficiency
 * 
 * Provides:
 * - Compressed prompt templates
 * - Context extraction utilities
 * - Output length controls via schema constraints
 */

import { 
  extractStrategyEssentials, 
  extractAssessmentEssentials,
  truncateToTokenBudget,
  getCached,
  setCache,
  generateCacheKey
} from './aiOptimization';

/**
 * Build compressed context string from strategy and assessment
 */
export function buildCompressedContext(strategy, assessment, sharedContext) {
  const parts = [];
  
  if (assessment) {
    const a = extractAssessmentEssentials(assessment);
    parts.push(`Assessment: ${a.org} | Platform: ${a.topPlatform} | Maturity: ${a.maturity} | Risk: ${a.riskScore}`);
  }
  
  if (strategy) {
    const s = extractStrategyEssentials(strategy);
    parts.push(`Strategy: ${s.org} | Phase: ${s.phase} | Progress: ${s.progress}% | Risks: ${s.activeRisks?.length || 0}`);
  }
  
  if (sharedContext?.content) {
    parts.push(`Shared: ${sharedContext.content.substring(0, 100)}`);
  }
  
  return parts.join('\n');
}

/**
 * Agent collaboration prompt - compressed
 */
export function buildAgentPrompt(agent, task, context) {
  return truncateToTokenBudget(`${agent.name}: ${agent.description}
Task: ${task}
Context: ${buildCompressedContext(context.strategy, context.assessment, context.sharedContext)}
Provide analysis with 3-5 key findings and recommendations.`, 1500);
}

/**
 * Synthesis prompt for multi-agent results
 */
export function buildSynthesisPrompt(task, agentResults) {
  const summaries = agentResults.map(r => 
    `${r.agent.name}: ${r.response.analysis?.substring(0, 150) || ''} | Findings: ${r.response.key_findings?.slice(0, 2).join('; ')}`
  ).join('\n');
  
  return truncateToTokenBudget(`Synthesize multi-agent analysis.
Task: ${task}
Agent Summaries:
${summaries}
Provide unified recommendations and priority actions.`, 1200);
}

/**
 * Predictive analytics prompt - compressed
 */
export function buildPredictivePrompt(scenarios, strategy, assessment, timeHorizon) {
  const scenarioSummary = scenarios.slice(0, 5).map((s, i) => 
    `${i + 1}. ${s.name || s.type}: ${JSON.stringify(s.parameters || s.config || {}).substring(0, 100)}`
  ).join('\n');
  
  const ctx = buildCompressedContext(strategy, assessment, null);
  
  return truncateToTokenBudget(`Predictive analysis for ${timeHorizon} months.
Scenarios:
${scenarioSummary}
${ctx}
Provide ROI, adoption, risk forecasts with monthly projections.`, 1000);
}

/**
 * Training path prompt - compressed
 */
export function buildTrainingPrompt(userRole, completedModules, assessmentInsights) {
  let prompt = `Training path for ${userRole} role. Completed: ${completedModules} modules.`;
  
  if (assessmentInsights) {
    prompt += ` Maturity: ${assessmentInsights.maturityLevel}. Gaps: ${assessmentInsights.improvementAreas?.slice(0, 3).map(a => a.area).join(', ') || 'none'}.`;
  }
  
  prompt += ' Create skill gap analysis, 5-7 modules, and 3 milestones.';
  
  return prompt;
}

/**
 * Constrained JSON schemas with max items
 */
export const SCHEMAS = {
  agentResponse: {
    type: 'object',
    properties: {
      analysis: { type: 'string', maxLength: 500 },
      key_findings: { type: 'array', items: { type: 'string' }, maxItems: 5 },
      recommendations: { type: 'array', items: { type: 'string' }, maxItems: 5 }
    }
  },
  
  synthesis: {
    type: 'object',
    properties: {
      executive_summary: { type: 'string', maxLength: 300 },
      priority_actions: { 
        type: 'array', 
        maxItems: 5,
        items: { 
          type: 'object', 
          properties: { 
            action: { type: 'string' }, 
            priority: { type: 'string' }, 
            owner: { type: 'string' } 
          } 
        } 
      },
      consensus_areas: { type: 'array', items: { type: 'string' }, maxItems: 3 }
    }
  },
  
  predictive: {
    type: 'object',
    properties: {
      roi_forecast: {
        type: 'object',
        properties: {
          monthly_projections: { 
            type: 'array', 
            maxItems: 12,
            items: { type: 'object', properties: { month: { type: 'number' }, roi_percent: { type: 'number' } } }
          },
          total_roi: { type: 'number' },
          breakeven_month: { type: 'number' }
        }
      },
      adoption_forecast: {
        type: 'object',
        properties: {
          peak_adoption: { type: 'number' },
          time_to_80_percent: { type: 'number' }
        }
      },
      risk_forecast: {
        type: 'object',
        properties: {
          risk_reduction_percent: { type: 'number' }
        }
      },
      strategic_adjustments: { 
        type: 'array', 
        maxItems: 4,
        items: { type: 'object', properties: { timing: { type: 'string' }, adjustment: { type: 'string' }, confidence: { type: 'string' } } }
      }
    }
  },
  
  trainingPath: {
    type: 'object',
    properties: {
      skill_gap_analysis: {
        type: 'object',
        properties: {
          current_level: { type: 'string' },
          target_level: { type: 'string' },
          key_gaps: { type: 'array', items: { type: 'string' }, maxItems: 4 },
          strengths_to_leverage: { type: 'array', items: { type: 'string' }, maxItems: 3 }
        }
      },
      recommended_path: {
        type: 'array',
        maxItems: 7,
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string', maxLength: 100 },
            difficulty: { type: 'string' },
            estimated_duration: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      },
      milestones: { type: 'array', maxItems: 3, items: { type: 'object', properties: { name: { type: 'string' }, badge: { type: 'string' }, unlock_criteria: { type: 'string' } } } },
      estimated_completion: { type: 'string' }
    }
  }
};