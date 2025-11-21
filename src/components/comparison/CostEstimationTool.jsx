import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, TrendingUp, Calculator, Sparkles, Loader2, Lightbulb, AlertCircle, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { generateCostOptimization } from './CostOptimizationEngine';
import { toast } from 'sonner';

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
  const [optimization, setOptimization] = useState(null);
  const [loadingOptimization, setLoadingOptimization] = useState(false);

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
      paybackMonths: annualCost / (annualSavings / 12),
      totalAnnualCost: annualCost,
      perUserCost: costPerUser,
      licensingModel: est.tier
    };
  };

  const handleGenerateOptimization = async () => {
    setLoadingOptimization(true);
    try {
      const costEstimates = {};
      platforms.forEach(platform => {
        costEstimates[platform] = calculateROI(platform);
      });

      const optimizationResults = await generateCostOptimization(assessment, platforms, costEstimates);
      setOptimization(optimizationResults);
      toast.success('Cost optimization strategies generated!');
    } catch (error) {
      console.error('Failed to generate optimization:', error);
      toast.error('Failed to generate optimization strategies');
    } finally {
      setLoadingOptimization(false);
    }
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
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Custom Cost Estimation
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Adjust user counts and usage patterns to get accurate ROI projections
              </p>
            </div>
            <Button
              onClick={handleGenerateOptimization}
              disabled={loadingOptimization}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            >
              {loadingOptimization ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Cost Optimization
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* AI Optimization Results */}
      {optimization && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Lightbulb className="h-5 w-5" />
              AI Cost Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="licensing">Licensing</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
                <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                {optimization.total_savings_potential && (
                  <div className="bg-white border-2 border-green-300 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-1">Total Savings Potential</h4>
                        <div className="text-3xl font-bold text-green-900">
                          {formatCurrency(optimization.total_savings_potential.estimated_annual_savings)}
                          <span className="text-lg text-green-700 ml-2">
                            ({optimization.total_savings_potential.percentage_reduction.toFixed(1)}% reduction)
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        {optimization.total_savings_potential.confidence_level} confidence
                      </Badge>
                    </div>
                  </div>
                )}

                {optimization.quick_wins && optimization.quick_wins.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Quick Wins
                    </h4>
                    <div className="space-y-2">
                      {optimization.quick_wins.map((win, idx) => (
                        <div key={idx} className="bg-white border border-green-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-medium text-slate-900">{win.action}</p>
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              {formatCurrency(win.savings)}
                            </Badge>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-600">
                            <span>Effort: {win.effort}</span>
                            <span>Timeline: {win.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optimization.implementation_priority && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Implementation Priority</h4>
                    <ol className="space-y-1 list-decimal list-inside">
                      {optimization.implementation_priority.map((priority, idx) => (
                        <li key={idx} className="text-sm text-slate-700">{priority}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="licensing">
                <div className="space-y-3">
                  {optimization.licensing_optimizations?.map((opt, idx) => (
                    <div key={idx} className="bg-white border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-semibold text-slate-900">{opt.platform}</h5>
                          <p className="text-sm text-slate-600 mt-1">{opt.strategy}</p>
                        </div>
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {formatCurrency(opt.savings)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-slate-500">Current: </span>
                          <span className="font-medium">{formatCurrency(opt.current_cost)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Optimized: </span>
                          <span className="font-medium">{formatCurrency(opt.optimized_cost)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Effort: </span>
                          <Badge variant="outline" className="text-xs">{opt.implementation_effort}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">{opt.details}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features">
                <div className="space-y-3">
                  {optimization.feature_optimizations?.map((feat, idx) => (
                    <div key={idx} className="bg-white border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{feat.feature_category}</h5>
                        <div className="flex gap-2">
                          <Badge variant="outline">{formatCurrency(feat.potential_savings)}</Badge>
                          <Badge className={
                            feat.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                            feat.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {feat.risk_level} risk
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{feat.recommendation}</p>
                      <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        <strong>Alternative:</strong> {feat.alternative_approach}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="deployment">
                <div className="space-y-3">
                  {optimization.deployment_strategies?.map((strategy, idx) => (
                    <div key={idx} className="bg-white border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{strategy.strategy}</h5>
                        <Badge variant="outline">{strategy.suitability_score}/10</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{strategy.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Cost Impact: </span>
                          <span className="font-medium">{strategy.cost_impact}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timeline: </span>
                          <span className="font-medium">{strategy.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="negotiation">
                <div className="space-y-4">
                  {optimization.negotiation_tips?.map((tip, idx) => (
                    <div key={idx} className="bg-white border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-slate-900 mb-2">{tip.platform}</h5>
                      <p className="text-sm text-slate-700 mb-2">{tip.tactic}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-green-50 p-2 rounded">
                          <span className="text-slate-600">Expected Discount: </span>
                          <span className="font-medium text-green-700">{tip.expected_discount}</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="text-slate-600">Best Timing: </span>
                          <span className="font-medium text-blue-700">{tip.best_timing}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {optimization.alternative_solutions && optimization.alternative_solutions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Alternative Solutions
                      </h4>
                      {optimization.alternative_solutions.map((alt, idx) => (
                        <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                          <div className="flex items-start justify-between mb-1">
                            <h5 className="font-semibold text-amber-900">{alt.use_case}</h5>
                          </div>
                          <p className="text-sm text-amber-800 mb-2">
                            <strong>Alternative:</strong> {alt.alternative}
                          </p>
                          <p className="text-xs text-amber-700 mb-2">{alt.cost_comparison}</p>
                          <div className="text-xs text-amber-700">
                            <strong>Trade-offs:</strong> {alt.trade_offs?.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

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