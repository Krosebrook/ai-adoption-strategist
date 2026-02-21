import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Loader2, FileDown, Presentation, Star, Sparkles, Share2, MessageSquare, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BrandCard, BrandCardContent, BrandCardHeader, BrandCardTitle } from '../components/ui/BrandCard';
import RecommendationCard from '../components/results/RecommendationCard';
import EnhancedRecommendationCard from '../components/ai/EnhancedRecommendationCard';
import ActionRecommendations from '../components/ai/ActionRecommendations';
import ROIChart from '../components/results/ROIChart';
import ComplianceMatrix from '../components/results/ComplianceMatrix';
import IntegrationMatrix from '../components/results/IntegrationMatrix';
import ScenarioPlanner from '../components/results/ScenarioPlanner';
import AIScenarioPlanner from '../components/results/AIScenarioPlanner';
import FeedbackModal from '../components/feedback/FeedbackModal';
import AIInsights from '../components/results/AIInsights';
import ImplementationRoadmap from '../components/results/ImplementationRoadmap';
import EnhancedRoadmapDisplay from '../components/results/EnhancedRoadmapDisplay';
import InsightsPanel from '../components/insights/InsightsPanel';
import { useAIInsights } from '../components/utils/hooks';
import { formatDate } from '../components/utils/formatters';
import ShareModal from '../components/collaboration/ShareModal';
import CommentsPanel from '../components/collaboration/CommentsPanel';
import AccessControlBadge from '../components/collaboration/AccessControlBadge';
import AIScoreCard from '../components/results/AIScoreCard';
import { generateAIAssessmentScore } from '../components/assessment/AIScorer';
import ComplianceAnalysisPanel from '../components/compliance/ComplianceAnalysisPanel';
import ImplementationPlanViewer from '../components/implementation/ImplementationPlanViewer';
import PlatformFeedbackCollector from '../components/feedback/PlatformFeedbackCollector';
import EnhancedPlanInputs from '../components/implementation/EnhancedPlanInputs';
import ActivityFeed from '../components/collaboration/ActivityFeed';
import SecureLinkGenerator from '../components/collaboration/SecureLinkGenerator';
import { generateImplementationPlan } from '../components/implementation/ImplementationPlanEngine';
import { applyReinforcementLearning } from '../components/feedback/ReinforcementLearningEngine';
import DynamicScoringEngine from '../components/assessment/DynamicScoringEngine';
import RiskAnalysisEngine from '../components/assessment/RiskAnalysisEngine';
import ExecutiveSummaryGenerator from '../components/assessment/ExecutiveSummaryGenerator';

