import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

export default function ROIChart({ roiData }) {
  const chartData = roiData.map(roi => {
    const platform = AI_PLATFORMS.find(p => p.id === roi.platform);
    return {
      name: platform?.name || roi.platform,
      'Net Annual Savings': roi.net_annual_savings,
      '1-Year ROI %': roi.one_year_roi,
      color: platform?.color
    };
  });

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="h-5 w-5" />
          ROI Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value > 1000 ? `$${(value/1000).toFixed(0)}K` : `${value.toFixed(0)}`;
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="Net Annual Savings" fill="#64748b" />
            <Bar dataKey="1-Year ROI %" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}