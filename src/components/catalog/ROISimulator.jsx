import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Calculator, DollarSign, Users, Clock,
  Loader2, Zap, Link, AlertTriangle, CheckCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export default function ROISimulator({ platform }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputs, setInputs] = useState({
    num_users: 50,
    avg_hourly_rate: 65,
    adoption_rate: 70,          // % users actively using platform
    hours_saved_per_week: 5,
    efficiency_gain_pct: 20,    // % productivity improvement
    implementation_cost: 15000,
    integration_cost: 8000,     // API / SSO / data pipeline costs
    monthly_platform_cost: 800,
    training_cost_per_user: 200
  });
  const [roiResults, setRoiResults] = useState(null);

  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }));

  const calculateROI = async () => {
    setIsCalculating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an enterprise AI ROI analyst. Calculate a detailed, realistic ROI projection for adopting ${platform.name}.

User Inputs:
- Total Users: ${inputs.num_users}
- Average Hourly Rate: $${inputs.avg_hourly_rate}
- User Adoption Rate: ${inputs.adoption_rate}% (active users)
- Hours Saved Per Active User Per Week: ${inputs.hours_saved_per_week}
- Efficiency / Productivity Gain: ${inputs.efficiency_gain_pct}% improvement
- One-Time Implementation Cost: $${inputs.implementation_cost}
- Integration Cost (APIs, SSO, data pipelines): $${inputs.integration_cost}
- Monthly Platform License Cost: $${inputs.monthly_platform_cost}
- Training Cost Per User: $${inputs.training_cost_per_user}

Platform: ${platform.name} (${platform.category}, ${platform.tier})
Capabilities: ${platform.capabilities?.slice(0, 5).join(', ')}
Use Cases: ${platform.use_cases?.slice(0, 4).join(', ')}

Derive:
- Active users = total users × adoption rate
- Weekly time savings value = active users × hours saved × hourly rate
- Efficiency gain value = active users × hourly rate × 40h/week × efficiency_gain_pct (annualized)
- Total one-time costs = implementation + integration + (training × total users)
- Monthly recurring cost = monthly_platform_cost
- Provide 24-month breakdown (month 1–24) with: cumulative_cost, cumulative_savings, cumulative_net
- Scenarios: pessimistic (60% of inputs), base (100%), optimistic (130%)`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                annual_savings: { type: 'number' },
                total_one_time_cost: { type: 'number' },
                break_even_months: { type: 'number' },
                roi_12_months: { type: 'number' },
                roi_24_months: { type: 'number' },
                three_year_npv: { type: 'number' },
                active_users: { type: 'number' }
              }
            },
            monthly_timeline: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  month: { type: 'number' },
                  cumulative_cost: { type: 'number' },
                  cumulative_savings: { type: 'number' },
                  cumulative_net: { type: 'number' }
                }
              }
            },
            scenarios: {
              type: 'object',
              properties: {
                pessimistic: { type: 'object', properties: { roi_12: { type: 'number' }, break_even: { type: 'number' }, three_year_value: { type: 'number' } } },
                base: { type: 'object', properties: { roi_12: { type: 'number' }, break_even: { type: 'number' }, three_year_value: { type: 'number' } } },
                optimistic: { type: 'object', properties: { roi_12: { type: 'number' }, break_even: { type: 'number' }, three_year_value: { type: 'number' } } }
              }
            },
            cost_breakdown: {
              type: 'array',
              items: { type: 'object', properties: { category: { type: 'string' }, amount: { type: 'number' } } }
            },
            savings_breakdown: {
              type: 'array',
              items: { type: 'object', properties: { category: { type: 'string' }, amount: { type: 'number' } } }
            },
            risk_factors: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setRoiResults(response);
      toast.success('ROI simulation complete!');
    } catch (error) {
      toast.error('Failed to calculate ROI');
    } finally {
      setIsCalculating(false);
    }
  };

  const InputField = ({ label, icon: Icon, inputKey, type = 'number', min = 0 }) => (
    <div className="space-y-1">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
        {Icon && <Icon className="h-3.5 w-3.5" />}{label}
      </Label>
      <Input
        type={type} min={min}
        value={inputs[inputKey]}
        onChange={e => set(inputKey, parseFloat(e.target.value) || 0)}
        className="h-8 text-sm"
      />
    </div>
  );

  const SliderField = ({ label, icon: Icon, inputKey, min = 0, max, step = 1, suffix = '' }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
          {Icon && <Icon className="h-3.5 w-3.5" />}{label}
        </Label>
        <span className="text-xs font-semibold text-orange-600">{inputs[inputKey]}{suffix}</span>
      </div>
      <Slider
        value={[inputs[inputKey]]}
        onValueChange={([v]) => set(inputKey, v)}
        min={min} max={max} step={step}
      />
    </div>
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}
        className="border-green-200 text-green-700 hover:bg-green-50">
        <Calculator className="h-4 w-4 mr-1" />ROI
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              ROI Simulator — {platform.name}
            </DialogTitle>
            <p className="text-sm text-gray-500">Tailor parameters to your organization and generate an AI-powered projection.</p>
          </DialogHeader>

          <div className="grid md:grid-cols-5 gap-6 mt-2">
            {/* Inputs */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Users & Adoption</p>
                <InputField label="Total Users" icon={Users} inputKey="num_users" min={1} />
                <InputField label="Avg Hourly Rate ($)" icon={DollarSign} inputKey="avg_hourly_rate" min={1} />
                <SliderField label="Adoption Rate" icon={Users} inputKey="adoption_rate" min={10} max={100} step={5} suffix="%" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Efficiency Gains</p>
                <SliderField label="Hours Saved / User / Week" icon={Clock} inputKey="hours_saved_per_week" min={0} max={30} step={0.5} suffix="h" />
                <SliderField label="Productivity Gain" icon={Zap} inputKey="efficiency_gain_pct" min={0} max={60} step={5} suffix="%" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Costs</p>
                <InputField label="Implementation Cost ($)" inputKey="implementation_cost" />
                <InputField label="Integration Cost ($)" icon={Link} inputKey="integration_cost" />
                <InputField label="Monthly License ($)" icon={DollarSign} inputKey="monthly_platform_cost" />
                <InputField label="Training Cost / User ($)" inputKey="training_cost_per_user" />
              </div>

              <Button onClick={calculateROI} disabled={isCalculating}
                className="w-full bg-green-600 hover:bg-green-700 text-white">
                {isCalculating
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Simulating...</>
                  : <><Calculator className="h-4 w-4 mr-2" />Run Simulation</>}
              </Button>
            </div>

            {/* Results */}
            <div className="md:col-span-3 space-y-4">
              {!roiResults ? (
                <div className="h-full flex items-center justify-center min-h-[300px] text-gray-400 flex-col gap-3">
                  <Calculator className="h-14 w-14 opacity-30" />
                  <p className="text-sm">Set your parameters and run the simulation</p>
                </div>
              ) : (
                <>
                  {/* KPI Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Annual Savings', value: fmt(roiResults.summary?.annual_savings), color: 'bg-green-50 border-green-200 text-green-900' },
                      { label: 'Break-Even', value: `${roiResults.summary?.break_even_months}mo`, color: 'bg-blue-50 border-blue-200 text-blue-900' },
                      { label: '12-mo ROI', value: `${roiResults.summary?.roi_12_months}%`, color: 'bg-purple-50 border-purple-200 text-purple-900' },
                      { label: '24-mo ROI', value: `${roiResults.summary?.roi_24_months}%`, color: 'bg-orange-50 border-orange-200 text-orange-900' },
                      { label: '3-Year NPV', value: fmt(roiResults.summary?.three_year_npv), color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
                      { label: 'Active Users', value: roiResults.summary?.active_users, color: 'bg-slate-50 border-slate-200 text-slate-900' }
                    ].map(({ label, value, color }) => (
                      <Card key={label} className={`border ${color}`}>
                        <CardContent className="p-3">
                          <p className="text-xs mb-1 opacity-70">{label}</p>
                          <p className="text-lg font-bold">{value}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Cumulative Net Benefit Chart */}
                  {roiResults.monthly_timeline?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">24-Month Cumulative Net Benefit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={roiResults.monthly_timeline} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                            <defs>
                              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                            <Tooltip formatter={v => fmt(v)} />
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                            <Area type="monotone" dataKey="cumulative_savings" stroke="#10b981" fill="url(#netGrad)" name="Cumulative Savings" strokeWidth={2} />
                            <Area type="monotone" dataKey="cumulative_cost" stroke="#ef4444" fill="none" name="Cumulative Cost" strokeWidth={2} strokeDasharray="4 4" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Scenario Comparison */}
                  {roiResults.scenarios && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Scenario Comparison (12-mo ROI %)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart
                            data={['pessimistic', 'base', 'optimistic'].map(s => ({
                              name: s.charAt(0).toUpperCase() + s.slice(1),
                              'ROI %': roiResults.scenarios[s]?.roi_12 || 0,
                              'Break-Even (mo)': roiResults.scenarios[s]?.break_even || 0
                            }))}
                            margin={{ top: 5, right: 10, bottom: 0, left: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar dataKey="ROI %" fill="#E88A1D" radius={[4,4,0,0]} />
                            <Bar dataKey="Break-Even (mo)" fill="#6B5B7A" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cost vs Savings breakdown side by side */}
                  {(roiResults.cost_breakdown?.length > 0 || roiResults.savings_breakdown?.length > 0) && (
                    <div className="grid grid-cols-2 gap-3">
                      {roiResults.cost_breakdown?.length > 0 && (
                        <Card className="border-red-100">
                          <CardHeader className="pb-1"><CardTitle className="text-xs text-red-700">Cost Breakdown</CardTitle></CardHeader>
                          <CardContent className="space-y-1.5">
                            {roiResults.cost_breakdown.map((c, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{c.category}</span>
                                <span className="font-medium">{fmt(c.amount)}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                      {roiResults.savings_breakdown?.length > 0 && (
                        <Card className="border-green-100">
                          <CardHeader className="pb-1"><CardTitle className="text-xs text-green-700">Savings Breakdown</CardTitle></CardHeader>
                          <CardContent className="space-y-1.5">
                            {roiResults.savings_breakdown.map((s, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{s.category}</span>
                                <span className="font-medium text-green-700">{fmt(s.amount)}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Risks + Recommendations */}
                  <div className="grid grid-cols-2 gap-3">
                    {roiResults.recommendations?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-semibold text-xs text-blue-900 mb-2 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />Recommendations
                        </p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {roiResults.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
                        </ul>
                      </div>
                    )}
                    {roiResults.risk_factors?.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="font-semibold text-xs text-yellow-900 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />Risk Factors
                        </p>
                        <ul className="text-xs text-yellow-800 space-y-1">
                          {roiResults.risk_factors.map((r, i) => <li key={i}>• {r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}