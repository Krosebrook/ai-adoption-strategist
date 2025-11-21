import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

export default function FinancialForecast({ forecast }) {
  const chartData = forecast?.projected_costs?.map(year => ({
    year: `Year ${year.year}`,
    total: year.total_cost,
    licenses: year.breakdown?.platform_licenses,
    infrastructure: year.breakdown?.infrastructure,
    training: year.breakdown?.training,
    support: year.breakdown?.support
  })) || [];

  const totalProjected = forecast?.projected_costs?.reduce((sum, y) => sum + y.total_cost, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">5-Year Total</div>
            <div className="text-2xl font-bold text-slate-900">
              ${(totalProjected / 1000000).toFixed(2)}M
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Projected ROI (Y3)</div>
            <div className="text-2xl font-bold text-green-900">
              {forecast?.roi_projection?.year_3?.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Payback Period</div>
            <div className="text-2xl font-bold text-blue-900">
              {forecast?.payback_period}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">Cost Trajectory</div>
            <Badge className={`text-sm ${
              forecast?.cost_trajectory === 'decreasing' ? 'bg-green-600' :
              forecast?.cost_trajectory === 'stable' ? 'bg-blue-600' :
              'bg-orange-600'
            }`}>
              {forecast?.cost_trajectory === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
              {forecast?.cost_trajectory === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
              {forecast?.cost_trajectory}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Legend />
              <Bar dataKey="licenses" stackId="a" fill="#3b82f6" name="Licenses" />
              <Bar dataKey="infrastructure" stackId="a" fill="#8b5cf6" name="Infrastructure" />
              <Bar dataKey="training" stackId="a" fill="#10b981" name="Training" />
              <Bar dataKey="support" stackId="a" fill="#f59e0b" name="Support" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            ROI Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Year 1</div>
              <div className="text-2xl font-bold text-green-900">
                {forecast?.roi_projection?.year_1?.toFixed(0)}%
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Year 3</div>
              <div className="text-2xl font-bold text-green-900">
                {forecast?.roi_projection?.year_3?.toFixed(0)}%
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Year 5</div>
              <div className="text-2xl font-bold text-green-900">
                {forecast?.roi_projection?.year_5?.toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Drivers & Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Cost Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {forecast?.key_drivers?.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {driver}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forecast Assumptions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {forecast?.assumptions?.map((assumption, idx) => (
                <li key={idx} className="text-sm text-slate-700">• {assumption}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}