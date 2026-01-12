import { base44 } from '@/api/base44Client';

/**
 * Multi-Stakeholder Risk Analysis Engine
 * Evaluates AI adoption from 9 different stakeholder perspectives
 */

const STAKEHOLDER_ROLES = [
  'startup_founder',
  'engineering_manager',
  'frontend_developer',
  'backend_developer',
  'ux_designer',
  'documentation_specialist',
  'security_engineer',
  'qa_specialist',
  'observability_lead'
];

const STAKEHOLDER_PRIORITIES = {
  startup_founder: {
    name: 'Startup Founder',
    priorities: ['speed_to_market', 'user_adoption', 'viral_growth', 'perceived_intelligence'],
    concerns: ['tech_debt_acceptable', 'tolerates_hallucinations', 'invisible_errors'],
    decision_weight: 'high'
  },
  engineering_manager: {
    name: 'Engineering Manager',
    priorities: ['maintainability', 'day_2_operations', 'explainability', 'manual_recovery'],
    concerns: ['tech_debt_prevention', 'audit_trails', 'rollback_capabilities'],
    decision_weight: 'high'
  },
  frontend_developer: {
    name: 'Frontend Developer',
    priorities: ['design_system_awareness', 'hot_module_replacement', 'visual_regression', 'instant_feedback'],
    concerns: ['component_library_integration', 'state_management', 'time_travel_debugging'],
    decision_weight: 'medium'
  },
  backend_developer: {
    name: 'Backend Developer',
    priorities: ['api_schema_awareness', 'infrastructure_as_code', 'load_testing', 'stack_traces'],
    concerns: ['database_migrations', 'unoptimized_queries', 'git_workflow'],
    decision_weight: 'medium'
  },
  ux_designer: {
    name: 'UX Designer',
    priorities: ['confidence_scores', 'progressive_disclosure', 'human_checkpoints', 'conversational_errors'],
    concerns: ['overwhelming_ui', 'social_signals', 'clarity_over_magic'],
    decision_weight: 'medium'
  },
  documentation_specialist: {
    name: 'Documentation Specialist',
    priorities: ['citations', 'auto_readme', 'tutorial_mode', 'error_to_doc_mapping'],
    concerns: ['undocumented_templates', 'missing_context', 'troubleshooting_guides'],
    decision_weight: 'low'
  },
  security_engineer: {
    name: 'Security Engineer',
    priorities: ['pii_scanning', 'security_defaults', 'sast_integration', 'least_privilege'],
    concerns: ['api_key_leaks', 'cors_wildcards', 'sql_injection', 'xss_vulnerabilities'],
    decision_weight: 'critical'
  },
  qa_specialist: {
    name: 'QA Specialist',
    priorities: ['real_testing', 'accessibility', 'edge_cases', 'regression_prevention'],
    concerns: ['smoke_tests_insufficient', 'ai_generated_bugs', 'data_mocking_masks_issues'],
    decision_weight: 'medium'
  },
  observability_lead: {
    name: 'Observability Lead',
    priorities: ['detailed_logs', 'performance_metrics', 'error_tracking', 'trace_context'],
    concerns: ['invisible_recovery', 'missing_telemetry', 'verbose_overhead'],
    decision_weight: 'medium'
  }
};

