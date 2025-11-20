import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, TrendingUp, DollarSign, Code, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedReportGenerator({ assessment, onReportGenerated }) {
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('executive');

  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      let report;
      
      switch (reportType) {
        case 'executive':
          report = await generateExecutiveReport(assessment);
          break;
        case 'technical':
          report = await generateTechnicalReport(assessment);
          break;
        case 'financial':
          report = await generateFinancialReport(assessment);
          break;
        case 'comprehensive':
          report = await generateComprehensiveReport(assessment);
          break;
        default:
          throw new Error('Invalid report type');
      }

      onReportGenerated(report, reportType);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI-Powered Report Generation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeType} onValueChange={setActiveType}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="executive">
              <FileText className="h-4 w-4 mr-1" />
              Executive
            </TabsTrigger>
            <TabsTrigger value="technical">
              <Code className="h-4 w-4 mr-1" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-1" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="comprehensive">
              <TrendingUp className="h-4 w-4 mr-1" />
              Comprehensive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-3">
            <p className="text-sm text-slate-600">
              High-level strategic overview for C-suite executives with key recommendations,
              financial impact, and decision frameworks.
            </p>
            <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
              <li>Executive summary and strategic recommendations</li>
              <li>Financial projections and ROI analysis</li>
              <li>Risk assessment and mitigation strategies</li>
              <li>Implementation timeline and next steps</li>
            </ul>
          </TabsContent>

          <TabsContent value="technical" className="space-y-3">
            <p className="text-sm text-slate-600">
              Detailed technical architecture, integration requirements, and implementation
              specifications for IT teams.
            </p>
            <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
              <li>Technical architecture and infrastructure requirements</li>
              <li>Integration specifications and API details</li>
              <li>Security configuration and compliance setup</li>
              <li>Testing plan and deployment guidelines</li>
            </ul>
          </TabsContent>

          <TabsContent value="financial" className="space-y-3">
            <p className="text-sm text-slate-600">
              Comprehensive financial analysis with TCO, ROI projections, and budget requirements
              for finance teams.
            </p>
            <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
              <li>Total Cost of Ownership (TCO) analysis</li>
              <li>Multi-year ROI projections and scenarios</li>
              <li>Cost-benefit analysis by department</li>
              <li>Budget allocation and payment schedules</li>
            </ul>
          </TabsContent>

          <TabsContent value="comprehensive" className="space-y-3">
            <p className="text-sm text-slate-600">
              All-inclusive report combining executive, technical, and financial perspectives
              for complete stakeholder alignment.
            </p>
            <ul className="text-sm text-slate-600 space-y-1 pl-5 list-disc">
              <li>Complete assessment results and methodology</li>
              <li>All platform comparisons with detailed scoring</li>
              <li>Full technical and financial documentation</li>
              <li>Implementation playbook and success metrics</li>
            </ul>
          </TabsContent>
        </Tabs>

        <Button
          onClick={() => generateReport(activeType)}
          disabled={loading}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating {activeType} report...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// AI-powered report generation functions
async function generateExecutiveReport(assessment) {
  const topPlatform = assessment.recommended_platforms?.[0];
  const roiData = assessment.roi_calculations?.[topPlatform?.platform?.toLowerCase().replace(/ /g, '_')];

  const prompt = `Generate a comprehensive executive summary report for AI platform adoption.

Assessment Context:
- Organization: ${assessment.organization_name}
- Top Recommendation: ${topPlatform?.platform_name}
- 1-Year ROI: ${roiData?.one_year_roi}%
- Annual Savings: $${roiData?.total_annual_savings?.toLocaleString()}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Compliance: ${assessment.compliance_requirements?.join(', ')}

Generate a professional executive report with:
1. Executive Summary (3-4 paragraphs)
2. Strategic Recommendation (why this platform)
3. Financial Impact (ROI, costs, savings breakdown)
4. Risk Factors (top 3 risks and mitigations)
5. Implementation Overview (timeline and phases)
6. Next Steps (actionable recommendations)`;

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        strategic_recommendation: { type: 'string' },
        financial_impact: { type: 'string' },
        risk_factors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              risk: { type: 'string' },
              mitigation: { type: 'string' }
            }
          }
        },
        implementation_overview: { type: 'string' },
        next_steps: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  });
}

async function generateTechnicalReport(assessment) {
  const topPlatform = assessment.recommended_platforms?.[0];

  const prompt = `Generate a detailed technical implementation report for ${topPlatform?.platform_name}.

Organization: ${assessment.organization_name}
Required Integrations: ${assessment.desired_integrations?.join(', ')}
Compliance: ${assessment.compliance_requirements?.join(', ')}

Generate sections:
1. Architecture Overview (infrastructure and deployment model)
2. Integration Specifications (for each required integration)
3. Security Configuration (compliance and security setup)
4. Testing Plan (phases and test cases)`;

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        architecture_overview: { type: 'string' },
        integration_specs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              system: { type: 'string' },
              method: { type: 'string' },
              requirements: { type: 'string' }
            }
          }
        },
        security_configuration: { type: 'string' },
        testing_plan: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phase: { type: 'string' },
              tests: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      }
    }
  });
}

async function generateFinancialReport(assessment) {
  const platforms = assessment.recommended_platforms?.slice(0, 3);
  const roiData = assessment.roi_calculations;

  const prompt = `Generate a comprehensive financial analysis report comparing AI platforms.

Platforms: ${platforms?.map(p => p.platform_name).join(', ')}
Organization: ${assessment.organization_name}
Total Users: ${assessment.departments?.reduce((sum, d) => sum + (d.user_count || 0), 0)}

Generate:
1. TCO Analysis (3-year breakdown for each platform)
2. ROI Comparison (side-by-side comparison)
3. Cost-Benefit Analysis (quantified benefits vs costs)
4. Budget Requirements (upfront, recurring, by category)`;

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        tco_analysis: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              year1: { type: 'number' },
              year2: { type: 'number' },
              year3: { type: 'number' },
              total: { type: 'number' }
            }
          }
        },
        roi_comparison: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              roi_1yr: { type: 'number' },
              roi_3yr: { type: 'number' },
              payback_months: { type: 'number' }
            }
          }
        },
        cost_benefit: { type: 'string' },
        budget_requirements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              amount: { type: 'number' },
              timing: { type: 'string' }
            }
          }
        }
      }
    }
  });
}

async function generateComprehensiveReport(assessment) {
  const [executive, technical, financial] = await Promise.all([
    generateExecutiveReport(assessment),
    generateTechnicalReport(assessment),
    generateFinancialReport(assessment)
  ]);

  return {
    executive,
    technical,
    financial,
    metadata: {
      organization: assessment.organization_name,
      generated_at: new Date().toISOString(),
      assessment_id: assessment.id
    }
  };
}