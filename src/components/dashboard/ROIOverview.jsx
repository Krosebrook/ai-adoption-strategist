import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DollarSign, TrendingUp, PiggyBank, ChevronRight } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

export default function ROIOverview({ roiData, assessmentId }) {
  // Sort by net annual savings
  const topROIPlatforms = [...roiData]
    .sort((a, b) => b.net_annual_savings - a.net_annual_savings)
    .slice(0, 3);

  const totalPotentialSavings = roiData.reduce((sum, roi) => sum + roi.net_annual_savings, 0);
  const avgROI = roiData.reduce((sum, roi) => sum + roi.one_year_roi, 0) / roiData.length;

  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Financial Impact Overview
        </CardTitle>
        <Link to={createPageUrl('Results') + `?id=${assessmentId}`}>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
            Full Analysis
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">Total Potential Savings</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              ${(totalPotentialSavings / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-green-600 mt-1">Across all platforms</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">Average ROI</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {avgROI.toFixed(0)}%
            </p>
            <p className="text-xs text-blue-600 mt-1">First-year return</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <p className="text-sm text-purple-700 font-medium">Best Case Scenario</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              ${(topROIPlatforms[0]?.net_annual_savings / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-purple-600 mt-1">Annual net savings</p>
          </div>
        </div>

        {/* Top 3 ROI Platforms */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Top ROI Performers</h4>
          <div className="space-y-3">
            {topROIPlatforms.map((roi, index) => {
              const platform = AI_PLATFORMS.find(p => p.id === roi.platform);
              return (
                <div key={roi.platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" 
                         style={{ backgroundColor: platform?.color }}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{platform?.name}</p>
                      <p className="text-xs text-slate-500">
                        {roi.one_year_roi.toFixed(0)}% ROI · ${(roi.total_annual_savings / 1000).toFixed(0)}K gross savings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      ${(roi.net_annual_savings / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-slate-500">net/year</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}