import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Shield, Plug, Target, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

export default function RecommendationCard({ recommendation, rank }) {
  const platform = AI_PLATFORMS.find(p => p.id === recommendation.platform);
  
  const rankColors = {
    1: 'bg-gradient-to-br from-amber-400 to-amber-600',
    2: 'bg-gradient-to-br from-slate-300 to-slate-500',
    3: 'bg-gradient-to-br from-amber-600 to-amber-800'
  };

  const rankLabels = {
    1: 'Top Recommendation',
    2: 'Strong Alternative',
    3: 'Viable Option'
  };

  return (
    <Card className={`border-2 ${rank === 1 ? 'border-amber-400 shadow-lg' : 'border-slate-200'}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={`w-12 h-12 rounded-xl ${rankColors[rank] || 'bg-slate-400'} flex items-center justify-center text-white font-bold text-xl shadow-md`}
            >
              #{rank}
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">{platform?.name || recommendation.platform}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {rankLabels[rank] || 'Recommended'}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">{recommendation.score.toFixed(0)}</div>
            <div className="text-xs text-slate-500">Overall Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          {recommendation.justification}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-900">ROI</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{recommendation.roi_score.toFixed(0)}%</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-900">Compliance</span>
            </div>
            <div className="text-lg font-bold text-green-700">{recommendation.compliance_score.toFixed(0)}%</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Plug className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">Integration</span>
            </div>
            <div className="text-lg font-bold text-purple-700">{recommendation.integration_score.toFixed(0)}%</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-900">Pain Points</span>
            </div>
            <div className="text-lg font-bold text-amber-700">{recommendation.pain_point_score.toFixed(0)}%</div>
          </div>
        </div>

        {/* Budget Fit */}
        {recommendation.budget_fit && (
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">Budget Alignment:</span>
              <Badge className={
                recommendation.budget_fit === 'excellent' ? 'bg-green-100 text-green-800' :
                recommendation.budget_fit === 'good' ? 'bg-blue-100 text-blue-800' :
                recommendation.budget_fit === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }>
                {recommendation.budget_fit}
              </Badge>
            </div>
          </div>
        )}

        {/* Pros */}
        {recommendation.pros?.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Key Advantages
            </h4>
            <ul className="space-y-1">
              {recommendation.pros.map((pro, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {recommendation.cons?.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Considerations
            </h4>
            <ul className="space-y-1">
              {recommendation.cons.map((con, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Best For */}
        {recommendation.best_for?.length > 0 && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-xs font-semibold text-blue-900 mb-2">Best Suited For:</h4>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.best_for.map((use, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}