export async function analyzeStakeholderPerspectives(assessment, strategy = null) {
  const prompt = `You are analyzing an AI adoption strategy from multiple stakeholder perspectives.

ASSESSMENT:
- Organization: ${assessment.organization_name}
- Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
- Maturity: ${assessment.ai_assessment_score?.maturity_level}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Compliance: ${assessment.compliance_requirements?.join(', ')}

${strategy ? `CURRENT STRATEGY:
- Status: ${strategy.status}
- Progress: ${strategy.progress_tracking?.overall_progress}%
- Phases: ${strategy.roadmap?.phases?.length}
- Risks: ${strategy.risk_analysis?.identified_risks?.length}` : ''}

Analyze this from 9 stakeholder perspectives and identify:
1. What each stakeholder cares about most
2. Their specific concerns for this project
3. Potential conflicts between stakeholders
4. Alignment opportunities

Consider these stakeholder archetypes:
- Startup Founder: Speed-to-market, viral growth, perceived intelligence
- Engineering Manager: Maintainability, explainability, audit trails
- Frontend Developer: Design system awareness, HMR, visual regression
- Backend Developer: API schema awareness, IaC, load testing
- UX Designer: Confidence scores, progressive disclosure, conversational UX
- Documentation Specialist: Citations, auto-README, tutorial mode
- Security Engineer: PII scanning, security defaults, SAST
- QA Specialist: Real testing, accessibility, edge cases
- Observability Lead: Detailed logs, performance metrics, error tracking`;

  const schema = {
    type: 'object',
    properties: {
      stakeholder_analyses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            role_name: { type: 'string' },
            satisfaction_score: { type: 'number', description: '0-100' },
            key_concerns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  concern: { type: 'string' },
                  severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  impact: { type: 'string' }
                }
              }
            },
            must_haves: { type: 'array', items: { type: 'string' } },
            nice_to_haves: { type: 'array', items: { type: 'string' } },
            deal_breakers: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      conflicts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            conflict_id: { type: 'string' },
            stakeholder_a: { type: 'string' },
            stakeholder_b: { type: 'string' },
            issue: { type: 'string' },
            impact: { type: 'string', enum: ['blocking', 'significant', 'moderate', 'minor'] },
            resolution_strategies: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      alignment_opportunities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stakeholders: { type: 'array', items: { type: 'string' } },
            shared_goal: { type: 'string' },
            recommendation: { type: 'string' }
          }
        }
      },
      overall_alignment_score: { type: 'number', description: '0-100' },
      critical_path: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'string' },
            action: { type: 'string' },
            stakeholders_involved: { type: 'array', items: { type: 'string' } },
            rationale: { type: 'string' }
          }
        }
      }
    }
  };

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });
}

export async function generateConflictResolution(conflict, assessment, strategy) {
  const prompt = `Generate detailed conflict resolution recommendations.

CONFLICT:
- Between: ${conflict.stakeholder_a} vs ${conflict.stakeholder_b}
- Issue: ${conflict.issue}
- Impact: ${conflict.impact}

CONTEXT:
- Organization: ${assessment.organization_name}
- Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
- Current Progress: ${strategy?.progress_tracking?.overall_progress || 0}%

Provide:
1. Root cause analysis
2. Compromise solutions that satisfy both parties
3. Phased approach (quick wins vs long-term)
4. Success metrics
5. Communication strategy`;

  const schema = {
    type: 'object',
    properties: {
      root_cause: { type: 'string' },
      compromise_solutions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            solution: { type: 'string' },
            pros_for_a: { type: 'array', items: { type: 'string' } },
            pros_for_b: { type: 'array', items: { type: 'string' } },
            implementation_complexity: { type: 'string' },
            timeline: { type: 'string' }
          }
        }
      },
      phased_approach: {
        type: 'object',
        properties: {
          quick_wins: { type: 'array', items: { type: 'string' } },
          medium_term: { type: 'array', items: { type: 'string' } },
          long_term: { type: 'array', items: { type: 'string' } }
        }
      },
      success_metrics: { type: 'array', items: { type: 'string' } },
      communication_plan: { type: 'string' }
    }
  };

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });
}

export function calculateAlignmentScore(stakeholderAnalyses) {
  if (!stakeholderAnalyses || stakeholderAnalyses.length === 0) return 0;

  const avgSatisfaction = stakeholderAnalyses.reduce((sum, s) => sum + s.satisfaction_score, 0) / stakeholderAnalyses.length;
  
  return Math.round(avgSatisfaction);
}