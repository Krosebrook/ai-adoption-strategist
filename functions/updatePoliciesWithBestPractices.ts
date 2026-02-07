import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { scanOnly = false } = body;

    // Get current policies
    const currentPolicies = await base44.asServiceRole.entities.AIPolicy.list();

    // Get recent governance data
    const usageLogs = await base44.asServiceRole.entities.AIUsageLog.list('-created_date', 100);
    const biasScans = await base44.asServiceRole.entities.BiasMonitoring.list('-created_date', 10);
    const violations = usageLogs.filter(l => l.policy_compliance?.compliant === false);

    const analysisPrompt = `You are an AI governance expert analyzing current policies and recommending updates.
      
      Current Policies: ${JSON.stringify(currentPolicies)}
      
      Recent Violations: ${violations.length}
      Sample Violations: ${JSON.stringify(violations.slice(0, 5))}
      
      Bias Issues: ${JSON.stringify(biasScans.map(s => ({ 
        agent: s.agent_name, 
        risk_level: s.risk_level,
        issues: s.detected_issues?.length || 0
      })))}
      
      Based on:
      1. Latest AI governance regulations and best practices (GDPR, AI Act, NIST AI RMF)
      2. Industry standards for responsible AI
      3. Current policy gaps and violation patterns
      4. Detected bias and fairness issues
      
      Provide:
      - Recommended new policies to add
      - Existing policies that need updates with specific changes
      - Policies that should be archived
      - Priority level for each recommendation`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          new_policies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                policy_name: { type: "string" },
                policy_type: { type: "string" },
                description: { type: "string" },
                rules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      rule_description: { type: "string" },
                      severity: { type: "string" },
                      enforcement: { type: "string" }
                    }
                  }
                },
                applicable_agents: {
                  type: "array",
                  items: { type: "string" }
                },
                rationale: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          policy_updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                policy_id: { type: "string" },
                policy_name: { type: "string" },
                recommended_changes: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          policies_to_archive: {
            type: "array",
            items: { type: "string" }
          },
          summary: { type: "string" },
          compliance_gaps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    let appliedChanges = [];

    // Apply changes if not scan-only
    if (!scanOnly) {
      // Create new policies
      for (const policy of response.new_policies) {
        await base44.asServiceRole.entities.AIPolicy.create({
          policy_name: policy.policy_name,
          policy_type: policy.policy_type,
          description: policy.description,
          rules: policy.rules,
          applicable_agents: policy.applicable_agents,
          status: 'draft',
          version: '1.0'
        });
        appliedChanges.push(`Created: ${policy.policy_name}`);
      }
    }

    // Log audit
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action_type: scanOnly ? 'read' : 'update',
      entity_type: 'AIPolicy',
      success: true,
      metadata: {
        scan_only: scanOnly,
        recommendations: response.new_policies.length + response.policy_updates.length,
        applied: appliedChanges.length
      }
    });

    return Response.json({
      success: true,
      scan_only: scanOnly,
      recommendations: response,
      applied_changes: appliedChanges,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});