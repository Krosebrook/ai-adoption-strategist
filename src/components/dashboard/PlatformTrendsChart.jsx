import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function PlatformTrendsChart({ assessments }) {
  const [timeRange, setTimeRange] = useState('all');
  const [viewType, setViewType] = useState('timeline');

  const filterByTimeRange = (assessments) => {
    if (timeRange === 'all') return assessments;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return assessments;
    }
    
    return assessments.filter(a => new Date(a.created_date) >= cutoffDate);
  };

  const filteredAssessments = filterByTimeRange(assessments);

  // Timeline data - platform recommendations over time
  const getTimelineData = () => {
    const grouped = {};
    
    filteredAssessments.forEach(assessment => {
      const date = new Date(assessment.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          'Google Gemini': 0,
          'Microsoft Copilot': 0,
          'Anthropic Claude': 0,
          'OpenAI ChatGPT': 0
        };
      }
      
      const topPlatform = assessment.recommended_platforms?.[0]?.platform_name;
      if (topPlatform && grouped[monthKey][topPlatform] !== undefined) {
        grouped[monthKey][topPlatform]++;
      }
    });
    
    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  };

  // Distribution data - overall platform recommendation distribution
  const getDistributionData = () => {
    const counts = {
      'Google Gemini': 0,
      'Microsoft Copilot': 0,
      'Anthropic Claude': 0,
      'OpenAI ChatGPT': 0
    };
    
    filteredAssessments.forEach(assessment => {
      const topPlatform = assessment.recommended_platforms?.[0]?.platform_name;
      if (topPlatform && counts[topPlatform] !== undefined) {
        counts[topPlatform]++;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Average scores over time
  const getScoreData = () => {
    const grouped = {};
    
    filteredAssessments.forEach(assessment => {
      const date = new Date(assessment.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          avgScore: 0,
          count: 0
        };
      }
      
      const topScore = assessment.recommended_platforms?.[0]?.score;
      if (topScore) {
        grouped[monthKey].avgScore += topScore;
        grouped[monthKey].count++;
      }
    });
    
    return Object.values(grouped)
      .map(item => ({
        month: item.month,
        avgScore: item.count > 0 ? (item.avgScore / item.count).toFixed(1) : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const timelineData = getTimelineData();
  const distributionData = getDistributionData();
  const scoreData = getScoreData();

  const COLORS = ['#21808D', '#2974FF', '#8B5CF6', '#F59E0B'];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Platform Recommendation Trends
          </CardTitle>
          <div className="flex gap-2">
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timeline">Timeline</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
                <SelectItem value="scores">Avg Scores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No assessments in selected time range</p>
          </div>
        ) : (
          <>
            {viewType === 'timeline' && (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Google Gemini" stroke="#21808D" strokeWidth={2} />
                  <Line type="monotone" dataKey="Microsoft Copilot" stroke="#2974FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="Anthropic Claude" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="OpenAI ChatGPT" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {viewType === 'distribution' && (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {viewType === 'scores' && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#21808D" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}