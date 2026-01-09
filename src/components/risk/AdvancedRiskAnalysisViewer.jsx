import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Shield, TrendingUp, Eye, Target, Activity,
  ArrowRight, CheckCircle, XCircle, AlertCircle, Filter,
  Download, BarChart3
} from 'lucide-react';
import { generateRiskHeatMap, calculateOverallRiskScore } from './AdvancedRiskAnalysisEngine';

export default function AdvancedRiskAnalysisViewer({ riskAnalysis }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState(null);

  if (!riskAnalysis) return null;

  const heatMapData = generateRiskHeatMap(riskAnalysis);
  const overallScore = calculateOverallRiskScore(riskAnalysis);

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      technical: '⚙️',
      compliance: '📋',
      operational: '🔄',
      financial: '💰',
      organizational: '👥',
      security: '🔒',
      vendor: '🤝'
    };
    return icons[category] || '📊';
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-red-600';
    if (score >= 3) return 'text-orange-600';
    if (score >= 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredRisks = riskAnalysis.risk_categories?.filter(cat => 
    selectedCategory === 'all' || cat.category === selectedCategory
  ).flatMap(cat => 
    cat.risks?.filter(risk => 
      selectedRiskLevel === 'all' || risk.risk_level === selectedRiskLevel
    ).map(risk => ({ ...risk, category: cat.category })) || []
  ) || [];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Advanced Risk Analysis
              </h2>
              <p className="text-red-100">
                {riskAnalysis.executive_summary?.recommendation}
              </p>
            </div>
            <Badge className={`${getRiskLevelColor(riskAnalysis.executive_summary?.overall_risk_level)} text-lg px-4 py-2`}>
              {riskAnalysis.executive_summary?.overall_risk_level?.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-red-100 mb-1">Total Risks</div>
              <div className="text-2xl font-bold">
                {riskAnalysis.executive_summary?.total_risks_identified || 0}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-red-100 mb-1">Critical</div>
              <div className="text-2xl font-bold">
                {riskAnalysis.executive_summary?.critical_risk_count || 0}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-red-100 mb-1">Risk Score</div>
              <div className="text-2xl font-bold">{overallScore}/100</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-red-100 mb-1">Industry</div>
              <div className="text-lg font-bold capitalize">
                {riskAnalysis.industry_context}
              </div>
            </div>
          </div>

          {riskAnalysis.executive_summary?.key_concerns && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-red-100 font-semibold">Key Concerns:</p>
              {riskAnalysis.executive_summary.key_concerns.map((concern, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-white">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {concern}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <div className="flex-1 flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                {riskAnalysis.risk_categories?.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {getCategoryIcon(cat.category)} {cat.category}
                  </option>
                ))}
              </select>
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Risk Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" />
            Risk Heat Map (Top 10 by RPN)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {heatMapData.slice(0, 10).map((risk, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Badge className={getRiskLevelColor(risk.risk_level)}>
                  #{idx + 1}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900">{risk.risk_name}</span>
                    <span className="text-sm text-slate-600">RPN: {risk.rpn}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={getScoreColor(risk.likelihood)}>
                      Likelihood: {risk.likelihood}/5
                    </div>
                    <div className={getScoreColor(risk.impact)}>
                      Impact: {risk.impact}/5
                    </div>
                    <div className={getScoreColor(risk.detectability)}>
                      Detectability: {risk.detectability}/5
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Risk Categories */}
      <Tabs defaultValue={riskAnalysis.risk_categories?.[0]?.category || 'all'}>
        <TabsList>
          {riskAnalysis.risk_categories?.map(cat => (
            <TabsTrigger key={cat.category} value={cat.category}>
              {getCategoryIcon(cat.category)} {cat.category}
              <Badge className={`ml-2 ${getRiskLevelColor(cat.category_risk_level)}`}>
                {cat.risks?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {riskAnalysis.risk_categories?.map(category => (
          <TabsContent key={category.category} value={category.category} className="space-y-4">
            {category.risks?.map((risk, idx) => (
              <Card key={idx} className={`border-l-4 ${
                risk.risk_level === 'critical' ? 'border-l-red-600' :
                risk.risk_level === 'high' ? 'border-l-orange-500' :
                risk.risk_level === 'moderate' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{risk.risk_name}</CardTitle>
                        <Badge className={getRiskLevelColor(risk.risk_level)}>
                          {risk.risk_level}
                        </Badge>
                        {risk.industry_specific && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            Industry-Specific
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{risk.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRisk(risk)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Risk Scores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Likelihood</div>
                      <div className={`text-2xl font-bold ${getScoreColor(risk.likelihood?.score)}`}>
                        {risk.likelihood?.score}/5
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {risk.likelihood?.rationale}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Impact</div>
                      <div className={`text-2xl font-bold ${getScoreColor(risk.impact?.score)}`}>
                        {risk.impact?.score}/5
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {risk.impact?.rationale}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Detectability</div>
                      <div className={`text-2xl font-bold ${getScoreColor(risk.detectability?.score)}`}>
                        {risk.detectability?.score}/5
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {risk.detectability?.rationale}
                      </div>
                    </div>
                  </div>

                  {/* RPN */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-red-900">
                        Risk Priority Number (RPN)
                      </span>
                      <span className="text-xl font-bold text-red-900">
                        {risk.risk_priority_number}
                      </span>
                    </div>
                  </div>

                  {/* Early Warning Indicators */}
                  {risk.early_warning_indicators?.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        Early Warning Indicators
                      </h5>
                      <div className="space-y-1">
                        {risk.early_warning_indicators.map((indicator, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <Activity className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {indicator}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mitigation Strategies */}
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      Mitigation Strategies
                    </h5>
                    <div className="space-y-3">
                      {risk.mitigation_strategies?.map((strategy, i) => (
                        <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-green-900">{strategy.strategy}</div>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="bg-white text-xs">
                                  {strategy.type}
                                </Badge>
                                <Badge variant="outline" className="bg-white text-xs">
                                  Effort: {strategy.effort}
                                </Badge>
                                <Badge variant="outline" className="bg-white text-xs">
                                  Effectiveness: {strategy.effectiveness}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-green-700 mb-2">
                            Timeline: {strategy.timeline} | Owner: {strategy.owner}
                          </div>
                          {strategy.implementation_steps?.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-semibold text-green-900 mb-1">
                                Implementation Steps:
                              </div>
                              <ol className="space-y-1">
                                {strategy.implementation_steps.map((step, j) => (
                                  <li key={j} className="text-xs text-green-800 flex items-start gap-2">
                                    <span className="font-bold">{j + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Risk Interdependencies */}
      {riskAnalysis.risk_interdependencies?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Risk Interdependencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskAnalysis.risk_interdependencies.map((interdep, idx) => (
              <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-purple-900 mb-2">{interdep.relationship}</div>
                <p className="text-sm text-purple-800 mb-2">{interdep.cascading_effect}</p>
                <div className="text-xs text-purple-700">
                  <strong>Combined Impact:</strong> {interdep.combined_impact}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monitoring Framework */}
      {riskAnalysis.monitoring_framework && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Risk Monitoring Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 mb-3">Key Risk Indicators (KRIs)</h5>
              <div className="space-y-2">
                {riskAnalysis.monitoring_framework.key_risk_indicators?.map((kri, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-blue-900">{kri.indicator}</span>
                      <Badge variant="outline" className="bg-white">
                        {kri.monitoring_frequency}
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-700">
                      Measurement: {kri.measurement} | Threshold: {kri.threshold}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600 mb-1">Reporting Cadence</div>
                <div className="font-medium text-slate-900">
                  {riskAnalysis.monitoring_framework.reporting_cadence}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600 mb-1">Escalation Criteria</div>
                <div className="text-xs text-slate-700">
                  {riskAnalysis.monitoring_framework.escalation_criteria?.join(', ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}