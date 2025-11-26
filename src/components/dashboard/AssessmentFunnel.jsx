import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { FileText } from 'lucide-react';

export default function AssessmentFunnel({ assessments }) {
  const funnelData = useMemo(() => {
    const draft = assessments.filter(a => a.status === 'draft').length;
    const completed = assessments.filter(a => a.status === 'completed').length;
    
    // Platform distribution
    const platformCounts = {};
    assessments.forEach(a => {
      const platform = a.recommended_platforms?.[0]?.platform_name || 'Not Analyzed';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    const platformData = Object.entries(platformCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Maturity distribution
    const maturityCounts = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    assessments.forEach(a => {
      const level = a.ai_assessment_score?.maturity_level || 'beginner';
      maturityCounts[level] = (maturityCounts[level] || 0) + 1;
    });

    return {
      statusData: [
        { name: 'Draft', value: draft, color: '#9CA3AF' },
        { name: 'Completed', value: completed, color: '#22C55E' }
      ],
      platformData,
      maturityData: [
        { name: 'Beginner', value: maturityCounts.beginner, color: '#EF4444' },
        { name: 'Intermediate', value: maturityCounts.intermediate, color: '#F59E0B' },
        { name: 'Advanced', value: maturityCounts.advanced, color: '#3B82F6' },
        { name: 'Expert', value: maturityCounts.expert, color: '#22C55E' }
      ]
    };
  }, [assessments]);

  const PLATFORM_COLORS = ['#E88A1D', '#6B5B7A', '#D07612', '#C4A35A', '#7A8B99'];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <FileText className="h-5 w-5 text-blue-500" />
          Assessment Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Distribution */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-3">Top Recommended Platforms</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData.platformData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maturity Distribution */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-3">Maturity Levels</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelData.maturityData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {funnelData.maturityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
          {funnelData.statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
              <span className="text-sm text-slate-600">{item.name}: <strong>{item.value}</strong></span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}