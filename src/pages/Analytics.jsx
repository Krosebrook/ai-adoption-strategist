import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FileText, Bell, Settings } from 'lucide-react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AutomatedReportDashboard from '../components/reports/AutomatedReportDashboard';
import PersonalizationPanel from '../components/personalization/PersonalizationPanel';
import AnomalyDetectorView from '../components/dashboard/AnomalyDetectorView';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(180deg, #7A8B99 0%, #9A9A8E 15%, #C9B896 30%, #E8C078 45%, #F5A623 60%, #E88A1D 75%, #C4A35A 90%, #D4B896 100%)`
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Analytics & Insights
            </h1>
            <p className="text-white/80 mt-1">
              AI-powered analytics, predictive insights, and comprehensive reporting
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-white" />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm">
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
            <AnomalyDetectorView />
          </TabsContent>

          <TabsContent value="settings">
            <PersonalizationPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}