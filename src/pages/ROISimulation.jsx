import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  TrendingUp, Calculator, DollarSign, Users, Clock, Zap, Link,
  Loader2, CheckCircle, AlertTriangle, BarChart3, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
const COLORS = ['#E88A1D', '#6B5B7A', '#2563eb', '#16a34a', '#dc2626'];

export default function ROISimulation() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [inputs, setInputs] = useState({
    num_users: 100,
    avg_hourly_rate: 65,
    adoption_rate: 70,
    hours_saved_per_week: 6,
    efficiency_gain_pct: 25,
    implementation_cost: 20000,
    integration_cost: 10000,
    monthly_platform_cost: 1000,
    training_cost_per_user: 250
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: platforms = [] } = useQuery({
    queryKey: ['aiPlatforms-roi'],
    queryFn: () => base44.entities.AIPlatform.list('-overall_score', 30),
    initialData: []
  });

  const selectedPlatforms = platforms.filter(p => selectedIds.includes(p.id));

  const togglePlatform = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 4 ? [...prev, id]
        : (toast.error('Max 4 platforms for comparison'), prev)
    );
  };

  const set = (key, val) => setInputs(prev => ({ ...prev, [key]: val }));

  const runSimulation = async () => {
    if (selectedPlatforms.length === 0) { toast.error('Select at least one platform'); return; }
    setLoading(true);
    try {
      const platformSummaries = selectedPlatforms.map(p => ({
        name: p.name,
        category: p.category,
        tier: p.tier,
        overall_score: p.overall_score,
        capabilities: p.capabilities?.slice(0, 4),
        use_cases: p.use_cases?.slice(0, 3),
        pricing: p.pricing,
        pricing_value: p.pricing_value
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an enterprise AI ROI analyst. Simulate ROI projections for multiple AI platforms with identical org parameters, so results are comparable.

Organization Parameters:
- Total Users: ${inputs.num_users}
- Average Hourly Rate: $${inputs.avg_hourly_rate}
- User Adoption Rate: ${inputs.adoption_rate}%
- Hours Saved Per Active User Per Week: ${inputs.hours_saved_per_week}h
- Productivity Efficiency Gain: ${inputs.efficiency_gain_pct}%
- One-Time Implementation Cost: $${inputs.implementation_cost}
- Integration Cost (APIs, SSO, data pipelines): $${inputs.integration_cost}
- Monthly Platform License: $${inputs.monthly_platform_cost}
- Training Cost Per User: $${inputs.training_cost_per_user}

Platforms to evaluate:
${JSON.stringify(platformSummaries, null, 2)}

For EACH platform independently:
1. Adjust savings/costs slightly based on platform tier, score, and category (e.g. Enterprise tier reduces risk, Foundation tier may have higher productivity gains)
2. Calculate 24-month cumulative net benefit timeline
3. Derive pessimistic/base/optimistic scenarios

Return structured JSON with one entry per platform. The 24-month timeline should reflect realistic ramp-up (adoption grows from 50% → full rate over first 3 months).`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            platforms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  platform_name: { type: 'string' },
                  summary: {
                    type: 'object',
                    properties: {
                      annual_savings: { type: 'number' },
                      total_one_time_cost: { type: 'number' },
                      break_even_months: { type: 'number' },
                      roi_12_months: { type: 'number' },
                      roi_24_months: { type: 'number' },
                      three_year_npv: { type: 'number' }
                    }
                  },
                  monthly_timeline: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        month: { type: 'number' },
                        cumulative_net: { type: 'number' },
                        cumulative_savings: { type: 'number' },
                        cumulative_cost: { type: 'number' }
                      }
                    }
                  },
                  scenarios: {
                    type: 'object',
                    properties: {
                      pessimistic_roi_12: { type: 'number' },
                      base_roi_12: { type: 'number' },
                      optimistic_roi_12: { type: 'number' },
                      pessimistic_3yr: { type: 'number' },
                      base_3yr: { type: 'number' },
                      optimistic_3yr: { type: 'number' }
                    }
                  },
                  radar_scores: {
                    type: 'object',
                    properties: {
                      time_savings: { type: 'number' },
                      productivity: { type: 'number' },
                      adoption_ease: { type: 'number' },
                      integration_complexity: { type: 'number' },
                      cost_efficiency: { type: 'number' }
                    }
                  },
                  key_insight: { type: 'string' },
                  top_risk: { type: 'string' }
                }
              }
            },
            comparative_insight: { type: 'string' }
          }
        }
      });

      setResults(response);
      toast.success('ROI simulation complete!');
    } catch (error) {
      toast.error('Simulation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Build combined 24-month chart data for all platforms
  const combinedTimeline = results?.platforms?.length > 0
    ? Array.from({ length: 24 }, (_, i) => {
        const month = i + 1;
        const row = { month };
        results.platforms.forEach(p => {
          const point = p.monthly_timeline?.find(t => t.month === month);
          row[p.platform_name] = point?.cumulative_net || 0;
        });
        return row;
      })
    : [];

  const roiBarData = results?.platforms?.map(p => ({
    name: p.platform_name?.slice(0, 12),
    '12-mo ROI%': p.summary?.roi_12_months || 0,
    '24-mo ROI%': p.summary?.roi_24_months || 0,
  })) || [];

  const breakEvenData = results?.platforms?.map(p => ({
    name: p.platform_name?.slice(0, 12),
    'Break-Even (mo)': p.summary?.break_even_months || 0,
    '3-Year NPV ($k)': Math.round((p.summary?.three_year_npv || 0) / 1000)
  })) || [];

  const scenarioData = results?.platforms?.flatMap(p => [
    { platform: p.platform_name?.slice(0, 10), scenario: 'Pessimistic', roi: p.scenarios?.pessimistic_roi_12 || 0 },
    { platform: p.platform_name?.slice(0, 10), scenario: 'Base', roi: p.scenarios?.base_roi_12 || 0 },
    { platform: p.platform_name?.slice(0, 10), scenario: 'Optimistic', roi: p.scenarios?.optimistic_roi_12 || 0 }
  ]) || [];

  const radarData = ['time_savings', 'productivity', 'adoption_ease', 'integration_complexity', 'cost_efficiency'].map(attr => {
    const row = { subject: attr.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
    results?.platforms?.forEach(p => { row[p.platform_name] = p.radar_scores?.[attr] || 0; });
    return row;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="h-8 w-8 text-green-600" />
            AI-Powered ROI Simulation
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Configure your organization's parameters and simulate ROI projections across multiple AI platforms.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* === LEFT: Inputs === */}
          <div className="space-y-4">
            {/* Platform selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  Select Platforms (max 4)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {platforms.map(p => (
                    <div key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                        selectedIds.includes(p.id) ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <Checkbox checked={selectedIds.includes(p.id)} readOnly className="flex-shrink-0" />
                      <span className="truncate">{p.name}</span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{p.tier}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Users & Adoption */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Users & Adoption</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><Users className="h-3.5 w-3.5" />Total Users</Label>
                  <Input type="number" min={1} value={inputs.num_users} onChange={e => set('num_users', +e.target.value || 1)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Avg Hourly Rate ($)</Label>
                  <Input type="number" min={1} value={inputs.avg_hourly_rate} onChange={e => set('avg_hourly_rate', +e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Users className="h-3.5 w-3.5" />Adoption Rate</Label>
                    <span className="text-xs font-bold text-orange-600">{inputs.adoption_rate}%</span>
                  </div>
                  <Slider value={[inputs.adoption_rate]} onValueChange={([v]) => set('adoption_rate', v)} min={10} max={100} step={5} />
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Gains */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Efficiency Gains</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Hours Saved / User / Week</Label>
                    <span className="text-xs font-bold text-orange-600">{inputs.hours_saved_per_week}h</span>
                  </div>
                  <Slider value={[inputs.hours_saved_per_week]} onValueChange={([v]) => set('hours_saved_per_week', v)} min={0} max={30} step={0.5} />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs flex items-center gap-1"><Zap className="h-3.5 w-3.5" />Productivity Gain</Label>
                    <span className="text-xs font-bold text-orange-600">{inputs.efficiency_gain_pct}%</span>
                  </div>
                  <Slider value={[inputs.efficiency_gain_pct]} onValueChange={([v]) => set('efficiency_gain_pct', v)} min={0} max={60} step={5} />
                </div>
              </CardContent>
            </Card>

            {/* Costs */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Cost Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Implementation Cost ($)', key: 'implementation_cost' },
                  { label: 'Integration Cost ($)', key: 'integration_cost' },
                  { label: 'Monthly License ($)', key: 'monthly_platform_cost' },
                  { label: 'Training / User ($)', key: 'training_cost_per_user' }
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" min={0} value={inputs[key]} onChange={e => set(key, +e.target.value)} className="h-8 text-sm" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button onClick={runSimulation} disabled={loading || selectedIds.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white">
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Running Simulation...</>
                : <><Calculator className="h-4 w-4 mr-2" />Run ROI Simulation</>}
            </Button>
          </div>

          {/* === RIGHT: Results === */}
          <div className="lg:col-span-2 space-y-5">
            {!results ? (
              <Card className="border-dashed">
                <CardContent className="py-24 text-center text-gray-400 flex flex-col items-center gap-4">
                  <TrendingUp className="h-16 w-16 opacity-20" />
                  <p>Select platforms and configure parameters, then run the simulation.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* AI Comparative Insight */}
                {results.comparative_insight && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 flex items-start gap-3">
                      <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-800">{results.comparative_insight}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Per-Platform KPI cards */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {results.platforms?.map((p, i) => (
                    <Card key={p.platform_name} style={{ borderColor: COLORS[i], borderWidth: 2 }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm" style={{ color: COLORS[i] }}>{p.platform_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-green-50 rounded p-2"><p className="text-gray-500">Annual Savings</p><p className="font-bold text-green-700">{fmt(p.summary?.annual_savings)}</p></div>
                          <div className="bg-blue-50 rounded p-2"><p className="text-gray-500">Break-Even</p><p className="font-bold text-blue-700">{p.summary?.break_even_months}mo</p></div>
                          <div className="bg-purple-50 rounded p-2"><p className="text-gray-500">12-mo ROI</p><p className="font-bold text-purple-700">{p.summary?.roi_12_months}%</p></div>
                          <div className="bg-orange-50 rounded p-2"><p className="text-gray-500">3-Year NPV</p><p className="font-bold text-orange-700">{fmt(p.summary?.three_year_npv)}</p></div>
                        </div>
                        {p.key_insight && <p className="text-xs text-gray-600 bg-gray-50 rounded p-2">💡 {p.key_insight}</p>}
                        {p.top_risk && <p className="text-xs text-yellow-800 bg-yellow-50 rounded p-2">⚠ {p.top_risk}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* 24-Month Cumulative Net Benefit */}
                {combinedTimeline.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        24-Month Cumulative Net Benefit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={combinedTimeline} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip formatter={v => fmt(v)} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="4 4" />
                          {results.platforms?.map((p, i) => (
                            <Line key={p.platform_name} type="monotone" dataKey={p.platform_name} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* ROI % and Break-Even side by side */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">ROI % Comparison</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={roiBarData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} unit="%" />
                          <Tooltip formatter={v => `${v}%`} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="12-mo ROI%" fill="#E88A1D" radius={[3,3,0,0]} />
                          <Bar dataKey="24-mo ROI%" fill="#6B5B7A" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Break-Even & 3-Year NPV</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={breakEvenData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="Break-Even (mo)" fill="#ef4444" radius={[3,3,0,0]} />
                          <Bar dataKey="3-Year NPV ($k)" fill="#16a34a" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Capability Radar */}
                {radarData.length > 0 && results.platforms?.length > 1 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">ROI Dimension Radar</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                          {results.platforms?.map((p, i) => (
                            <Radar key={p.platform_name} name={p.platform_name} dataKey={p.platform_name}
                              stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} />
                          ))}
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Scenario Comparison */}
                {scenarioData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Scenario Sensitivity (12-mo ROI %)</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.platforms?.map(p => ({
                          name: p.platform_name?.slice(0, 12),
                          Pessimistic: p.scenarios?.pessimistic_roi_12 || 0,
                          Base: p.scenarios?.base_roi_12 || 0,
                          Optimistic: p.scenarios?.optimistic_roi_12 || 0
                        }))} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} unit="%" />
                          <Tooltip formatter={v => `${v}%`} />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Bar dataKey="Pessimistic" fill="#ef4444" radius={[3,3,0,0]} />
                          <Bar dataKey="Base" fill="#E88A1D" radius={[3,3,0,0]} />
                          <Bar dataKey="Optimistic" fill="#16a34a" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setResults(null)}>
                    <RefreshCw className="h-4 w-4 mr-2" />Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}