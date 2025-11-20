import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MaturityRoadmapViz({ roadmap }) {
  if (!roadmap) return null;

  const years = [roadmap.year_1_projection, roadmap.year_2_projection, roadmap.year_3_projection];

  const getProbabilityColor = (prob) => {
    switch (prob) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getMaturityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'text-purple-600';
      case 'advanced': return 'text-blue-600';
      case 'intermediate': return 'text-green-600';
      case 'beginner': return 'text-slate-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current State */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Award className="h-5 w-5" />
            Current Maturity State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className={`text-2xl font-bold capitalize ${getMaturityColor(roadmap.current_state.level)}`}>
              {roadmap.current_state.level}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Strengths
              </h5>
              <ul className="space-y-1">
                {roadmap.current_state.strengths?.map((strength, idx) => (
                  <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Gaps to Address
              </h5>
              <ul className="space-y-1">
                {roadmap.current_state.gaps?.map((gap, idx) => (
                  <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            3-Year Maturity Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {years.map((year, idx) => (
              <div key={idx} className="relative">
                {idx > 0 && (
                  <div className="absolute left-6 -top-3 w-0.5 h-6 bg-purple-300" />
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    Y{idx + 1}
                  </div>
                  <div className="flex-1 border border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`text-xl font-bold capitalize ${getMaturityColor(year.target_level)}`}>
                          {year.target_level}
                        </h4>
                        <p className="text-sm text-slate-600">Target Maturity Level</p>
                      </div>
                      <Badge className={getProbabilityColor(year.probability)}>
                        {year.probability} probability
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Key Milestones
                        </h5>
                        <ul className="space-y-1">
                          {year.key_milestones?.map((milestone, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-purple-600">→</span>
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-700 mb-2">Required Investments</h5>
                        <ul className="space-y-1">
                          {year.required_investments?.map((inv, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <span className="text-blue-600">$</span>
                              <span>{inv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <h5 className="text-xs font-semibold text-slate-700 mb-2">Success Metrics</h5>
                      <div className="flex flex-wrap gap-2">
                        {year.success_metrics?.map((metric, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Dependencies & Roadblocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.critical_dependencies?.map((dep, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-3">
                  <h5 className="font-semibold text-slate-900 text-sm">{dep.dependency}</h5>
                  <p className="text-xs text-slate-600 mt-1">{dep.impact}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    <strong>Mitigation:</strong> {dep.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Potential Roadblocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.potential_roadblocks?.map((block, idx) => (
                <div key={idx} className="border-l-4 border-amber-500 pl-3">
                  <div className="flex items-start justify-between">
                    <h5 className="font-semibold text-slate-900 text-sm">{block.roadblock}</h5>
                    <Badge variant="outline" className="text-xs">{block.likelihood}</Badge>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    <strong>Solution:</strong> {block.solution}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acceleration Opportunities */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-900">
            Acceleration Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {roadmap.acceleration_opportunities?.map((opp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-600 font-bold">⚡</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Overall Trajectory Summary */}
      <Card className="border-2 border-purple-300">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Overall Trajectory:</h4>
          <p className="text-slate-900">{roadmap.overall_trajectory}</p>
        </CardContent>
      </Card>
    </div>
  );
}