import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Calendar } from 'lucide-react';
import GroundedReportGenerator from '../components/reports/GroundedReportGenerator';
import AutomatedReportDashboard from '../components/reports/AutomatedReportDashboard';

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
            Generate AI-powered reports with current best practices and market insights
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Report
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Reports
            </TabsTrigger>
          </TabsList>

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