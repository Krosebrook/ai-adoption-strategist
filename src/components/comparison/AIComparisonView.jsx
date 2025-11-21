import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, TrendingUp, AlertCircle, CheckCircle2, 
  DollarSign, Zap, Target, Rocket, Shield 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIComparisonView({ comparison }) {
  if (!comparison) return null;

  const getValueColor = (rating) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Award className="h-6 w-6" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-purple-900">
            <ReactMarkdown>{comparison.executive_summary}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="rankings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Analysis</TabsTrigger>
          <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Fit</TabsTrigger>
        </TabsList>

        {/* Rankings */}
        <TabsContent value="rankings">
          <div className="space-y-4">
            {comparison.platform_rankings?.map((ranking, idx) => (
              <Card key={idx} className={idx === 0 ? 'border-2 border-blue-400' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                        idx === 0 ? 'bg-blue-600 text-white' :
                        idx === 1 ? 'bg-slate-400 text-white' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        #{ranking.rank}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{ranking.platform}</h3>
                        <Badge className="mt-1">
                          Overall Fit: {ranking.overall_fit_score}/100
                        </Badge>
                      </div>
                    </div>
                    {idx === 0 && (
                      <Award className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <p className="text-slate-700">{ranking.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Strengths & Weaknesses */}
        <TabsContent value="strengths">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.strengths_weaknesses?.map((item, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.platform}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Top Strengths
                    </h4>
                    <ul className="space-y-1">
                      {item.top_strengths?.map((strength, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Key Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {item.key_weaknesses?.map((weakness, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">⚠</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pricing Analysis */}
        <TabsContent value="pricing">
          <div className="space-y-4">
            {comparison.pricing_analysis?.map((pricing, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pricing.platform}</CardTitle>
                    <Badge className={getValueColor(pricing.value_rating)}>
                      {pricing.value_rating} value
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Cost Structure
                    </h5>
                    <p className="text-sm text-slate-600">{pricing.cost_structure}</p>
                  </div>
                  {pricing.hidden_costs?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <h5 className="text-sm font-semibold text-amber-900 mb-1">Potential Hidden Costs</h5>
                      <ul className="space-y-1">
                        {pricing.hidden_costs.map((cost, i) => (
                          <li key={i} className="text-xs text-amber-800">• {cost}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h5 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Scaling Considerations
                    </h5>
                    <p className="text-sm text-slate-600">{pricing.scaling_considerations}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Use Cases */}
        <TabsContent value="use-cases">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparison.use_case_suitability?.map((useCase, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    {useCase.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-green-700 mb-2">Best For:</h5>
                    <ul className="space-y-1">
                      {useCase.best_for?.map((item, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {useCase.not_ideal_for?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">Not Ideal For:</h5>
                      <ul className="space-y-1">
                        {useCase.not_ideal_for.map((item, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400">○</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Implementation */}
        <TabsContent value="implementation">
          <div className="space-y-4">
            {comparison.implementation_comparison?.map((impl, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-purple-600" />
                      {impl.platform}
                    </CardTitle>
                    <Badge className={getComplexityColor(impl.complexity)}>
                      {impl.complexity} complexity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        Time to Value
                      </h5>
                      <p className="text-sm text-slate-600">{impl.time_to_value}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-1">Required Resources</h5>
                      <p className="text-sm text-slate-600">{impl.required_resources}</p>
                    </div>
                  </div>
                  {impl.key_challenges?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">Key Implementation Challenges</h5>
                      <ul className="space-y-1">
                        {impl.key_challenges.map((challenge, i) => (
                          <li key={i} className="text-sm text-slate-600">• {challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Strategic Fit */}
        <TabsContent value="strategic">
          <div className="space-y-4">
            {comparison.strategic_fit?.map((fit, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      {fit.platform}
                    </CardTitle>
                    <Badge variant="secondary">
                      Alignment: {fit.alignment_score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-600 mb-1">Long-term Viability</h5>
                      <p className="text-sm text-slate-900">{fit.long_term_viability}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-600 mb-1">Innovation Potential</h5>
                      <p className="text-sm text-slate-900">{fit.innovation_potential}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-600 mb-1">Ecosystem Lock-in</h5>
                      <p className="text-sm text-slate-900">{fit.ecosystem_lock_in}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Final Recommendation */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Award className="h-6 w-6" />
            Final Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-lg font-bold text-green-900 mb-2">
              Recommended: {comparison.final_recommendation?.recommended_platform}
            </h4>
            <p className="text-slate-800">{comparison.final_recommendation?.justification}</p>
          </div>
          {comparison.final_recommendation?.alternative_consideration && (
            <div className="pt-3 border-t border-green-200">
              <h5 className="text-sm font-semibold text-green-900 mb-1">Alternative to Consider</h5>
              <p className="text-sm text-slate-700">{comparison.final_recommendation.alternative_consideration}</p>
            </div>
          )}
          {comparison.final_recommendation?.implementation_priority?.length > 0 && (
            <div className="pt-3 border-t border-green-200">
              <h5 className="text-sm font-semibold text-green-900 mb-2">Implementation Priority</h5>
              <ol className="space-y-1">
                {comparison.final_recommendation.implementation_priority.map((priority, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="font-bold text-green-700">{i + 1}.</span>
                    <span>{priority}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}