import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessment_id } = await req.json();
    
    if (!assessment_id) {
      return Response.json({ error: 'assessment_id required' }, { status: 400 });
    }

    const assessment = await base44.entities.Assessment.get(assessment_id);
    
    const prompt = `You are an enterprise infrastructure analyst. Analyze the current infrastructure and AI readiness based on this assessment:

Organization: ${assessment.organization_name}
Departments: ${JSON.stringify(assessment.departments)}
Technical Constraints: ${JSON.stringify(assessment.technical_constraints)}
Desired Integrations: ${assessment.desired_integrations?.join(', ')}
Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}

Provide a comprehensive infrastructure analysis including:
1. Current infrastructure assessment (strengths and gaps)
2. Network and security readiness for AI
3. Data infrastructure evaluation
4. API and integration capabilities
5. Scalability assessment
6. Infrastructure modernization recommendations
7. Estimated infrastructure investment needed
8. Timeline for infrastructure preparation`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          infrastructure_score: { type: 'number', description: 'Score 0-100' },
          network_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } }
            }
          },
          data_infrastructure: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              assessment: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          },
          integration_capabilities: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              current_state: { type: 'string' },
              required_improvements: { type: 'array', items: { type: 'string' } }
            }
          },
          scalability: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              bottlenecks: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          },
          modernization_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                phase: { type: 'string' },
                timeline: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } },
                estimated_cost: { type: 'string' }
              }
            }
          },
          total_investment_range: { type: 'string' },
          preparation_timeline: { type: 'string' }
        }
      }
    });

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});