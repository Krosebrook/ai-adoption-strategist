import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function AdoptionTrendsChart({ assessments, strategies, timeRange }) {
  const chartData = useMemo(() => {
    const now = new Date();
    let daysBack = 30;
    if (timeRange === '7d') daysBack = 7;
    if (timeRange === '90d') daysBack = 90;
    if (timeRange === 'all') daysBack = 365;

    const data = [];
    
    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const assessmentCount = assessments.filter(a => {
        const aDate = new Date(a.created_date).toISOString().split('T')[0];
        return aDate <= dateStr;
      }).length;

      const strategyCount = strategies.filter(s => {
        const sDate = new Date(s.created_date).toISOString().split('T')[0];
        return sDate <= dateStr;
      }).length;

      const activeStrategies = strategies.filter(s => {
        const sDate = new Date(s.created_date).toISOString().split('T')[0];
        return sDate <= dateStr && s.status === 'active';
      }).length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        assessments: assessmentCount,
        strategies: strategyCount,
        activeStrategies
      });
    }

    // Sample data points to avoid overcrowding
    const step = Math.max(1, Math.floor(data.length / 15));
    return data.filter((_, idx) => idx % step === 0 || idx === data.length - 1);
  }, [assessments, strategies, timeRange]);

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Adoption Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E88A1D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E88A1D" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStrategies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B5B7A" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6B5B7A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="assessments" 
                stroke="#E88A1D" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAssessments)"
                name="Assessments"
              />
              <Area 
                type="monotone" 
                dataKey="strategies" 
                stroke="#6B5B7A" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorStrategies)"
                name="Strategies"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}