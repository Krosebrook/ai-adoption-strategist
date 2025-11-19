import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function TrendAnalysis({ assessments }) {
  const [timeRange, setTimeRange] = useState('all');
  const [metric, setMetric] = useState('roi');

  const filteredAssessments = assessments.filter(a => {
    if (timeRange === 'all') return true;
    const date = new Date(a.assessment_date || a.created_date);
    const now = new Date();
    const monthsAgo = parseInt(timeRange);
    const cutoff = new Date(now.setMonth(now.getMonth() - monthsAgo));
    return date >= cutoff;
  });

  const chartData = filteredAssessments
    .map(assessment => {
      const topPlatform = assessment.recommended_platforms?.[0];
      const roi = assessment.roi_calculations?.[topPlatform?.platform];
      const compliance = assessment.compliance_scores?.[topPlatform?.platform];
      
      return {
        date: new Date(assessment.assessment_date || assessment.created_date).toLocaleDateString(),
        organization: assessment.organization_name,
        roi: roi?.one_year_roi || 0,
        savings: (roi?.net_annual_savings || 0) / 1000,
        compliance: compliance?.compliance_score || 0,
        score: topPlatform?.score || 0
      };
    })
    .reverse();

  const getMetricConfig = () => {
    switch(metric) {
      case 'roi':
        return { dataKey: 'roi', name: 'ROI %', color: 'var(--color-teal-500)', suffix: '%' };
      case 'savings':
        return { dataKey: 'savings', name: 'Savings (K)', color: 'var(--color-teal-600)', suffix: 'K' };
      case 'compliance':
        return { dataKey: 'compliance', name: 'Compliance %', color: 'var(--color-teal-400)', suffix: '%' };
      case 'score':
        return { dataKey: 'score', name: 'Overall Score', color: 'var(--color-primary)', suffix: '' };
      default:
        return { dataKey: 'roi', name: 'ROI %', color: 'var(--color-teal-500)', suffix: '%' };
    }
  };

  const metricConfig = getMetricConfig();

  return (
    <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            Trends Over Time
          </CardTitle>
          <div className="flex gap-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roi">ROI</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="score">Overall Score</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="3">Last 3M</SelectItem>
                <SelectItem value="6">Last 6M</SelectItem>
                <SelectItem value="12">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--color-surface)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey={metricConfig.dataKey} 
                stroke={metricConfig.color}
                fillOpacity={1}
                fill="url(#colorMetric)"
                name={metricConfig.name}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12" style={{ color: 'var(--color-text-secondary)' }}>
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No data available for the selected time range</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}