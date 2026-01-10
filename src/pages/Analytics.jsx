import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText, Bell, Settings } from 'lucide-react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AutomatedReportDashboard from '../components/reports/AutomatedReportDashboard';
import PersonalizationPanel from '../components/personalization/PersonalizationPanel';
import AnomalyDetector from '../components/dashboard/AnomalyDetector';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Analytics & Insights
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              AI-powered analytics, predictive insights, and comprehensive reporting
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts & Anomalies
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Personalization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <AutomatedReportDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <AnomalyDetector />
          </TabsContent>

          <TabsContent value="settings">
            <PersonalizationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}