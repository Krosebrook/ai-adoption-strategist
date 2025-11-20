import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export default function ROIOverviewWidget({ assessments }) {
  const roiData = assessments
    .filter(a => a.roi_calculations)
    .slice(0, 5)
    .map(a => {
      const topPlatform = a.recommended_platforms?.[0];
      const platformKey = topPlatform?.platform?.toLowerCase().replace(/ /g, '_');
      const roi = a.roi_calculations?.[platformKey];
      
      return {
        name: a.organization_name?.slice(0, 15) || 'Assessment',
        roi: roi?.one_year_roi || 0,
        savings: roi?.total_annual_savings || 0
      };
    });

  const avgROI = roiData.length > 0 
    ? roiData.reduce((sum, d) => sum + d.roi, 0) / roiData.length 
    : 0;
  const totalSavings = roiData.reduce((sum, d) => sum + d.savings, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          ROI Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-700 mb-1">Avg ROI</div>
            <div className="text-xl font-bold text-green-900">{formatPercentage(avgROI, 1)}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">Total Savings</div>
            <div className="text-xl font-bold text-blue-900">{formatCurrency(totalSavings)}</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Bar dataKey="roi" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}