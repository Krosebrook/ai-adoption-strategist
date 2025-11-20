import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, Shield, Plug, Target } from 'lucide-react';
import InlineFeedback from '../feedback/InlineFeedback';

export default function EnhancedRecommendationCard({ 
  recommendation, 
  rank, 
  assessment,
  aiJustification,
  assessmentId 
}) {
  const [expanded, setExpanded] = useState(false);

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-br from-slate-300 to-slate-500 text-white';
      case 3: return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${getRankColor(rank)}`}>
              {getRankIcon(rank)}
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">
                {recommendation.platform_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-800">
                  Score: {recommendation.score?.toFixed(1)}/100
                </Badge>
                {rank === 1 && (
                  <Badge className="bg-green-100 text-green-800">
                    Top Choice
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Justification */}
        {aiJustification && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-purple-900">AI Analysis</h4>
              </div>
              <p className="text-sm text-purple-800 leading-relaxed">
                {aiJustification}
              </p>
            </div>
            <div className="pt-2 border-t border-purple-200">
              <InlineFeedback 
                assessmentId={assessmentId}
                contentType="platform_recommendation"
                contentId={recommendation.platform}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-xs text-green-600">ROI Score</div>
              <div className="text-sm font-semibold text-green-900">
                {recommendation.roi_score?.toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-xs text-blue-600">Compliance</div>
              <div className="text-sm font-semibold text-blue-900">
                {recommendation.compliance_score?.toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Plug className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-xs text-purple-600">Integration</div>
              <div className="text-sm font-semibold text-purple-900">
                {recommendation.integration_score?.toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Target className="h-5 w-5 text-amber-600" />
            <div>
              <div className="text-xs text-amber-600">Pain Points</div>
              <div className="text-sm font-semibold text-amber-900">
                {recommendation.pain_point_score?.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Standard Justification */}
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {recommendation.justification}
          </p>
        </div>

        {/* Expandable Details */}
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-slate-600"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show Detailed Analysis
            </>
          )}
        </Button>

        {expanded && aiJustification && (
          <div className="space-y-3 pt-3 border-t">
            {recommendation.strengths && (
              <div>
                <h5 className="font-semibold text-slate-900 mb-2">✅ Key Strengths</h5>
                <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
                  {recommendation.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.considerations && (
              <div>
                <h5 className="font-semibold text-slate-900 mb-2">⚠️ Considerations</h5>
                <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
                  {recommendation.considerations.map((consideration, idx) => (
                    <li key={idx}>{consideration}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.data_driven_rationale && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <h5 className="font-semibold text-slate-900 mb-2">📊 Data-Driven Rationale</h5>
                <p className="text-sm text-slate-700">{recommendation.data_driven_rationale}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}