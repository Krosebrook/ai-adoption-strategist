import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Users, TrendingUp, Calculator } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const PLATFORM_PRICING = {
  'Google Gemini': { base: 30, enterprise: 25, notes: 'Volume discounts available' },
  'Microsoft Copilot': { base: 30, enterprise: 30, notes: 'Included with E5 license' },
  'Anthropic Claude': { base: 35, enterprise: 30, notes: 'API usage based' },
  'OpenAI ChatGPT': { base: 25, enterprise: 20, notes: 'Enterprise tier required' }
};

export default function CostEstimationTool({ assessment, platforms }) {
  const [estimations, setEstimations] = useState(
    platforms.reduce((acc, platform) => {
      acc[platform] = {
        userCount: assessment.departments?.reduce((sum, d) => sum + (d.user_count || 0), 0) || 100,
        tier: 'enterprise',
        hoursPerMonth: 10
      };
      return acc;
    }, {})
  );

  const calculateROI = (platform) => {
    const est = estimations[platform];
    if (!est) return null;

    const pricing = PLATFORM_PRICING[platform];
    const costPerUser = pricing?.[est.tier] || pricing?.base || 30;
    
    const monthlyCost = est.userCount * costPerUser;
    const annualCost = monthlyCost * 12;
    
    // Calculate savings
    const avgHourlyRate = 50; // Average knowledge worker rate
    const annualHoursSaved = est.userCount * est.hoursPerMonth * 12;
    const annualSavings = annualHoursSaved * avgHourlyRate;
    
    const netSavings = annualSavings - annualCost;
    const roi = ((netSavings / annualCost) * 100);
    
    return {
      monthlyCost,
      annualCost,
      annualHoursSaved,
      annualSavings,
      netSavings,
      roi,
      paybackMonths: annualCost / (annualSavings / 12)
    };
  };

  const updateEstimation = (platform, field, value) => {
    setEstimations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: field === 'tier' ? value : Number(value)
      }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Custom Cost Estimation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Adjust user counts and usage patterns to get accurate ROI projections for your organization
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map(platform => {
          const est = estimations[platform];
          const roi = calculateROI(platform);
          const pricing = PLATFORM_PRICING[platform];

          return (
            <Card key={platform}>
              <CardHeader>
                <CardTitle className="text-lg">{platform}</CardTitle>
                <p className="text-xs text-slate-500">{pricing?.notes}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input Controls */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`${platform}-users`} className="text-sm">
                      Number of Users
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      <Input
                        id={`${platform}-users`}
                        type="number"
                        value={est?.userCount || 0}
                        onChange={(e) => updateEstimation(platform, 'userCount', e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`${platform}-tier`} className="text-sm">
                      Pricing Tier
                    </Label>
                    <Select
                      value={est?.tier}
                      onValueChange={(value) => updateEstimation(platform, 'tier', value)}
                    >
                      <SelectTrigger id={`${platform}-tier`} className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base">
                          Base (${pricing?.base || 30}/user/month)
                        </SelectItem>
                        <SelectItem value="enterprise">
                          Enterprise (${pricing?.enterprise || 25}/user/month)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`${platform}-hours`} className="text-sm">
                      Hours Saved per User/Month
                    </Label>
                    <Input
                      id={`${platform}-hours`}
                      type="number"
                      value={est?.hoursPerMonth || 0}
                      onChange={(e) => updateEstimation(platform, 'hoursPerMonth', e.target.value)}
                      min="1"
                      max="160"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Results */}
                {roi && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-sm">Projected Results</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Monthly Cost</div>
                        <div className="text-lg font-bold text-slate-900">
                          {formatCurrency(roi.monthlyCost)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Annual Cost</div>
                        <div className="text-lg font-bold text-slate-900">
                          {formatCurrency(roi.annualCost)}
                        </div>
                      </div>

                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-700 mb-1">Annual Savings</div>
                        <div className="text-lg font-bold text-green-900">
                          {formatCurrency(roi.annualSavings)}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-700 mb-1">Net Savings</div>
                        <div className="text-lg font-bold text-blue-900">
                          {formatCurrency(roi.netSavings)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Return on Investment
                        </span>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatPercentage(roi.roi, 1)}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Payback period: {roi.paybackMonths.toFixed(1)} months
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                      <strong>Assumptions:</strong> $50/hour avg. labor cost. 
                      Actual savings vary based on use cases and adoption rates.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}