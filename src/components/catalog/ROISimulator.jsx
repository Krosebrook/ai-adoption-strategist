import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Calculator, DollarSign, Users, Clock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ROISimulator({ platform }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputs, setInputs] = useState({
    num_users: 10,
    avg_hourly_rate: 50,
    hours_saved_per_week: 5,
    implementation_cost: 5000,
    monthly_platform_cost: 500
  });
  const [roiResults, setRoiResults] = useState(null);

  const calculateROI = async () => {
    setIsCalculating(true);
    try {
      const prompt = `Calculate detailed ROI for adopting ${platform.name} with the following parameters:

Number of Users: ${inputs.num_users}
Average Hourly Rate: $${inputs.avg_hourly_rate}
Hours Saved Per User Per Week: ${inputs.hours_saved_per_week}
Implementation Cost: $${inputs.implementation_cost}
Monthly Platform Cost: $${inputs.monthly_platform_cost}

Platform Details:
- Category: ${platform.category}
- Capabilities: ${platform.capabilities?.join(', ')}
- Use Cases: ${platform.use_cases?.join(', ')}

Provide:
1. Annual cost savings
2. Break-even timeline (months)
3. 1-year ROI percentage
4. 3-year projected value
5. Monthly breakdown for first 12 months (cost, savings, net benefit)
6. Risk factors
7. Optimization recommendations`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            annual_savings: { type: "number" },
            break_even_months: { type: "number" },
            roi_percentage: { type: "number" },
            three_year_value: { type: "number" },
            monthly_breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "number" },
                  cost: { type: "number" },
                  savings: { type: "number" },
                  net_benefit: { type: "number" }
                }
              }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRoiResults(response);
      toast.success('ROI calculation complete!');
    } catch (error) {
      console.error('Error calculating ROI:', error);
      toast.error('Failed to calculate ROI');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        <Calculator className="h-4 w-4 mr-2" />
        Simulate ROI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              ROI Simulator - {platform.name}
            </DialogTitle>
            <p className="text-sm text-slate-600">
              Estimate potential return on investment for your organization
            </p>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Users
                </Label>
                <Input
                  type="number"
                  value={inputs.num_users}
                  onChange={(e) => setInputs({ ...inputs, num_users: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Average Hourly Rate ($)
                </Label>
                <Input
                  type="number"
                  value={inputs.avg_hourly_rate}
                  onChange={(e) => setInputs({ ...inputs, avg_hourly_rate: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hours Saved Per User/Week
                </Label>
                <Slider
                  value={[inputs.hours_saved_per_week]}
                  onValueChange={([value]) => setInputs({ ...inputs, hours_saved_per_week: value })}
                  min={1}
                  max={40}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-slate-600 text-right">{inputs.hours_saved_per_week} hours</p>
              </div>

              <div className="space-y-2">
                <Label>Implementation Cost ($)</Label>
                <Input
                  type="number"
                  value={inputs.implementation_cost}
                  onChange={(e) => setInputs({ ...inputs, implementation_cost: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Platform Cost ($)</Label>
                <Input
                  type="number"
                  value={inputs.monthly_platform_cost}
                  onChange={(e) => setInputs({ ...inputs, monthly_platform_cost: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <Button
                onClick={calculateROI}
                disabled={isCalculating}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate ROI
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {roiResults ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <p className="text-xs text-green-700 mb-1">Annual Savings</p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(roiResults.annual_savings)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-xs text-blue-700 mb-1">Break-Even</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {roiResults.break_even_months} mo
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4">
                        <p className="text-xs text-purple-700 mb-1">1-Year ROI</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {roiResults.roi_percentage}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <p className="text-xs text-orange-700 mb-1">3-Year Value</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {formatCurrency(roiResults.three_year_value)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {roiResults.monthly_breakdown && roiResults.monthly_breakdown.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">12-Month Projection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={roiResults.monthly_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="savings" fill="#10b981" name="Savings" />
                            <Bar dataKey="cost" fill="#ef4444" name="Costs" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {roiResults.recommendations && roiResults.recommendations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-semibold text-sm text-blue-900 mb-2">Recommendations:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {roiResults.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {roiResults.risk_factors && roiResults.risk_factors.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-semibold text-sm text-yellow-900 mb-2">Risk Factors:</p>
                        <ul className="text-xs text-yellow-800 space-y-1">
                          {roiResults.risk_factors.map((risk, idx) => (
                            <li key={idx}>• {risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-slate-500">
                  <div>
                    <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Enter your parameters and click Calculate ROI</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}