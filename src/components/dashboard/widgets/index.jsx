import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, AlertTriangle, FileText, DollarSign, Activity, Clock, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ROIOverviewWidget from './ROIOverviewWidget';
import AnomalyAlertsWidget from './AnomalyAlertsWidget';
import { PLATFORM_COLORS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';

// Platform Trends Widget
export function PlatformTrendsWidget({ assessments }) {
  const platformCounts = assessments.reduce((acc, a) => {
    const topPlatform = a.recommended_platforms?.[0]?.platform_name;
    if (topPlatform) {
      acc[topPlatform] = (acc[topPlatform] || 0) + 1;
    }
    return acc;
  }, {});

  const data = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Platform Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((entry, index) => (
                <Cell key={index} fill={PLATFORM_COLORS[entry.name] || '#888'} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Compliance Matrix Widget
export function ComplianceMatrixWidget({ assessments }) {
  const avgCompliance = assessments
    .filter(a => a.compliance_scores)
    .map(a => {
      const scores = Object.values(a.compliance_scores || {});
      return scores.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scores.length;
    });

  const avg = avgCompliance.length > 0 
    ? avgCompliance.reduce((sum, v) => sum + v, 0) / avgCompliance.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Compliance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-green-600 mb-2">{avg.toFixed(1)}%</div>
          <p className="text-sm text-slate-600">Average Compliance Score</p>
          <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${avg}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Risk Indicators Widget
export function RiskIndicatorsWidget({ assessments }) {
  const risks = assessments.filter(a => a.compliance_scores).flatMap(a => {
    return Object.entries(a.compliance_scores || {}).flatMap(([platform, scores]) => {
      return Object.entries(scores.requirements || {})
        .filter(([_, req]) => req.status === 'partial' || req.status === 'not_compliant')
        .map(([name, req]) => ({ platform, requirement: name, status: req.status }));
    });
  });

  const highRisk = risks.filter(r => r.status === 'not_compliant').length;
  const mediumRisk = risks.filter(r => r.status === 'partial').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-red-900">High Risk</span>
            <span className="text-2xl font-bold text-red-600">{highRisk}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <span className="text-sm font-medium text-amber-900">Medium Risk</span>
            <span className="text-2xl font-bold text-amber-600">{mediumRisk}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Assessments Widget
export function RecentAssessmentsWidget({ assessments }) {
  const recent = assessments.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Recent Assessments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recent.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium text-slate-900">{a.organization_name}</p>
                <p className="text-xs text-slate-500">{formatDate(a.created_date)}</p>
              </div>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {a.status}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Cost Comparison Widget
export function CostComparisonWidget({ assessments }) {
  const costData = assessments
    .filter(a => a.roi_calculations)
    .slice(0, 5)
    .map(a => {
      const topPlatform = a.recommended_platforms?.[0];
      const platformKey = topPlatform?.platform?.toLowerCase().replace(/ /g, '_');
      const roi = a.roi_calculations?.[platformKey];
      
      return {
        name: a.organization_name?.slice(0, 15) || 'Assessment',
        cost: roi?.total_cost || 0,
        savings: roi?.total_annual_savings || 0
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Cost vs Savings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" />
            <Line type="monotone" dataKey="savings" stroke="#10b981" name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Adoption Rate Widget
export function AdoptionRateWidget({ assessments }) {
  const monthlyData = assessments.reduce((acc, a) => {
    const month = new Date(a.created_date).toLocaleDateString('en', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Adoption Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Time to Value Widget
export function TimeToValueWidget({ assessments }) {
  const avgDaysToComplete = assessments
    .filter(a => a.status === 'completed')
    .map(a => {
      const created = new Date(a.created_date);
      const completed = new Date(a.assessment_date || a.updated_date);
      return Math.floor((completed - created) / (1000 * 60 * 60 * 24));
    });

  const avg = avgDaysToComplete.length > 0 
    ? avgDaysToComplete.reduce((sum, v) => sum + v, 0) / avgDaysToComplete.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time to Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl font-bold text-purple-600 mb-2">{avg.toFixed(0)}</div>
          <p className="text-sm text-slate-600">Days to Complete Assessment</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Export all widgets
export { ROIOverviewWidget, AnomalyAlertsWidget };