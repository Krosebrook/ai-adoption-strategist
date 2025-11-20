import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import InlineFeedback from '../feedback/InlineFeedback';

export default function AIInsights({ insights, assessmentId }) {
  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Pain Point Analysis */}
      {insights.pain_point_analysis && insights.pain_point_analysis.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              How This Platform Addresses Your Pain Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.pain_point_analysis.map((item, idx) => (
              <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">{item.pain_point}</h4>
                <p className="text-sm text-blue-800 mb-3">{item.how_platform_solves}</p>
                {item.specific_features && item.specific_features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.specific_features.map((feature, fidx) => (
                      <Badge key={fidx} variant="secondary" className="bg-blue-100 text-blue-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Strengths */}
      {insights.key_strengths && insights.key_strengths.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Key Strengths for Your Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.key_strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Potential Challenges */}
        {insights.potential_challenges && insights.potential_challenges.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Considerations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.potential_challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Wins */}
        {insights.quick_wins && insights.quick_wins.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Quick Wins (First 3 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.quick_wins.map((win, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{win}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inline Feedback */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="py-4">
          <InlineFeedback 
            assessmentId={assessmentId}
            contentType="general"
            contentId="ai_insights"
          />
        </CardContent>
      </Card>
    </div>
  );
}