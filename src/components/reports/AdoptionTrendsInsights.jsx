import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, Users, ShieldCheck, DollarSign, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const COLORS = ['#E88A1D', '#6B5B7A', '#2563eb', '#16a34a', '#dc2626', '#0891b2', '#7c3aed'];

export default function AdoptionTrendsInsights() {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: assessments = [], isLoading: loadingData } = useQuery({
    queryKey: ['all-assessments-trends'],
    queryFn: () => base44.entities.Assessment.list('-assessment_date', 200),
    initialData: []
  });

  // Aggregate anonymized data
  const trendData = useMemo(() => {
    if (!assessments.length) return null;

    // Platform popularity (from recommendations)
    const platformCounts = {};
    assessments.forEach(a => {
      a.recommended_platforms?.forEach(r => {
        const name = r.platform_name || r.platform;
        if (name) platformCounts[name] = (platformCounts[name] || 0) + 1;
      });
    });
    const topPlatforms = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Compliance requirements frequency
    const complianceCounts = {};
    assessments.forEach(a => {
      a.compliance_requirements?.forEach(c => {
        complianceCounts[c] = (complianceCounts[c] || 0) + 1;
      });
    });
    const topCompliance = Object.entries(complianceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Maturity distribution
    const maturityCounts = {};
    assessments.forEach(a => {
      const level = a.ai_assessment_score?.maturity_level;
      if (level) maturityCounts[level] = (maturityCounts[level] || 0) + 1;
    });
    const maturityData = Object.entries(maturityCounts).map(([name, value]) => ({ name, value }));

    // Business goals frequency
    const goalCounts = {};
    assessments.forEach(a => {
      a.business_goals?.forEach(g => {
        // Truncate long strings
        const key = g.length > 40 ? g.slice(0, 40) + '…' : g;
        goalCounts[key] = (goalCounts[key] || 0) + 1;
      });
    });
    const topGoals = Object.entries(goalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([goal, count]) => ({ goal, count }));

    // Budget distribution (buckets)
    const budgetBuckets = { '<$10k': 0, '$10k-$50k': 0, '$50k-$200k': 0, '>$200k': 0 };
    assessments.forEach(a => {
      const max = a.budget_constraints?.max_budget;
      if (max) {
        if (max < 10000) budgetBuckets['<$10k']++;
        else if (max < 50000) budgetBuckets['$10k-$50k']++;
        else if (max < 200000) budgetBuckets['$50k-$200k']++;
        else budgetBuckets['>$200k']++;
      }
    });
    const budgetData = Object.entries(budgetBuckets).map(([range, count]) => ({ range, count }));

    // Desired integrations
    const integrationCounts = {};
    assessments.forEach(a => {
      a.desired_integrations?.forEach(i => {
        integrationCounts[i] = (integrationCounts[i] || 0) + 1;
      });
    });
    const topIntegrations = Object.entries(integrationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    return { topPlatforms, topCompliance, maturityData, topGoals, budgetData, topIntegrations };
  }, [assessments]);

  const generateAIInsights = async () => {
    if (!trendData) { toast.error('No assessment data available'); return; }
    setLoading(true);
    try {
      const summary = {
        total_assessments: assessments.length,
        top_platforms: trendData.topPlatforms.slice(0, 5),
        maturity_distribution: trendData.maturityData,
        top_compliance_requirements: trendData.topCompliance.slice(0, 4),
        top_goals: trendData.topGoals.slice(0, 5),
        top_integrations: trendData.topIntegrations.slice(0, 4)
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an enterprise AI strategy analyst. Based on anonymized, aggregated data from ${summary.total_assessments} organizational AI assessments, provide strategic insights on AI adoption trends.

Aggregated Data:
${JSON.stringify(summary, null, 2)}

Generate:
1. A 2-paragraph trend narrative summarizing what organizations are prioritizing
2. 4 key strategic insights (what the data reveals about enterprise AI adoption)
3. 3 emerging patterns organizations should be aware of
4. Industry-level recommendations for AI program success

Keep it concise, data-driven, and forward-looking.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            trend_narrative: { type: 'string' },
            strategic_insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  insight: { type: 'string' },
                  implication: { type: 'string' },
                  confidence: { type: 'string' }
                }
              }
            },
            emerging_patterns: { type: 'array', items: { type: 'string' } },
            industry_recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAiInsights(response);
      toast.success('Trend insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card><CardContent className="py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading assessment data...</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                AI Adoption Trends
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Based on aggregated, anonymized data from <strong>{assessments.length}</strong> organizational assessments.
                All data is anonymized — no individual organizations are identified.
              </p>
            </div>
            <Button
              onClick={generateAIInsights}
              disabled={loading || assessments.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {aiInsights ? 'Refresh Insights' : 'Generate AI Insights'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {assessments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-gray-500">
            No assessment data available yet. Complete some assessments to see adoption trends.
          </CardContent>
        </Card>
      )}

      {trendData && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Assessments', value: assessments.length, color: 'text-blue-600' },
              { icon: Target, label: 'Platforms Evaluated', value: trendData.topPlatforms.length, color: 'text-orange-500' },
              { icon: ShieldCheck, label: 'Compliance Standards', value: trendData.topCompliance.length, color: 'text-green-600' },
              { icon: DollarSign, label: 'Budget Segments', value: trendData.budgetData.filter(b => b.count > 0).length, color: 'text-purple-600' }
            ].map(({ icon: Icon, label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${color}`} />
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Platform Popularity */}
            {trendData.topPlatforms.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Most Recommended Platforms</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData.topPlatforms} layout="vertical" margin={{ left: 60, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={60} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#E88A1D" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Maturity Distribution */}
            {trendData.maturityData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">AI Maturity Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={trendData.maturityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {trendData.maturityData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Compliance Requirements */}
            {trendData.topCompliance.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" />Top Compliance Requirements</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={trendData.topCompliance} margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#16a34a" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Budget Distribution */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-purple-600" />Budget Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={trendData.budgetData} margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#7c3aed" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Goals */}
          {trendData.topGoals.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Most Common Business Goals</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendData.topGoals.map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-full bg-gray-100 rounded-full h-6 relative">
                        <div
                          className="h-6 rounded-full flex items-center px-3"
                          style={{ width: `${(g.count / trendData.topGoals[0].count) * 100}%`, background: COLORS[i % COLORS.length] }}
                        >
                          <span className="text-white text-xs font-medium truncate">{g.goal}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{g.count}x</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="space-y-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Sparkles className="h-5 w-5" />AI Trend Narrative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">
                {aiInsights.trend_narrative}
              </ReactMarkdown>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Strategic Insights */}
            <Card>
              <CardHeader><CardTitle className="text-base">Strategic Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.strategic_insights?.map((s, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium">{s.insight}</p>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{s.confidence}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{s.implication}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emerging Patterns + Recommendations */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Emerging Patterns</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.emerging_patterns?.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-orange-50 rounded border border-orange-200">
                      <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Industry Recommendations</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {aiInsights.industry_recommendations?.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-2 bg-green-50 rounded border border-green-200">
                      <span className="text-green-600 font-bold flex-shrink-0">{i + 1}.</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}