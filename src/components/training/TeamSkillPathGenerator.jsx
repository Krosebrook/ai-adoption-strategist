import { base44 } from '@/api/base44Client';

/**
 * Generate team skill development paths
 */
export async function generateTeamSkillPaths(assessment, departments, platform) {
  const prompt = `Create comprehensive Team Skill Development Paths for AI readiness based on the assessment.

**Organization:** ${assessment.organization_name}
**Platform:** ${platform}
**Departments:** ${departments.map(d => `${d.name} (${d.user_count} users)`).join(', ')}

**Assessment Context:**
- Business Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Technical Constraints: ${JSON.stringify(assessment.technical_constraints)}

For each department/team, create:
1. Role-specific skill gap analysis
2. Curated learning paths with sequential modules
3. Practical exercises and simulations
4. Milestone checkpoints with measurable outcomes
5. Cross-functional collaboration opportunities
6. Estimated timeline and resource requirements

Design paths that progress from foundational to advanced skills.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          organization_readiness_score: { type: "number" },
          team_paths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                team_name: { type: "string" },
                team_size: { type: "number" },
                current_skill_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                target_skill_level: { type: "string" },
                estimated_duration: { type: "string" },
                skill_gaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skill: { type: "string" },
                      current_level: { type: "number" },
                      target_level: { type: "number" },
                      priority: { type: "string" }
                    }
                  }
                },
                learning_path: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      phase: { type: "string" },
                      duration: { type: "string" },
                      modules: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            type: { type: "string", enum: ["course", "workshop", "simulation", "project", "assessment"] },
                            description: { type: "string" },
                            skills_covered: { type: "array", items: { type: "string" } },
                            estimated_hours: { type: "number" },
                            format: { type: "string" }
                          }
                        }
                      },
                      milestone: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          success_criteria: { type: "array", items: { type: "string" } },
                          assessment_method: { type: "string" }
                        }
                      }
                    }
                  }
                },
                practical_exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      difficulty: { type: "string" },
                      duration: { type: "string" },
                      learning_objectives: { type: "array", items: { type: "string" } },
                      real_world_scenario: { type: "string" }
                    }
                  }
                },
                simulations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      scenario: { type: "string" },
                      skills_tested: { type: "array", items: { type: "string" } },
                      success_metrics: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                collaboration_opportunities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      activity: { type: "string" },
                      teams_involved: { type: "array", items: { type: "string" } },
                      objective: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          cross_team_initiatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                initiative: { type: "string" },
                participating_teams: { type: "array", items: { type: "string" } },
                objective: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          resource_requirements: {
            type: "object",
            properties: {
              total_training_hours: { type: "number" },
              estimated_cost: { type: "string" },
              external_resources: { type: "array", items: { type: "string" } },
              internal_champions_needed: { type: "number" }
            }
          },
          success_metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric: { type: "string" },
                baseline: { type: "string" },
                target: { type: "string" },
                measurement_method: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate team skill paths:', error);
    throw error;
  }
}

/**
 * Generate personalized role-based curriculum
 */
export async function generateRoleCurriculum(role, skillGaps, platform, intensity = 'standard') {
  const prompt = `Create a detailed personalized curriculum for ${role} to achieve AI readiness on ${platform}.

**Skill Gaps:** ${skillGaps.map(g => `${g.skill} (${g.priority} priority)`).join(', ')}
**Learning Intensity:** ${intensity}

Design a curriculum with:
1. Structured weekly learning plan
2. Mix of theory, practice, and application
3. Progress checkpoints every 2 weeks
4. Hands-on projects relevant to the role
5. Certification preparation if applicable`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          role: { type: "string" },
          total_duration: { type: "string" },
          weekly_commitment: { type: "string" },
          curriculum: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "number" },
                theme: { type: "string" },
                learning_objectives: { type: "array", items: { type: "string" } },
                activities: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      title: { type: "string" },
                      duration: { type: "string" },
                      resources: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                deliverables: { type: "array", items: { type: "string" } }
              }
            }
          },
          capstone_project: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              requirements: { type: "array", items: { type: "string" } },
              evaluation_criteria: { type: "array", items: { type: "string" } }
            }
          },
          certifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                provider: { type: "string" },
                preparation_included: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate role curriculum:', error);
    throw error;
  }
}