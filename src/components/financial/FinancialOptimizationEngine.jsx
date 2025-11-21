import { base44 } from '@/api/base44Client';

/**
 * Forecast long-term costs with AI
 */
export async function forecastLongTermCosts(strategy, assessment, currentSpending) {
  const prompt = `Forecast long-term costs for ${strategy.organization_name}'s AI adoption over the next 3-5 years.

**Current Context:**
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}
- Current Monthly Spend: $${currentSpending?.monthly || 0}
- Current Annual Spend: $${currentSpending?.annual || 0}

**Adoption Plan:**
${strategy.roadmap?.phases?.map(p => `${p.phase_name} (${p.duration})`).join(', ')}

**Growth Assumptions:**
- User adoption rate: 15-25% per year
- Platform pricing trends: Based on current market
- Infrastructure scaling needs
- Training and support requirements

Provide detailed year-by-year cost forecasts with breakdown by category, projected ROI, and cost trajectory analysis.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          projected_costs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                year: { type: "number" },
                total_cost: { type: "number" },
                breakdown: {
                  type: "object",
                  properties: {
                    platform_licenses: { type: "number" },
                    infrastructure: { type: "number" },
                    training: { type: "number" },
                    support: { type: "number" },
                    maintenance: { type: "number" }
                  }
                },
                user_count: { type: "number" },
                cost_per_user: { type: "number" }
              }
            }
          },
          roi_projection: {
            type: "object",
            properties: {
              year_1: { type: "number" },
              year_3: { type: "number" },
              year_5: { type: "number" }
            }
          },
          payback_period: { type: "string" },
          cost_trajectory: { type: "string", enum: ["decreasing", "stable", "increasing"] },
          key_drivers: { type: "array", items: { type: "string" } },
          assumptions: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to forecast costs:', error);
    throw error;
  }
}

/**
 * Identify cost-saving opportunities
 */
export async function identifyCostSavings(strategy, assessment, forecast) {
  const prompt = `Identify concrete cost-saving opportunities for ${strategy.organization_name}'s AI adoption strategy.

**Current Strategy:**
- Platform: ${strategy.platform}
- Total Phases: ${strategy.roadmap?.phases?.length}
- Projected 3-Year Cost: $${forecast?.projected_costs?.reduce((sum, y) => sum + y.total_cost, 0).toLocaleString()}

**Analysis Areas:**
1. Platform licensing optimization (volume discounts, commitment terms)
2. Training efficiency improvements
3. Infrastructure consolidation
4. Vendor negotiation opportunities
5. Implementation timeline optimization
6. Resource allocation improvements

For each opportunity, provide:
- Specific description of the cost-saving measure
- Estimated annual savings
- Implementation effort and timeline
- Risk assessment
- Dependencies and prerequisites`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                opportunity: { type: "string" },
                estimated_savings: { type: "number" },
                savings_type: { type: "string", enum: ["one_time", "recurring_annual", "recurring_monthly"] },
                implementation_effort: { type: "string", enum: ["low", "medium", "high"] },
                timeline_to_realize: { type: "string" },
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
                requirements: { type: "array", items: { type: "string" } },
                potential_tradeoffs: { type: "string" }
              }
            }
          },
          total_potential_savings: { type: "number" },
          quick_wins: { type: "array", items: { type: "string" } },
          long_term_optimizations: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to identify cost savings:', error);
    throw error;
  }
}

/**
 * Simulate budget scenario and analyze impact
 */
export async function simulateBudgetScenario(strategy, assessment, scenarioConfig) {
  const prompt = `Simulate the impact of a ${scenarioConfig.scenario_type} budget scenario on ${strategy.organization_name}'s AI adoption.

**Scenario Configuration:**
- Total Budget: $${scenarioConfig.total_budget?.toLocaleString()}
- Budget Period: ${scenarioConfig.budget_period}
- Allocation Changes: ${JSON.stringify(scenarioConfig.allocations)}

**Original Strategy:**
- Phases: ${strategy.roadmap?.phases?.length}
- Estimated Duration: Sum of all phase durations
- Key Milestones: ${strategy.milestones?.length}

**Analysis Required:**
1. How does this budget constraint affect the implementation timeline?
2. Which phases or activities would need to be adjusted?
3. What is the impact on projected ROI?
4. Are there critical risks introduced by this budget scenario?
5. What alternative approaches could maintain value delivery?

Provide detailed analysis of timeline impact, ROI changes, and recommendations.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          feasibility: { type: "string", enum: ["fully_feasible", "feasible_with_adjustments", "challenging", "not_recommended"] },
          timeline_impact: {
            type: "object",
            properties: {
              original_duration: { type: "string" },
              adjusted_duration: { type: "string" },
              delay_months: { type: "number" },
              affected_phases: { type: "array", items: { type: "string" } }
            }
          },
          roi_impact: {
            type: "object",
            properties: {
              original_roi: { type: "number" },
              adjusted_roi: { type: "number" },
              roi_change_percent: { type: "number" }
            }
          },
          required_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                adjustment: { type: "string" },
                impact: { type: "string" }
              }
            }
          },
          risks_introduced: { type: "array", items: { type: "string" } },
          alternative_approaches: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    return {
      ...scenarioConfig,
      ai_forecast: response,
      timeline_impact: response.timeline_impact,
      scenario_analysis: response
    };
  } catch (error) {
    console.error('Failed to simulate budget scenario:', error);
    throw error;
  }
}