export default function Results() {
  const [assessmentId, setAssessmentId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [generatingScore, setGeneratingScore] = useState(false);
  const [implementationPlan, setImplementationPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlanInputs, setShowPlanInputs] = useState(false);
  const [selectedPlatformForFeedback, setSelectedPlatformForFeedback] = useState(null);
  const [reinforcementLearning, setReinforcementLearning] = useState(null);
  const [scoringWeights, setScoringWeights] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const { insights: aiInsights, roadmap: implementationRoadmap, loading: loadingAI, loadInsights } = useAIInsights();

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

  const handleGenerateAIScore = async () => {
    if (!assessment) return;
    
    setGeneratingScore(true);
    try {
      const aiScore = await generateAIAssessmentScore(assessment);
      await base44.entities.Assessment.update(assessment.id, {
        ai_assessment_score: aiScore
      });
      // Refresh assessment data
      queryClient.invalidateQueries(['assessment', assessmentId]);
      toast.success('AI assessment score generated!');
    } catch (error) {
      console.error('Failed to generate AI score:', error);
      toast.error('Failed to generate AI score');
    } finally {
      setGeneratingScore(false);
    }
  };

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

  const queryClient = useQueryClient();

  const handleLoadAIInsights = () => {
    if (!recommendations[0]) return;
    loadInsights(
      recommendations[0],
      assessment,
      roiData,
      assessment.compliance_scores,
      assessment.integration_scores
    );
  };

  const handleGenerateImplementationPlan = async (config = {}) => {
    if (!recommendations[0]) {
      toast.error('No platform recommendation available');
      return;
    }

    setLoadingPlan(true);
    setShowPlanInputs(false);
    try {
      const plan = await generateImplementationPlan(assessment, recommendations[0], config);
      setImplementationPlan(plan);
      toast.success('Implementation plan generated!');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error('Failed to generate implementation plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleApplyReinforcementLearning = async () => {
    if (!assessment || !recommendations) return;

    try {
      const result = await applyReinforcementLearning(assessment, recommendations);
      setReinforcementLearning(result);
      
      if (result.optimization_applied) {
        toast.success(`Recommendations optimized using ${result.sample_size} feedback samples!`);
      } else {
        toast.info(result.message || 'Reinforcement learning applied');
      }
    } catch (error) {
      console.error('Failed to apply reinforcement learning:', error);
      toast.error('Failed to optimize recommendations');
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
              Completed on {formatDate(assessment.assessment_date, { format: 'long' })}
            </p>
          </div>
          <div className="flex gap-2">
              <AccessControlBadge 
                resourceType="assessment" 
                resourceId={assessmentId} 
              />
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-300 text-purple-700"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Button>
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
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setFeedbackModalOpen(true)}
              >
                <Star className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </div>
        </div>

        {/* Comments & Activity Panel */}
        {showComments && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
        <CommentsPanel 
          resourceType="assessment" 
          resourceId={assessmentId}
        />
        </div>
        <div className="space-y-6">
        <ActivityFeed 
          resourceType="assessment" 
          resourceId={assessmentId}
        />
        <SecureLinkGenerator
          resourceType="assessment"
          resourceId={assessmentId}
          resourceName={assessment?.organization_name}
        />
        </div>
        </div>
        )}

        {/* Reinforcement Learning Banner */}
        {reinforcementLearning?.optimization_applied && (
          <Card className="mb-6 border-2 border-purple-300 bg-purple-50">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" />
                    Recommendations Optimized with AI Learning
                  </h3>
                  <p className="text-sm text-purple-700 mb-2">
                    Scoring weights adjusted based on {reinforcementLearning.sample_size} user feedback samples
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reinforcementLearning.adjustments?.slice(0, 3).map((adj, idx) => (
                      <Badge key={idx} variant="outline" className="bg-white text-xs">
                        {adj.weight_name}: {(adj.old_value * 100).toFixed(0)}% → {(adj.new_value * 100).toFixed(0)}%
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge className="bg-purple-600">
                  Confidence: {(reinforcementLearning.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Platform Recommendations</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyReinforcementLearning}
                className="border-purple-300 text-purple-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Optimize with AI Learning
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div key={rec.platform} className="space-y-2">
                <RecommendationCard 
                  recommendation={rec} 
                  rank={index + 1}
                  assessmentId={assessmentId}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300 text-blue-700"
                  onClick={() => setSelectedPlatformForFeedback(rec)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Rate This Recommendation
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Feedback Modal */}
        {selectedPlatformForFeedback && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
              <PlatformFeedbackCollector
                platform={selectedPlatformForFeedback}
                assessmentId={assessmentId}
                onClose={() => setSelectedPlatformForFeedback(null)}
              />
            </div>
          </div>
        )}

        {/* Advanced AI Assessment Tools */}
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Advanced AI Analysis</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <DynamicScoringEngine
              initialWeights={assessment.custom_weights}
              onWeightsChange={setScoringWeights}
            />
            <ExecutiveSummaryGenerator
              assessmentData={assessment}
              scoringWeights={scoringWeights || assessment.custom_weights}
              riskAnalysis={riskAnalysis}
            />
          </div>

          <RiskAnalysisEngine
            assessmentData={assessment}
            onRisksIdentified={setRiskAnalysis}
          />
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="ai-score" onClick={!assessment?.ai_assessment_score ? handleGenerateAIScore : undefined}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Score
            </TabsTrigger>
            <TabsTrigger value="implementation" onClick={!implementationPlan ? handleGenerateImplementationPlan : undefined}>
              <Target className="h-4 w-4 mr-1" />
              Implementation Plan
            </TabsTrigger>
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="insights-engine">
              <Sparkles className="h-4 w-4 mr-1" />
              Insights Engine
            </TabsTrigger>
            <TabsTrigger value="ai-insights" onClick={handleLoadAIInsights}>
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Sparkles className="h-4 w-4 mr-1" />
              Action Plan
            </TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="compliance">
              <Sparkles className="h-4 w-4 mr-1" />
              AI Compliance
            </TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="scenarios">
              <Sparkles className="h-4 w-4 mr-1" />
              AI Scenarios
            </TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-score">
            {generatingScore ? (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Analyzing assessment with AI...</p>
                  <p className="text-sm text-slate-500">This may take 15-20 seconds</p>
                </BrandCardContent>
              </BrandCard>
            ) : assessment?.ai_assessment_score ? (
              <AIScoreCard aiScore={assessment.ai_assessment_score} />
            ) : (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-3">AI assessment score not generated yet</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Get a comprehensive AI-driven score with risk analysis and improvement recommendations
                  </p>
                  <Button 
                    onClick={handleGenerateAIScore}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Score
                  </Button>
                </BrandCardContent>
              </BrandCard>
            )}
          </TabsContent>

          <TabsContent value="implementation">
            {loadingPlan ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Generating comprehensive implementation plan...</p>
                  <p className="text-sm text-slate-500">This may take 20-30 seconds</p>
                </CardContent>
              </Card>
            ) : implementationPlan ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImplementationPlan(null);
                    setShowPlanInputs(false);
                  }}
                >
                  Generate New Plan
                </Button>
                <ImplementationPlanViewer
                  plan={implementationPlan}
                  assessment={assessment}
                  platform={recommendations[0]}
                />
              </div>
            ) : showPlanInputs ? (
              <EnhancedPlanInputs
                assessment={assessment}
                selectedPlatform={recommendations[0]}
                onSubmit={handleGenerateImplementationPlan}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-3">Generate a detailed implementation plan</p>
                  <p className="text-sm text-slate-500 mb-4">
                    AI will create a comprehensive plan with phases, roadblocks, timelines, and team requirements
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => handleGenerateImplementationPlan()}
                      variant="outline"
                    >
                      Quick Generate
                    </Button>
                    <Button 
                      onClick={() => setShowPlanInputs(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Configure & Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights-engine">
            <InsightsPanel assessment={assessment} />
          </TabsContent>

          <TabsContent value="ai-insights">
            {loadingAI ? (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Generating AI-powered insights...</p>
                  <p className="text-sm text-slate-500">This may take 10-20 seconds</p>
                </BrandCardContent>
              </BrandCard>
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

                <AIInsights 
                  insights={aiInsights} 
                  assessmentId={assessmentId}
                />
                {implementationRoadmap?.phases?.[0]?.resource_requirements ? (
                  <EnhancedRoadmapDisplay
                    roadmap={implementationRoadmap} 
                    platformName={recommendations[0]?.platform_name}
                    assessmentId={assessmentId}
                  />
                ) : (
                  <ImplementationRoadmap 
                    roadmap={implementationRoadmap} 
                    platformName={recommendations[0]?.platform_name}
                    assessmentId={assessmentId}
                  />
                )}
              </div>
            ) : (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-3">Click "AI Insights" tab to generate detailed analysis</p>
                  <p className="text-sm text-slate-500">
                    AI will analyze pain points, provide implementation roadmap, and suggest best practices
                  </p>
                </BrandCardContent>
              </BrandCard>
            )}
          </TabsContent>

          <TabsContent value="actions">
            <ActionRecommendations 
              assessment={assessment}
              risks={{
                compliance_gaps: assessment.compliance_scores,
                integration_challenges: assessment.integration_scores
              }}
            />
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
            <ComplianceAnalysisPanel assessment={assessment} />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationMatrix
              integrationData={assessment.integration_scores}
              integrations={assessment.desired_integrations}
            />
          </TabsContent>

          <TabsContent value="scenarios">
            <AIScenarioPlanner baseAssessment={assessment} />
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

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        resourceType="assessment"
        resourceId={assessmentId}
        resourceName={assessment?.organization_name}
      />
      </div>
      );
      }