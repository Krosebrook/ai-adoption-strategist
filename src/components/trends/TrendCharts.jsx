import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function ReadinessTrendChart({ assessments }) {
  const data = assessments
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date))
    .map(a => ({
      date: new Date(a.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      readiness: a.ai_assessment_score?.readiness_score || 0,
      risk: 100 - (a.ai_assessment_score?.risk_score || 0),
      overall: a.ai_assessment_score?.overall_score || 0
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Readiness Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2} name="AI Readiness" />
            <Line type="monotone" dataKey="overall" stroke="#8b5cf6" strokeWidth={2} name="Overall Score" />
            <Line type="monotone" dataKey="risk" stroke="#10b981" strokeWidth={2} name="Risk Control" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ComplianceTrendChart({ assessments }) {
  const data = assessments
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date))
    .map(a => {
      const complianceScores = Object.values(a.compliance_scores || {});
      const avgCompliance = complianceScores.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / Math.max(complianceScores.length, 1);
      
      return {
        date: new Date(a.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        org: a.organization_name,
        compliance: avgCompliance
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Compliance Score Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Area type="monotone" dataKey="compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Avg Compliance" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function MaturityDistributionChart({ assessments }) {
  const maturityCounts = assessments.reduce((acc, a) => {
    const level = a.ai_assessment_score?.maturity_level || 'beginner';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { level: 'Beginner', count: maturityCounts.beginner || 0, color: '#3b82f6' },
    { level: 'Intermediate', count: maturityCounts.intermediate || 0, color: '#8b5cf6' },
    { level: 'Advanced', count: maturityCounts.advanced || 0, color: '#10b981' },
    { level: 'Expert', count: maturityCounts.expert || 0, color: '#f59e0b' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AI Maturity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" name="Organizations" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TrendIndicator({ value, previousValue, label }) {
  const change = value - previousValue;
  const percentChange = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;
  
  let Icon = Minus;
  let colorClass = 'text-slate-500';
  
  if (change > 0) {
    Icon = TrendingUp;
    colorClass = 'text-green-600';
  } else if (change < 0) {
    Icon = TrendingDown;
    colorClass = 'text-red-600';
  }

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <span className={`text-sm font-medium ${colorClass}`}>
        {change > 0 ? '+' : ''}{percentChange}%
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}