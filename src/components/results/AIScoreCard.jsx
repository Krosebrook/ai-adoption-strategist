import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { getSeverityStyle } from '../utils/formatters';

export default function AIScoreCard({ aiScore }) {
  if (!aiScore) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getMaturityBadge = (level) => {
    const styles = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-purple-100 text-purple-800',
      advanced: 'bg-indigo-100 text-indigo-800',
      expert: 'bg-green-100 text-green-800'
    };
    return styles[level] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Assessment Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${getScoreBgColor(aiScore.overall_score)}`}>
              <div className="text-sm font-medium text-slate-700 mb-1">Overall Score</div>
              <div className={`text-3xl font-bold ${getScoreColor(aiScore.overall_score)}`}>
                {aiScore.overall_score}/100
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${getScoreBgColor(aiScore.readiness_score)}`}>
              <div className="text-sm font-medium text-slate-700 mb-1">AI Readiness</div>
              <div className={`text-3xl font-bold ${getScoreColor(aiScore.readiness_score)}`}>
                {aiScore.readiness_score}/100
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${getScoreBgColor(100 - aiScore.risk_score)}`}>
              <div className="text-sm font-medium text-slate-700 mb-1">Risk Level</div>
              <div className={`text-3xl font-bold ${getScoreColor(100 - aiScore.risk_score)}`}>
                {aiScore.risk_score}/100
              </div>
              <div className="text-xs text-slate-600 mt-1">Lower is better</div>
            </div>
            <div className="p-4 rounded-lg border bg-white border-slate-200">
              <div className="text-sm font-medium text-slate-700 mb-2">Maturity Level</div>
              <Badge className={`${getMaturityBadge(aiScore.maturity_level)} capitalize text-lg px-3 py-1`}>
                {aiScore.maturity_level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Risks */}
      {aiScore.key_risks?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Key Risk Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiScore.key_risks.map((risk, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{risk.area}</h4>
                    <Badge className={getSeverityStyle(risk.severity)}>
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{risk.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                    <div className="text-xs font-semibold text-blue-900 mb-1">Mitigation Strategy</div>
                    <p className="text-sm text-blue-800">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {aiScore.strengths?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Organizational Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiScore.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Improvement Areas */}
        {aiScore.improvement_areas?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-600" />
                Priority Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiScore.improvement_areas.map((area, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-slate-900">{area.area}</h4>
                      <Badge className={getSeverityStyle(area.priority)}>
                        {area.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{area.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Best Practices */}
      {aiScore.best_practices?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recommended Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiScore.best_practices.map((practice, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700">{practice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}