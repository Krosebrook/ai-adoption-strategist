import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportType, strategyId, assessmentId, includeExternalData } = await req.json();

    // Gather internal data
    let contextData = {};
    
    if (strategyId) {
      const strategy = await base44.entities.AdoptionStrategy.get(strategyId);
      contextData.strategy = strategy;
      
      const risks = await base44.entities.RiskAlert.filter({ source_id: strategyId });
      contextData.risks = risks;
    }

    if (assessmentId) {
      const assessment = await base44.entities.Assessment.get(assessmentId);
      contextData.assessment = assessment;
    }

    // Fetch recent AI usage and governance data
    const usageLogs = await base44.entities.AIUsageLog.list('-created_date', 50);
    const policies = await base44.entities.AIPolicy.filter({ status: 'active' });
    const biasScans = await base44.entities.BiasMonitoring.list('-created_date', 10);
    
    contextData.governance = { usageLogs, policies, biasScans };

    // Build grounded prompt with external data sources
    const groundingPrompt = includeExternalData 
      ? `Use current industry best practices, latest AI governance regulations, and market trends to inform your analysis.`
      : '';

    const reportPrompts = {
      executive: `Generate a comprehensive executive summary report analyzing the AI adoption strategy and its progress.
        ${groundingPrompt}
        Include: current status, key achievements, risks, ROI projections, and strategic recommendations.
        Data: ${JSON.stringify(contextData)}`,
      
      compliance: `Generate a detailed compliance and governance report.
        ${groundingPrompt}
        Analyze policy adherence, bias detection results, usage patterns, and regulatory alignment.
        Include specific recommendations for improving compliance.
        Data: ${JSON.stringify(contextData)}`,
      
      risk: `Generate a comprehensive risk analysis report.
        ${groundingPrompt}
        Analyze all identified risks, their severity, mitigation progress, and emerging threats.
        Include predictive insights and recommended actions.
        Data: ${JSON.stringify(contextData)}`,
      
      performance: `Generate an AI performance and cost efficiency report.
        ${groundingPrompt}
        Analyze usage metrics, cost trends, model performance, and optimization opportunities.
        Data: ${JSON.stringify(contextData)}`
    };

    const prompt = reportPrompts[reportType] || reportPrompts.executive;

    // Generate report using LLM with grounding
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: includeExternalData,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          executive_summary: { type: "string" },
          key_findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                finding: { type: "string" },
                impact: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          detailed_analysis: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                rationale: { type: "string" },
                timeline: { type: "string" }
              }
            }
          },
          metrics: {
            type: "object",
            additionalProperties: true
          },
          external_sources: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Log the report generation
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action_type: 'create',
      entity_type: 'Report',
      success: true,
      metadata: {
        report_type: reportType,
        grounded: includeExternalData
      }
    });

    return Response.json({
      success: true,
      report: response,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});