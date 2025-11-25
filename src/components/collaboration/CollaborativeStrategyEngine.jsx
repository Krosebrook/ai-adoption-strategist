import { base44 } from '@/api/base44Client';

/**
 * Generate AI suggestions for collaborative decision-making
 */
export async function generateCollaborativeSuggestions(strategy, discussionPoints, currentTopic) {
  const recentDiscussions = discussionPoints?.slice(-10).map(d => 
    `${d.author_name} (${d.type}): ${d.content}`
  ).join('\n');

  const prompt = `As a strategic AI advisor, analyze the ongoing strategy discussion and provide suggestions.

**Strategy Context:**
- Organization: ${strategy.organization_name}
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}

**Current Discussion Topic:** ${currentTopic || 'General strategy refinement'}

**Recent Discussion Points:**
${recentDiscussions || 'No prior discussion'}

Provide actionable suggestions that:
1. Address concerns raised by participants
2. Identify potential compromises for disagreements
3. Highlight risks or opportunities not yet discussed
4. Suggest concrete next steps`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                rationale: { type: "string" },
                category: { type: "string", enum: ["risk_mitigation", "optimization", "compromise", "opportunity", "clarification"] },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                addresses_concern: { type: "string" }
              }
            }
          },
          consensus_opportunities: { type: "array", items: { type: "string" } },
          potential_conflicts: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate suggestions:', error);
    throw error;
  }
}

/**
 * Summarize strategy session discussions
 */
export async function summarizeStrategySession(session, strategy) {
  const discussions = session.discussion_points?.map(d => ({
    type: d.type,
    author: d.author_name,
    content: d.content,
    votes: (d.votes?.up?.length || 0) - (d.votes?.down?.length || 0),
    resolved: d.resolved,
    replies: d.replies?.length || 0
  }));

  const prompt = `Summarize this collaborative strategy session for ${strategy.organization_name}.

**Session:** ${session.session_name}
**Participants:** ${session.participants?.map(p => p.name).join(', ')}
**Duration:** ${session.started_at} to ${session.ended_at || 'ongoing'}

**Discussion Points:**
${JSON.stringify(discussions, null, 2)}

**Roadmap Edits Proposed:**
${session.roadmap_edits?.map(e => `${e.editor_name}: ${e.change_description} (${e.status})`).join('\n') || 'None'}

Provide:
1. Key decisions made (items marked as decisions or highly upvoted)
2. Action items with owners and deadlines
3. Open questions requiring follow-up
4. Areas of consensus
5. Areas of disagreement needing resolution
6. Recommended next steps`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          key_decisions: { type: "array", items: { type: "string" } },
          action_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                owner: { type: "string" },
                deadline: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          open_questions: { type: "array", items: { type: "string" } },
          consensus_areas: { type: "array", items: { type: "string" } },
          disagreement_areas: { type: "array", items: { type: "string" } },
          next_steps: { type: "array", items: { type: "string" } },
          session_effectiveness_score: { type: "number" },
          improvement_suggestions: { type: "array", items: { type: "string" } }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to summarize session:', error);
    throw error;
  }
}

/**
 * Analyze roadmap edit proposals
 */
export async function analyzeRoadmapEdit(strategy, proposedEdit) {
  const prompt = `Analyze this proposed roadmap edit for ${strategy.organization_name}'s AI adoption strategy.

**Current Roadmap Phase:** ${proposedEdit.phase}
**Proposed Change:** ${proposedEdit.change_description}
**Proposed by:** ${proposedEdit.editor_name}

Evaluate:
1. Impact on overall timeline
2. Budget implications
3. Risk changes
4. Dependencies affected
5. Recommendation to approve or request modifications`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendation: { type: "string", enum: ["approve", "approve_with_modifications", "request_clarification", "reject"] },
          timeline_impact: { type: "string" },
          budget_impact: { type: "string" },
          risk_assessment: { type: "string" },
          affected_dependencies: { type: "array", items: { type: "string" } },
          suggested_modifications: { type: "array", items: { type: "string" } },
          rationale: { type: "string" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze edit:', error);
    throw error;
  }
}