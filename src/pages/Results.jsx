import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Share2, Loader2, FileDown, Presentation, Star, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import RecommendationCard from '../components/results/RecommendationCard';
import ROIChart from '../components/results/ROIChart';
import ComplianceMatrix from '../components/results/ComplianceMatrix';
import IntegrationMatrix from '../components/results/IntegrationMatrix';
import ScenarioPlanner from '../components/results/ScenarioPlanner';
import FeedbackModal from '../components/feedback/FeedbackModal';
import AIInsights from '../components/results/AIInsights';
import ImplementationRoadmap from '../components/results/ImplementationRoadmap';
import { generatePlatformInsights, generateImplementationRoadmap } from '../components/assessment/AIEnhancer';

export default function Results() {
  const [assessmentId, setAssessmentId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [implementationRoadmap, setImplementationRoadmap] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setAssessmentId(id);
  }, []);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const assessments = await base44.entities.Assessment.filter({ id: assessmentId });
      return assessments[0];
    },
    enabled: !!assessmentId
  });

  const exportPDFMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('exportPDF', { 
        assessmentId: assessmentId 
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Create blob and download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assessment?.organization_name?.replace(/[^a-z0-9]/gi, '_') || 'Assessment'}_Executive_Summary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('PDF downloaded successfully!');
    },
    onError: (error) => {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  });

  const exportPowerPointMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('exportPowerPoint', { 
        assessmentId: assessmentId 
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Currently returns JSON structure (placeholder)
      // In production with PptxGenJS, this would be a .pptx file
      if (data.structure) {
        // Download JSON structure as placeholder
        const blob = new Blob([JSON.stringify(data.structure, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assessment?.organization_name?.replace(/[^a-z0-9]/gi, '_') || 'Assessment'}_Report_Structure.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Report structure downloaded! (PowerPoint generation requires PptxGenJS library)');
      }
    },
    onError: (error) => {
      console.error('PowerPoint export error:', error);
      toast.error('Failed to generate PowerPoint. Please try again.');
    }
  });

  const handleExportPDF = () => {
    if (!assessmentId) {
      toast.error('No assessment selected');
      return;
    }
    exportPDFMutation.mutate();
  };

  const handleExportPowerPoint = () => {
    if (!assessmentId) {
      toast.error('No assessment selected');
      return;
    }
    exportPowerPointMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Assessment not found</p>
        </div>
      </div>
    );
  }

  const roiData = Object.values(assessment.roi_calculations || {});
  const recommendations = assessment.recommended_platforms || [];

  const loadAIInsights = async () => {
    if (!recommendations[0] || loadingAI || aiInsights) return;
    
    setLoadingAI(true);
    try {
      const topPlatform = recommendations[0];
      const [insights, roadmap] = await Promise.all([
        generatePlatformInsights(
          topPlatform, 
          assessment, 
          roiData, 
          assessment.compliance_scores, 
          assessment.integration_scores
        ),
        generateImplementationRoadmap(topPlatform, assessment)
      ]);
      
      setAiInsights(insights);
      setImplementationRoadmap(roadmap);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Results</h1>
            <p className="text-slate-600">{assessment.organization_name}</p>
            <p className="text-sm text-slate-500">
              Completed on {new Date(assessment.assessment_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-slate-300"
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending}
            >
              {exportPDFMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-300"
              onClick={handleExportPowerPoint}
              disabled={exportPowerPointMutation.isPending}
            >
              {exportPowerPointMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Presentation className="h-4 w-4 mr-2" />
              )}
              Export Report
            </Button>
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setFeedbackModalOpen(true)}
            >
              <Star className="h-4 w-4 mr-2" />
              Share Feedback
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.slice(0, 4).map((rec, index) => (
              <RecommendationCard key={rec.platform} recommendation={rec} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="ai-insights" onClick={loadAIInsights}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Planning</TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-insights">
            {loadingAI ? (
              <Card className="border-slate-200">
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Generating AI-powered insights...</p>
                  <p className="text-sm text-slate-500">This may take 10-20 seconds</p>
                </CardContent>
              </Card>
            ) : aiInsights && implementationRoadmap ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
                  </div>
                  <p className="text-blue-100">
                    Deep analysis for {recommendations[0]?.platform_name} - your top recommended platform
                  </p>
                </div>

                <AIInsights insights={aiInsights} />
                <ImplementationRoadmap 
                  roadmap={implementationRoadmap} 
                  platformName={recommendations[0]?.platform_name}
                />
              </div>
            ) : (
              <Card className="border-slate-200">
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-3">Click "AI Insights" tab to generate detailed analysis</p>
                  <p className="text-sm text-slate-500">
                    AI will analyze pain points, provide implementation roadmap, and suggest best practices
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="executive">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">Executive Summary</CardTitle>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={exportPDFMutation.isPending}
                >
                  {exportPDFMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  Download as PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{assessment.executive_summary}</ReactMarkdown>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">📄 Export Options</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Download this executive summary as a formatted PDF document for sharing with stakeholders.
                  </p>
                  <p className="text-xs text-blue-600">
                    <strong>Note:</strong> PDF generation uses jsPDF. For production use with advanced layouts, 
                    consider pdfmake or Puppeteer for HTML-to-PDF rendering.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi">
            <div className="space-y-6">
              <ROIChart roiData={roiData} />
              
              {roiData.map((roi) => (
                <Card key={roi.platform} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900 capitalize">
                      {roi.platform.replace(/_/g, ' ')} - ROI Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Total Annual Savings</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ${roi.total_annual_savings.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">1-Year ROI</div>
                        <div className="text-2xl font-bold text-green-900">
                          {roi.one_year_roi.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">3-Year ROI</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {roi.three_year_roi.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Platform Cost</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${roi.total_cost.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 text-slate-700 font-semibold">Department</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Users</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Hours Saved</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Annual Savings</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Net Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roi.department_breakdown?.map((dept, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-slate-700 font-medium">{dept.department}</td>
                              <td className="text-right py-2 px-3 text-slate-600">{dept.user_count}</td>
                              <td className="text-right py-2 px-3 text-slate-600">
                                {dept.annual_hours_saved.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-3 text-slate-600">
                                ${dept.annual_savings.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-3 font-medium text-slate-900">
                                ${dept.net_savings.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceMatrix
              complianceData={assessment.compliance_scores}
              requirements={assessment.compliance_requirements}
            />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationMatrix
              integrationData={assessment.integration_scores}
              integrations={assessment.desired_integrations}
            />
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioPlanner baseAssessment={assessment} />
          </TabsContent>

          <TabsContent value="details">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-900">Complete Assessment Data</CardTitle>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleExportPowerPoint}
                  disabled={exportPowerPointMutation.isPending}
                >
                  {exportPowerPointMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Presentation className="h-4 w-4 mr-2" />
                  )}
                  Export Full Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <Presentation className="h-4 w-4" />
                    PowerPoint Export (Placeholder)
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    Click "Export Full Report" to generate a comprehensive presentation structure. 
                    This includes all assessment data formatted for PowerPoint slides.
                  </p>
                  <div className="bg-amber-100 p-3 rounded text-xs text-amber-900 space-y-1">
                    <p><strong>⚠️ Implementation Note:</strong></p>
                    <p>Currently generates JSON structure. For actual .pptx files, install:</p>
                    <code className="block mt-2 bg-white p-2 rounded">npm install pptxgenjs@3.12.0</code>
                    <p className="mt-2">
                      See <code>functions/exportPowerPoint.js</code> for implementation details and 
                      recommended libraries (PptxGenJS, officegen, node-pptx).
                    </p>
                  </div>
                </div>

                <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-96 text-slate-700">
                  {JSON.stringify(assessment, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <FeedbackModal 
        isOpen={feedbackModalOpen} 
        onClose={() => setFeedbackModalOpen(false)}
        assessmentId={assessmentId}
      />
    </div>
  );
}