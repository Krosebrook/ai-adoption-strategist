import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import { FileText, Plus, Calendar, Building2, Loader2, TrendingUp, LayoutGrid, Settings, Users } from 'lucide-react';
import { BrandCard, BrandCardContent, BrandCardHeader, BrandCardTitle } from '../components/ui/BrandCard';
import TrendAnalysis from '../components/dashboard/TrendAnalysis';
import InsightsSummary from '../components/dashboard/InsightsSummary';
import InteractiveFilters from '../components/dashboard/InteractiveFilters';
import TrendsSummary from '../components/dashboard/TrendsSummary';
import PlatformTrendsChart from '../components/dashboard/PlatformTrendsChart';
import RiskComplianceAnalytics from '../components/dashboard/RiskComplianceAnalytics';
import AIInsightsPerformance from '../components/dashboard/AIInsightsPerformance';
import DashboardBuilder from '../components/dashboard/DashboardBuilder';
import { useAssessmentFilters } from '../components/utils/hooks';
import { getStatusStyle, formatDate } from '../components/utils/formatters';
import { detectAnomalies } from '../components/dashboard/AnomalyDetector';
import {
  ROIOverviewWidget,
  AnomalyAlertsWidget,
  PlatformTrendsWidget,
  ComplianceMatrixWidget,
  RiskIndicatorsWidget,
  RecentAssessmentsWidget,
  CostComparisonWidget,
  AdoptionRateWidget,
  TimeToValueWidget
} from '../components/dashboard/widgets';
import SharedResourcesList from '../components/collaboration/SharedResourcesList';

export default function Dashboard() {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [viewMode, setViewMode] = useState('default');

  const { data: allAssessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 100),
    initialData: []
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: customDashboard } = useQuery({
    queryKey: ['custom-dashboard', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const dashboards = await base44.entities.CustomDashboard.filter({ 
        user_email: user.email, 
        is_default: true 
      });
      return dashboards[0] || null;
    },
    enabled: !!user
  });

  const { filters, setFilters, filteredAssessments: assessments } = useAssessmentFilters(allAssessments);
  const completedAssessments = allAssessments.filter(a => a.status === 'completed');

  // Run anomaly detection on mount and when assessments change
  useEffect(() => {
    if (completedAssessments.length >= 5 && user) {
      detectAnomalies(completedAssessments, user.email);
    }
  }, [completedAssessments.length, user]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Assessment Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>View, analyze, and manage all assessments</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBuilderOpen(true)}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Link to={createPageUrl('Reports')}>
              <Button variant="outline" style={{ borderColor: 'var(--color-border)' }}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </Link>
            <Link to={createPageUrl('Assessment')}>
              <Button 
                className="text-white"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                  border: 'none'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BrandCard>
            <BrandCardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Assessments</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{allAssessments.length}</p>
                </div>
                <FileText className="h-10 w-10 opacity-20" style={{ color: 'var(--color-text)' }} />
              </div>
            </BrandCardContent>
          </BrandCard>

          <BrandCard>
            <BrandCardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Completed</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {completedAssessments.length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10" style={{ color: 'var(--color-teal-500)', opacity: 0.5 }} />
              </div>
            </BrandCardContent>
          </BrandCard>

          <BrandCard>
            <BrandCardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Draft</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {allAssessments.filter(a => a.status === 'draft').length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-20" style={{ color: 'var(--color-text)' }} />
              </div>
            </BrandCardContent>
          </BrandCard>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={viewMode === 'default' ? 'default' : 'outline'}
            onClick={() => setViewMode('default')}
            size="sm"
          >
            Standard View
          </Button>
          <Button
            variant={viewMode === 'widgets' ? 'default' : 'outline'}
            onClick={() => setViewMode('widgets')}
            size="sm"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Widget View
          </Button>
        </div>

        {/* Custom Widget Dashboard */}
        {viewMode === 'widgets' && customDashboard?.layout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnomalyAlertsWidget />
            {customDashboard.layout.map((widget, idx) => {
              const props = { assessments: completedAssessments };
              switch (widget.widget_type) {
                case 'roi_overview':
                  return <ROIOverviewWidget key={idx} {...props} />;
                case 'platform_trends':
                  return <PlatformTrendsWidget key={idx} {...props} />;
                case 'compliance_matrix':
                  return <ComplianceMatrixWidget key={idx} {...props} />;
                case 'risk_indicators':
                  return <RiskIndicatorsWidget key={idx} {...props} />;
                case 'recent_assessments':
                  return <RecentAssessmentsWidget key={idx} {...props} />;
                case 'cost_comparison':
                  return <CostComparisonWidget key={idx} {...props} />;
                case 'adoption_rate':
                  return <AdoptionRateWidget key={idx} {...props} />;
                case 'time_to_value':
                  return <TimeToValueWidget key={idx} {...props} />;
                default:
                  return null;
              }
            })}
          </div>
        ) : viewMode === 'widgets' ? (
          <BrandCard className="mb-8">
            <BrandCardContent className="py-12 text-center">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-slate-600 mb-4">No custom dashboard configured</p>
              <Button onClick={() => setBuilderOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Create Custom Dashboard
              </Button>
            </BrandCardContent>
          </BrandCard>
        ) : null}

        {/* Interactive Dashboard */}
        {viewMode === 'default' && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Platform Trends</TabsTrigger>
              <TabsTrigger value="risks">Risks & Compliance</TabsTrigger>
              <TabsTrigger value="performance">AI Performance</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="shared">
                <Users className="h-4 w-4 mr-1" />
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
            <InteractiveFilters 
              filters={filters} 
              onFilterChange={setFilters}
              assessments={allAssessments}
            />

            {/* Assessments List */}
            <BrandCard>
              <BrandCardHeader>
                <BrandCardTitle>Assessments ({assessments.length})</BrandCardTitle>
              </BrandCardHeader>
              <BrandCardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Loading assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No assessments yet</p>
                <Link to={createPageUrl('Assessment')}>
                  <Button className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Assessment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {assessment.organization_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(assessment.assessment_date || assessment.created_date)}
                          </span>
                          <span>
                            {assessment.departments?.length || 0} departments
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={getStatusStyle(assessment.status)}>
                        {assessment.status === 'completed' ? 'Completed' : 'Draft'}
                      </Badge>
                      
                      {assessment.status === 'completed' && (
                        <Link to={createPageUrl('Results') + `?id=${assessment.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-300">
                            View Results
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </BrandCardContent>
            </BrandCard>
          </TabsContent>

          <TabsContent value="trends">
            <PlatformTrendsChart assessments={completedAssessments} />
          </TabsContent>

          <TabsContent value="risks">
            <RiskComplianceAnalytics assessments={completedAssessments} />
          </TabsContent>

          <TabsContent value="performance">
            <AIInsightsPerformance assessments={completedAssessments} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendsSummary assessments={completedAssessments} />
              <InsightsSummary assessments={completedAssessments} />
            </div>
          </TabsContent>

          <TabsContent value="shared">
            <SharedResourcesList />
          </TabsContent>
        </Tabs>
        )}

        {/* Dashboard Builder Modal */}
        <DashboardBuilder
          isOpen={builderOpen}
          onClose={() => setBuilderOpen(false)}
          currentDashboard={customDashboard}
        />
      </div>
    </div>
  );
}