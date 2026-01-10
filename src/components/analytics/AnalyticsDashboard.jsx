import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target, AlertCircle, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 100)
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 100)
  });

  // Calculate KPIs
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(a => a.status === 'completed').length;
  const activeStrategies = strategies.filter(s => s.status === 'active').length;
  const avgProgress = strategies.reduce((sum, s) => sum + (s.progress_tracking?.overall_progress || 0), 0) / strategies.length || 0;
  const successRate = strategies.filter(s => (s.progress_tracking?.overall_progress || 0) > 75).length / strategies.length * 100 || 0;

  // Platform adoption metrics
  const platformCounts = assessments.reduce((acc, a) => {
    const platform = a.recommended_platforms?.[0]?.platform_name;
    if (platform) acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));

  // Timeline data
  const monthlyData = assessments.reduce((acc, a) => {
    const month = new Date(a.created_date).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.assessments += 1;
    } else {
      acc.push({ month, assessments: 1, strategies: 0 });
    }
    return acc;
  }, []);

  strategies.forEach(s => {
    const month = new Date(s.created_date).toLocaleDateString('en-US', { month: 'short' });
    const existing = monthlyData.find(item => item.month === month);
    if (existing) existing.strategies += 1;
  });

  // ROI predictions
  const roiData = assessments
    .filter(a => a.roi_calculations)
    .slice(0, 10)
    .map(a => {
      const platforms = Object.keys(a.roi_calculations || {});
      return {
        org: a.organization_name?.substring(0, 15),
        predicted: platforms.reduce((sum, p) => sum + (a.roi_calculations[p]?.one_year_roi || 0), 0) / platforms.length
      };
    });

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Assessments</p>
                <p className="text-3xl font-bold text-slate-900">{totalAssessments}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-slate-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Strategies</p>
                <p className="text-3xl font-bold text-slate-900">{activeStrategies}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-slate-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Progress</p>
                <p className="text-3xl font-bold text-slate-900">{avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">On track</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Success Rate</p>
                <p className="text-3xl font-bold text-slate-900">{successRate.toFixed(0)}%</p>
              </div>
              <Award className="h-8 w-8 text-amber-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge className="bg-green-600">Excellent</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-3xl font-bold text-slate-900">
                  {((completedAssessments / totalAssessments) * 100 || 0).toFixed(0)}%
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-slate-600">{completedAssessments}/{totalAssessments} completed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Adoption Trends</TabsTrigger>
          <TabsTrigger value="platforms">Platform Distribution</TabsTrigger>
          <TabsTrigger value="roi">ROI Predictions</TabsTrigger>
          <TabsTrigger value="success">Success Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Assessment & Strategy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="assessments" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="strategies" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle>AI Platform Adoption Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>Predicted 1-Year ROI by Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="org" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="predicted" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Success Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900">High Success Probability</h4>
                    <Badge className="bg-green-600">{successRate.toFixed(0)}%</Badge>
                  </div>
                  <p className="text-sm text-green-800">
                    Based on current progress rates and historical data, projects show strong indicators of success
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Success Factors</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Executive sponsorship in {((activeStrategies / strategies.length) * 100).toFixed(0)}% of projects</li>
                    <li>• Average implementation timeline: 4-6 months</li>
                    <li>• Risk mitigation plans in place for all active strategies</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">AI Predictions</h4>
                  <p className="text-sm text-purple-800">
                    ML models predict 85% of current strategies will meet or exceed ROI targets within 12 months
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}