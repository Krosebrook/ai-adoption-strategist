import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function ROIForecastChart({ forecast }) {
  if (!forecast) return null;

  const chartData = [
    {
      year: 'Current',
      roi: 0,
      savings: 0
    },
    {
      year: 'Year 1',
      roi: forecast.year_1_forecast.roi_percentage,
      savings: forecast.year_1_forecast.savings,
      confidence: forecast.year_1_forecast.confidence
    },
    {
      year: 'Year 2',
      roi: forecast.year_2_forecast.roi_percentage,
      savings: forecast.year_2_forecast.savings,
      confidence: forecast.year_2_forecast.confidence
    },
    {
      year: 'Year 3',
      roi: forecast.year_3_forecast.roi_percentage,
      savings: forecast.year_3_forecast.savings,
      confidence: forecast.year_3_forecast.confidence
    }
  ];

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            ROI Forecast (3-Year Projection)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Savings ($)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="roi"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="ROI %"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={2}
                name="Savings ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[forecast.year_1_forecast, forecast.year_2_forecast, forecast.year_3_forecast].map((year, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Year {idx + 1}</h4>
                <Badge className={getConfidenceColor(year.confidence)}>
                  {year.confidence} confidence
                </Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-slate-600">Projected ROI</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {year.roi_percentage.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Projected Savings</div>
                  <div className="text-xl font-bold text-green-600">
                    ${year.savings.toLocaleString()}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Key Drivers:</div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {year.key_drivers?.slice(0, 2).map((driver, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cumulative Value & Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 mb-1">Total Savings (3 Years)</div>
              <div className="text-2xl font-bold text-blue-900">
                ${forecast.cumulative_value.total_savings.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Cumulative ROI</div>
              <div className="text-2xl font-bold text-green-900">
                {forecast.cumulative_value.total_roi.toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Payback Period</div>
              <div className="text-2xl font-bold text-purple-900">
                {forecast.cumulative_value.payback_months} months
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 mb-2">Growth Assumptions:</h5>
              <ul className="text-sm text-slate-700 space-y-1">
                {forecast.growth_assumptions?.map((assumption, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>

            {forecast.risk_factors?.length > 0 && (
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Risk Factors:
                </h5>
                <div className="space-y-2">
                  {forecast.risk_factors.map((risk, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          risk.impact === 'high' ? 'border-red-300 text-red-700' :
                          risk.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-blue-300 text-blue-700'
                        }>
                          {risk.impact}
                        </Badge>
                        <span className="font-medium text-slate-900">{risk.factor}</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1 ml-2">{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}