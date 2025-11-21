import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Scale, DollarSign, Zap, AlertCircle, Target } from 'lucide-react';

export default function MarketTrendsPanel({ trends, marketImpact }) {
  if (!trends) return null;

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Impact Summary */}
      {marketImpact && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Target className="h-6 w-6" />
              Market Impact on Your Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-900">Market Opportunity Score</span>
              <Badge className="text-lg">
                {marketImpact.opportunity_score}/100
              </Badge>
            </div>

            {marketImpact.platform_impact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">Positive Developments</h5>
                  <ul className="space-y-1">
                    {marketImpact.platform_impact.positive_developments?.map((dev, i) => (
                      <li key={i} className="text-xs text-slate-700">✓ {dev}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-amber-700 mb-2">Concerns</h5>
                  <ul className="space-y-1">
                    {marketImpact.platform_impact.concerns?.map((concern, i) => (
                      <li key={i} className="text-xs text-slate-700">⚠ {concern}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {marketImpact.strategy_adjustments?.length > 0 && (
              <div className="pt-3 border-t border-purple-200">
                <h5 className="text-sm font-semibold text-purple-900 mb-2">Recommended Strategy Adjustments</h5>
                <ul className="space-y-1">
                  {marketImpact.strategy_adjustments.map((adj, i) => (
                    <li key={i} className="text-xs text-purple-800">→ {adj}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Trends Detail */}
      <Tabs defaultValue="releases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="releases">Model Releases</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Trends</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
        </TabsList>

        {/* Model Releases */}
        <TabsContent value="releases">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Recent Model Releases & Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.model_releases?.map((release, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{release.platform}</h4>
                        <p className="text-sm text-slate-600">{release.release}</p>
                      </div>
                      <Badge className={getImpactColor(release.impact)}>
                        {release.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{release.date}</p>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-700 mb-1">Key Features:</h5>
                      <ul className="space-y-1">
                        {release.key_features?.map((feature, i) => (
                          <li key={i} className="text-xs text-slate-600">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adoption Trends */}
        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Industry Adoption Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-green-900 mb-2">Overall Growth</h5>
                  <p className="text-2xl font-bold text-green-700">
                    {trends.adoption_trends?.overall_growth_rate}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">Enterprise Adoption</h5>
                  <p className="text-sm text-blue-800">
                    {trends.adoption_trends?.enterprise_adoption}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Key Statistics</h5>
                <ul className="space-y-1">
                  {trends.adoption_trends?.key_statistics?.map((stat, i) => (
                    <li key={i} className="text-sm text-slate-700">📊 {stat}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Trending Use Cases</h5>
                <div className="flex flex-wrap gap-2">
                  {trends.adoption_trends?.trending_use_cases?.map((useCase, i) => (
                    <Badge key={i} variant="outline">{useCase}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulations */}
        <TabsContent value="regulations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-600" />
                Emerging Regulations & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.regulatory_updates?.map((reg, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-slate-900">{reg.regulation}</h4>
                      <Badge variant="outline">{reg.region}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Status: {reg.status}</p>
                    <p className="text-xs text-slate-500 mb-2">Timeline: {reg.timeline}</p>
                    <p className="text-sm text-purple-900">{reg.impact_on_enterprises}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing Trends & Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.pricing_trends?.map((pricing, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <h4 className="font-semibold text-slate-900 mb-1">{pricing.platform}</h4>
                    <p className="text-sm text-green-700 font-medium mb-1">{pricing.change}</p>
                    <p className="text-xs text-slate-600">{pricing.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive */}
        <TabsContent value="competitive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Competitive Landscape
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Market Leaders</h5>
                <div className="flex flex-wrap gap-2">
                  {trends.competitive_landscape?.market_leaders?.map((leader, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-800">
                      👑 {leader}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Emerging Challengers</h5>
                <div className="flex flex-wrap gap-2">
                  {trends.competitive_landscape?.emerging_challengers?.map((challenger, i) => (
                    <Badge key={i} variant="outline">
                      🚀 {challenger}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-2">Key Differentiators</h5>
                <ul className="space-y-1">
                  {trends.competitive_landscape?.key_differentiators?.map((diff, i) => (
                    <li key={i} className="text-sm text-slate-700">⚡ {diff}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forecast Implications */}
      {trends.forecast_implications?.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Forecast Implications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {trends.forecast_implications.map((implication, i) => (
                <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>{implication}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-xs text-slate-500 text-center">
        Market data last updated: {new Date(trends.last_updated).toLocaleString()}
      </div>
    </div>
  );
}