import { base44 } from '@/api/base44Client';

/**
 * Generate AI-powered cost optimization strategies
 */
export async function generateCostOptimization(assessment, selectedPlatforms, costEstimates) {
  const totalUsers = assessment.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0;
  
  const prompt = `As an enterprise software cost optimization consultant, analyze this AI platform deployment and provide actionable cost reduction strategies:

**Organization Profile:**
- Total Users: ${totalUsers}
- Departments: ${assessment.departments?.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
- Budget: ${assessment.budget_constraints?.min_budget ? `$${assessment.budget_constraints.min_budget} - $${assessment.budget_constraints.max_budget}` : 'Not specified'}

**Selected Platforms & Estimated Costs:**
${selectedPlatforms.map(platform => {
  const estimate = costEstimates[platform];
  return `
${platform}:
- Total Annual Cost: $${estimate?.totalAnnualCost?.toLocaleString() || 'N/A'}
- Per User Cost: $${estimate?.perUserCost?.toFixed(2) || 'N/A'}
- License Type: ${estimate?.licensingModel || 'Standard'}`;
}).join('\n')}

**Current Pain Points:**
${assessment.pain_points?.join('\n- ') || 'Not specified'}

**Required Integrations:**
${assessment.desired_integrations?.join(', ') || 'None'}

**TASK:**
Provide specific, actionable cost optimization strategies including:

1. **Licensing Optimization**: Identify opportunities to reduce licensing costs through:
   - Right-sizing user tiers (power users vs basic users)
   - Volume discounts or enterprise agreements
   - Alternative licensing models (concurrent vs named users)
   
2. **Feature Optimization**: Find underutilized or redundant features:
   - Features that may not be needed for stated pain points
   - Overlapping capabilities across selected platforms
   - Premium features that could be replaced by standard alternatives

3. **Deployment Optimization**: Suggest cost-effective deployment strategies:
   - Phased rollout to spread costs
   - Pilot program sizing for cost validation
   - Infrastructure optimization (cloud vs on-premise considerations)

4. **Vendor Negotiation Tips**: Provide specific negotiation angles:
   - Multi-year commitment discounts
   - Bundling opportunities
   - Seasonal or promotional timing

5. **Alternative Options**: Recommend alternative approaches:
   - Open-source or lower-cost alternatives for specific use cases
   - Build vs buy analysis for custom requirements
   - Hybrid approaches mixing platforms strategically

Return detailed, quantified recommendations where possible.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          total_savings_potential: {
            type: "object",
            properties: {
              estimated_annual_savings: { type: "number" },
              percentage_reduction: { type: "number" },
              confidence_level: { type: "string", enum: ["high", "medium", "low"] }
            }
          },
          licensing_optimizations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                strategy: { type: "string" },
                current_cost: { type: "number" },
                optimized_cost: { type: "number" },
                savings: { type: "number" },
                implementation_effort: { type: "string", enum: ["low", "medium", "high"] },
                details: { type: "string" }
              }
            }
          },
          feature_optimizations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feature_category: { type: "string" },
                recommendation: { type: "string" },
                potential_savings: { type: "number" },
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
                alternative_approach: { type: "string" }
              }
            }
          },
          deployment_strategies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                description: { type: "string" },
                cost_impact: { type: "string" },
                timeline: { type: "string" },
                suitability_score: { type: "number" }
              }
            }
          },
          negotiation_tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                tactic: { type: "string" },
                expected_discount: { type: "string" },
                best_timing: { type: "string" }
              }
            }
          },
          alternative_solutions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                use_case: { type: "string" },
                alternative: { type: "string" },
                cost_comparison: { type: "string" },
                trade_offs: { type: "array", items: { type: "string" } }
              }
            }
          },
          quick_wins: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                savings: { type: "number" },
                effort: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          implementation_priority: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate cost optimization:', error);
    throw error;
  }
}