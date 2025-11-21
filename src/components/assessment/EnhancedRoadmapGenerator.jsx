import { base44 } from '@/api/base44Client';

/**
 * Generate enhanced implementation roadmap with market trends and compliance considerations
 */
export async function generateEnhancedRoadmap(platform, assessment, marketTrends = null) {
  const platformName = platform.platform_name;
  const totalUsers = assessment.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0;
  
  // Extract industry from organization name or compliance requirements
  const industry = extractIndustry(assessment);
  const complianceRequirements = assessment.compliance_requirements || [];

  const prompt = `As an enterprise AI implementation consultant, create an optimized deployment roadmap for ${platformName} with the following context:

**Organization Profile:**
- Total Users: ${totalUsers}
- Departments: ${assessment.departments?.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
- Industry: ${industry}
- Maturity Level: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}

**Compliance Requirements (CRITICAL):**
${complianceRequirements.length > 0 ? complianceRequirements.map(req => `- ${req}: Must be addressed before full deployment`).join('\n') : '- No specific compliance requirements'}

**Pain Points to Address:**
${assessment.pain_points?.join('\n- ') || 'Not specified'}

${marketTrends ? `
**Real-Time Market Intelligence:**

Recent Platform Updates:
${marketTrends.model_releases?.filter(r => r.platform.toLowerCase().includes(platformName.toLowerCase().split(' ')[0]))
  .map(r => `- ${r.release} (${r.date}): ${r.key_features?.join(', ')}`).join('\n') || 'No recent updates'}

Regulatory Landscape:
${marketTrends.regulatory_updates?.map(reg => 
  `- ${reg.regulation} (${reg.region}): ${reg.impact_on_enterprises}`
).join('\n') || 'No major regulatory changes'}

Industry Adoption Trends:
- ${marketTrends.adoption_trends?.enterprise_adoption || 'Growing steadily'}
- Key Use Cases: ${marketTrends.adoption_trends?.trending_use_cases?.slice(0, 3).join(', ') || 'Various'}

Pricing Considerations:
${marketTrends.pricing_trends?.find(p => p.platform.toLowerCase().includes(platformName.toLowerCase()))?.details || 'Stable pricing'}
` : ''}

**TASK:**
Create a dynamically optimized implementation roadmap that:

1. **Timeline Optimization**: Adjust phase durations based on:
   - Organization maturity level
   - Compliance requirements (add buffer time if high compliance)
   - Team size and resource availability
   - Market trends (accelerate if platform is rapidly evolving)

2. **Bottleneck Identification**: Identify potential blockers:
   - Compliance certification delays
   - Integration complexity with existing systems
   - Training capacity constraints
   - Change management resistance points
   - Technical infrastructure gaps

3. **Resource Allocation**: Specify:
   - Team composition (FTEs needed per phase)
   - Budget allocation across phases
   - External consultant needs
   - Training resource requirements
   - Infrastructure/tooling costs

4. **Compliance Integration**: For each compliance requirement, specify:
   - Which phase it must be addressed in
   - Required actions and documentation
   - Estimated time impact
   - Risk mitigation strategies

5. **Market-Driven Adjustments**: Based on market trends:
   - Prioritize features that leverage recent platform updates
   - Account for upcoming regulatory changes
   - Align with trending use cases in the industry
   - Adjust budget for any pricing changes

Return a comprehensive, actionable roadmap with realistic timelines and clear resource requirements.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          optimized_timeline: {
            type: "object",
            properties: {
              total_duration_weeks: { type: "number" },
              confidence_level: { type: "string", enum: ["high", "medium", "low"] },
              adjustment_factors: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase_name: { type: "string" },
                duration_weeks: { type: "number" },
                start_week: { type: "number" },
                objectives: { type: "array", items: { type: "string" } },
                activities: { type: "array", items: { type: "string" } },
                compliance_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      requirement: { type: "string" },
                      action: { type: "string" },
                      time_buffer_weeks: { type: "number" }
                    }
                  }
                },
                resource_requirements: {
                  type: "object",
                  properties: {
                    team_size: { type: "string" },
                    estimated_budget: { type: "string" },
                    key_roles: { type: "array", items: { type: "string" } },
                    external_support: { type: "string" }
                  }
                },
                success_metrics: { type: "array", items: { type: "string" } },
                potential_bottlenecks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      bottleneck: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      mitigation: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          pilot_program: {
            type: "object",
            properties: {
              recommended_size: { type: "string" },
              ideal_departments: { type: "array", items: { type: "string" } },
              duration_weeks: { type: "number" },
              resource_allocation: {
                type: "object",
                properties: {
                  team_size: { type: "string" },
                  budget_estimate: { type: "string" },
                  infrastructure_needs: { type: "array", items: { type: "string" } }
                }
              },
              key_activities: { type: "array", items: { type: "string" } },
              success_criteria: { type: "array", items: { type: "string" } }
            }
          },
          training_modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_name: { type: "string" },
                target_audience: { type: "string" },
                duration_hours: { type: "number" },
                delivery_method: { type: "string" },
                topics: { type: "array", items: { type: "string" } },
                resources_needed: { type: "string" }
              }
            }
          },
          change_management: {
            type: "object",
            properties: {
              key_stakeholders: { type: "array", items: { type: "string" } },
              communication_plan: { type: "array", items: { type: "string" } },
              resistance_mitigation: { type: "array", items: { type: "string" } },
              executive_sponsorship: { type: "string" }
            }
          },
          compliance_roadmap: {
            type: "object",
            properties: {
              critical_milestones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    requirement: { type: "string" },
                    target_week: { type: "number" },
                    actions_required: { type: "array", items: { type: "string" } },
                    risk_level: { type: "string" }
                  }
                }
              },
              certification_timeline: { type: "string" }
            }
          },
          market_driven_priorities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string" },
                rationale: { type: "string" },
                target_phase: { type: "string" }
              }
            }
          },
          risk_assessment: {
            type: "object",
            properties: {
              overall_risk_level: { type: "string", enum: ["low", "medium", "high"] },
              key_risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    risk: { type: "string" },
                    probability: { type: "string" },
                    impact: { type: "string" },
                    mitigation_strategy: { type: "string" }
                  }
                }
              }
            }
          },
          success_metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric_name: { type: "string" },
                target_value: { type: "string" },
                measurement_method: { type: "string" },
                review_frequency: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate enhanced roadmap:', error);
    throw error;
  }
}

/**
 * Extract industry from assessment data
 */
function extractIndustry(assessment) {
  // Try to infer from compliance requirements
  const compliance = assessment.compliance_requirements || [];
  
  if (compliance.some(c => c.toLowerCase().includes('hipaa') || c.toLowerCase().includes('health'))) {
    return 'Healthcare';
  }
  if (compliance.some(c => c.toLowerCase().includes('pci') || c.toLowerCase().includes('financial'))) {
    return 'Financial Services';
  }
  if (compliance.some(c => c.toLowerCase().includes('ferpa') || c.toLowerCase().includes('education'))) {
    return 'Education';
  }
  if (compliance.some(c => c.toLowerCase().includes('gdpr'))) {
    return 'EU-based or Data-intensive';
  }
  
  return 'General Enterprise';
}