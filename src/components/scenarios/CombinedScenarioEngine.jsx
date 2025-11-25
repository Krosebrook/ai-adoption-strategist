import { base44 } from '@/api/base44Client';

/**
 * Analyze combined impact of multiple scenarios
 */
export async function analyzeCombinedScenarios(strategy, assessment, scenarios) {
  const scenarioDescriptions = scenarios.map((s, idx) => 
    `${idx + 1}. ${s.type}: ${s.name} - ${s.description}`
  ).join('\n');

  const prompt = `Analyze the combined impact of multiple scenarios on ${strategy.organization_name}'s AI adoption strategy.

**Current Strategy:**
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Progress: ${strategy.progress_tracking?.overall_progress || 0}%
- Risk Score: ${strategy.risk_analysis?.risk_score || 'Unknown'}

**Selected Scenarios to Combine:**
${scenarioDescriptions}

**Individual Scenario Details:**
${scenarios.map(s => `
### ${s.name} (${s.type})
- Impact Level: ${s.impact_level || 'Medium'}
- Timeframe: ${s.timeframe || '6-12 months'}
- Key Changes: ${s.key_changes?.join(', ') || 'Various'}
`).join('\n')}

Analyze:
1. Cumulative impact on strategy timeline
2. Combined financial implications
3. Compound risk factors
4. Synergies between scenarios (positive interactions)
5. Conflicts between scenarios (negative interactions)
6. Unified response plan addressing all scenarios
7. Priority actions in order of urgency
8. Resource reallocation recommendations`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          analysis_summary: { type: "string" },
          cumulative_impact: {
            type: "object",
            properties: {
              timeline_change: { type: "string" },
              timeline_months_delta: { type: "number" },
              overall_severity: { type: "string", enum: ["low", "moderate", "significant", "critical"] },
              confidence_level: { type: "string" }
            }
          },
          financial_implications: {
            type: "object",
            properties: {
              budget_impact_percent: { type: "number" },
              additional_costs: { type: "number" },
              potential_savings: { type: "number" },
              roi_adjustment: { type: "number" },
              cash_flow_impact: { type: "string" }
            }
          },
          compound_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk: { type: "string" },
                contributing_scenarios: { type: "array", items: { type: "string" } },
                severity: { type: "string" },
                likelihood: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          scenario_synergies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenarios_involved: { type: "array", items: { type: "string" } },
                synergy: { type: "string" },
                benefit: { type: "string" }
              }
            }
          },
          scenario_conflicts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenarios_involved: { type: "array", items: { type: "string" } },
                conflict: { type: "string" },
                resolution: { type: "string" }
              }
            }
          },
          unified_response_plan: {
            type: "object",
            properties: {
              strategy_adjustments: { type: "array", items: { type: "string" } },
              immediate_actions: { type: "array", items: { type: "string" } },
              medium_term_actions: { type: "array", items: { type: "string" } },
              contingency_measures: { type: "array", items: { type: "string" } }
            }
          },
          priority_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                urgency: { type: "string" },
                owner: { type: "string" },
                deadline: { type: "string" },
                addresses_scenarios: { type: "array", items: { type: "string" } }
              }
            }
          },
          resource_reallocation: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from: { type: "string" },
                to: { type: "string" },
                reason: { type: "string" },
                amount_percent: { type: "number" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze combined scenarios:', error);
    throw error;
  }
}

/**
 * Predefined scenario templates
 */
export const scenarioTemplates = {
  market_trends: [
    { id: 'ai_breakthrough', name: 'Major AI Breakthrough', type: 'market_trend', description: 'Significant advancement in AI capabilities', impact_level: 'High', timeframe: '3-6 months' },
    { id: 'competitor_adoption', name: 'Competitor AI Adoption', type: 'market_trend', description: 'Key competitors accelerate AI adoption', impact_level: 'High', timeframe: '6-12 months' },
    { id: 'talent_shortage', name: 'AI Talent Shortage', type: 'market_trend', description: 'Increased competition for AI talent', impact_level: 'Medium', timeframe: '12+ months' },
    { id: 'economic_downturn', name: 'Economic Downturn', type: 'market_trend', description: 'Economic recession affecting budgets', impact_level: 'High', timeframe: '6-12 months' }
  ],
  regulatory: [
    { id: 'gdpr_update', name: 'GDPR AI Amendment', type: 'regulatory', description: 'New GDPR requirements for AI systems', impact_level: 'High', timeframe: '6-12 months' },
    { id: 'ai_act', name: 'EU AI Act Implementation', type: 'regulatory', description: 'EU AI Act comes into full effect', impact_level: 'Critical', timeframe: '12+ months' },
    { id: 'sector_regulation', name: 'Industry-Specific AI Rules', type: 'regulatory', description: 'New sector-specific AI regulations', impact_level: 'Medium', timeframe: '6-12 months' },
    { id: 'data_localization', name: 'Data Localization Requirements', type: 'regulatory', description: 'New data residency requirements', impact_level: 'Medium', timeframe: '3-6 months' }
  ],
  technology: [
    { id: 'platform_update', name: 'Major Platform Update', type: 'technology', description: 'Significant update to chosen AI platform', impact_level: 'Medium', timeframe: '3-6 months' },
    { id: 'integration_changes', name: 'API/Integration Changes', type: 'technology', description: 'Changes to critical integrations', impact_level: 'Medium', timeframe: '3-6 months' },
    { id: 'security_vulnerability', name: 'Security Vulnerability', type: 'technology', description: 'Major security issue discovered', impact_level: 'Critical', timeframe: 'Immediate' },
    { id: 'new_competitor', name: 'New Platform Competitor', type: 'technology', description: 'Disruptive new AI platform enters market', impact_level: 'Medium', timeframe: '6-12 months' }
  ],
  organizational: [
    { id: 'leadership_change', name: 'Leadership Change', type: 'organizational', description: 'Change in executive leadership', impact_level: 'High', timeframe: '3-6 months' },
    { id: 'merger', name: 'Merger/Acquisition', type: 'organizational', description: 'Company merger or acquisition', impact_level: 'Critical', timeframe: '6-12 months' },
    { id: 'restructuring', name: 'Organizational Restructuring', type: 'organizational', description: 'Major organizational changes', impact_level: 'High', timeframe: '3-6 months' },
    { id: 'budget_cut', name: 'Budget Reduction', type: 'organizational', description: '20%+ reduction in AI budget', impact_level: 'High', timeframe: 'Immediate' }
  ]
};