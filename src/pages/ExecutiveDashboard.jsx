import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Target, 
  FileText, 
  Loader2,
  ChevronRight,
  Award,
  DollarSign,
  Clock
} from 'lucide-react';

import PlatformSummaryCard from '../components/dashboard/PlatformSummaryCard';
import ROIOverview from '../components/dashboard/ROIOverview';
import RiskIndicators from '../components/dashboard/RiskIndicators';
import PainPointsSummary from '../components/dashboard/PainPointsSummary';

export default function ExecutiveDashboard() {
  const [latestAssessment, setLatestAssessment] = useState(null);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const result = await base44.entities.Assessment.filter({ status: 'completed' }, '-assessment_date', 1);
      return result;
    }
  });

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      setLatestAssessment(assessments[0]);
    }
  }, [assessments]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading executive dashboard...</p>
        </div>
      </div>
    );
  }

  if (!latestAssessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Assessment Available</h2>
            <p className="text-slate-600 mb-6">Complete an assessment to view your executive dashboard</p>
            <Link to={createPageUrl('Assessment')}>
              <Button className="bg-slate-900 hover:bg-slate-800">
                Start Assessment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const topPlatforms = (latestAssessment.recommended_platforms || []).slice(0, 3);
  const roiData = Object.values(latestAssessment.roi_calculations || {});

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Executive Dashboard</h1>
              <p className="text-slate-600">{latestAssessment.organization_name}</p>
              <p className="text-sm text-slate-500">
                Assessment completed on {new Date(latestAssessment.assessment_date).toLocaleDateString()}
              </p>
            </div>
            <Link to={createPageUrl('Results') + `?id=${latestAssessment.id}`}>
              <Button variant="outline" className="border-slate-300">
                <FileText className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Platforms Evaluated</p>
                    <p className="text-3xl font-bold text-slate-900">4</p>
                  </div>
                  <Award className="h-10 w-10 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Projected Annual ROI</p>
                    <p className="text-3xl font-bold text-green-900">
                      {topPlatforms[0]?.score ? Math.round(topPlatforms[0].score * 3) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Compliance Standards</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {latestAssessment.compliance_requirements?.length || 0}
                    </p>
                  </div>
                  <Shield className="h-10 w-10 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Departments</p>
                    <p className="text-3xl font-bold text-amber-900">
                      {latestAssessment.departments?.length || 0}
                    </p>
                  </div>
                  <Target className="h-10 w-10 text-amber-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top 3 Platforms */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-slate-700" />
            Top Platform Recommendations
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topPlatforms.map((platform, index) => (
              <PlatformSummaryCard 
                key={platform.platform} 
                platform={platform} 
                rank={index + 1}
                assessmentId={latestAssessment.id}
              />
            ))}
          </div>
        </div>

        {/* ROI Overview */}
        <ROIOverview roiData={roiData} assessmentId={latestAssessment.id} />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Risk Indicators */}
          <RiskIndicators 
            complianceScores={latestAssessment.compliance_scores}
            integrationScores={latestAssessment.integration_scores}
            complianceRequirements={latestAssessment.compliance_requirements}
            integrations={latestAssessment.desired_integrations}
          />

          {/* Pain Points Summary */}
          <PainPointsSummary 
            painPoints={latestAssessment.pain_points}
            painPointMappings={latestAssessment.pain_point_mappings}
          />
        </div>

        {/* AI Insights Banner */}
        {latestAssessment.ai_insights && (
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Enhanced Analysis Available</h3>
                  <p className="text-sm text-slate-700 mb-3">
                    Advanced insights detected {latestAssessment.ai_insights.pain_points?.length || 0} additional considerations 
                    and {latestAssessment.ai_insights.hidden_requirements?.length || 0} hidden requirements from your input.
                  </p>
                  <Link to={createPageUrl('Results') + `?id=${latestAssessment.id}`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View AI Insights
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Items */}
        <Card className="mt-8 border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to={createPageUrl('Results') + `?id=${latestAssessment.id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Review Complete Assessment</p>
                      <p className="text-sm text-slate-600">Access detailed analysis and reports</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>

              <Link to={createPageUrl('Assessment')}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">Run New Assessment</p>
                      <p className="text-sm text-slate-600">Update your evaluation with new data</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>

              <Link to={createPageUrl('Dashboard')}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-900">View All Assessments</p>
                      <p className="text-sm text-slate-600">Compare historical evaluations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}