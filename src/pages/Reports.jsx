import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Calendar, BarChart3, TrendingUp, GitCompare } from 'lucide-react';
import GroundedReportGenerator from '../components/reports/GroundedReportGenerator';
import AutomatedReportDashboard from '../components/reports/AutomatedReportDashboard';
import AssessmentSummaryReport from '../components/reports/AssessmentSummaryReport';
import ComparisonReportBuilder from '../components/reports/ComparisonReportBuilder';
import AdoptionTrendsInsights from '../components/reports/AdoptionTrendsInsights';

export default function ReportsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <FileText className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            Reports & Analytics
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            AI-powered reports — assessment summaries, platform comparisons, ROI visualizations, and adoption trend insights
          </p>
        </div>

        <Tabs defaultValue="assessment-summary" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="assessment-summary" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Assessment Summary
            </TabsTrigger>
            <TabsTrigger value="comparison-report" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Comparison Report
            </TabsTrigger>
            <TabsTrigger value="adoption-trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Adoption Trends
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Custom Report
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment-summary">
            <AssessmentSummaryReport />
          </TabsContent>

          <TabsContent value="comparison-report">
            <ComparisonReportBuilder />
          </TabsContent>

          <TabsContent value="adoption-trends">
            <AdoptionTrendsInsights />
          </TabsContent>

          <TabsContent value="generate">
            <GroundedReportGenerator />
          </TabsContent>

          <TabsContent value="scheduled">
            <AutomatedReportDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}