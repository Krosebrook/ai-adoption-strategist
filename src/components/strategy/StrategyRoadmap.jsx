import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Target, Zap, TrendingUp } from 'lucide-react';

export default function StrategyRoadmap({ strategy }) {
  const roadmap = strategy.roadmap;

  return (
    <div className="space-y-6">
      {/* Vision & Summary */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Strategic Vision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Vision Statement</h4>
            <p className="text-slate-700">{roadmap?.vision_statement}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Executive Summary</h4>
            <p className="text-slate-700">{roadmap?.executive_summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      {roadmap?.quick_wins?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roadmap.quick_wins.map((win, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-900">{win}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phases */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Implementation Phases</h3>
        {roadmap?.phases?.map((phase, idx) => (
          <Card key={idx} className="border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{phase.phase_name}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Duration: {phase.duration}</p>
                </div>
                <Badge variant="outline">Phase {idx + 1}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-semibold text-slate-900 mb-2">Objectives</h5>
                <ul className="space-y-1">
                  {phase.objectives?.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-slate-900 mb-2">Key Activities</h5>
                <ul className="space-y-1">
                  {phase.key_activities?.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <h5 className="font-semibold text-slate-900 mb-2 text-sm">Deliverables</h5>
                  <ul className="space-y-1">
                    {phase.deliverables?.map((del, i) => (
                      <li key={i} className="text-xs text-slate-700">• {del}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="font-semibold text-blue-900 mb-2 text-sm">Success Metrics</h5>
                  <ul className="space-y-1">
                    {phase.success_metrics?.map((metric, i) => (
                      <li key={i} className="text-xs text-blue-800">• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Long-term Goals */}
      {roadmap?.long_term_goals?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Long-term Transformation Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {roadmap.long_term_goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Circle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}