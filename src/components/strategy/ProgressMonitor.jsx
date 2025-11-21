import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle, CheckCircle, Clock, Lightbulb, Zap } from 'lucide-react';

export default function ProgressMonitor({ strategy, recommendations, checkpoint }) {
  const progress = strategy.progress_tracking;
  const milestones = strategy.milestones || [];
  
  const getRatingColor = (rating) => {
    const colors = {
      excellent: 'bg-green-600',
      on_track: 'bg-blue-600',
      needs_attention: 'bg-yellow-600',
      critical: 'bg-red-600'
    };
    return colors[rating] || 'bg-slate-400';
  };

  const getTypeIcon = (type) => {
    const icons = {
      acceleration: <Zap className="h-4 w-4" />,
      course_correction: <TrendingUp className="h-4 w-4" />,
      risk_alert: <AlertCircle className="h-4 w-4" />,
      optimization: <Lightbulb className="h-4 w-4" />
    };
    return icons[type] || <Lightbulb className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Adoption Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Overall Progress</span>
              <span className="text-2xl font-bold text-blue-900">{progress?.overall_progress || 0}%</span>
            </div>
            <Progress value={progress?.overall_progress || 0} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-slate-600 mb-1">Current Phase</div>
              <div className="font-semibold text-blue-900">{progress?.current_phase || 'Not Started'}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-xs text-slate-600 mb-1">Achievements</div>
              <div className="font-semibold text-green-900">{progress?.achievements?.length || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-amber-200">
              <div className="text-xs text-slate-600 mb-1">Active Blockers</div>
              <div className="font-semibold text-amber-900">{progress?.blockers?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{milestone.milestone_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">Target: {milestone.target_date}</p>
                  </div>
                  <Badge className={
                    milestone.status === 'completed' ? 'bg-green-600' :
                    milestone.status === 'in_progress' ? 'bg-blue-600' :
                    milestone.status === 'delayed' ? 'bg-red-600' :
                    'bg-slate-400'
                  }>
                    {milestone.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {milestone.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                    {milestone.status === 'delayed' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {milestone.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <Progress value={milestone.progress_percentage || 0} className="h-2" />
                {milestone.dependencies?.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">
                    Dependencies: {milestone.dependencies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Assessment */}
      {checkpoint?.ai_analysis && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                AI Performance Assessment
              </CardTitle>
              <Badge className={getRatingColor(checkpoint.ai_analysis.performance_rating)}>
                {checkpoint.ai_analysis.performance_rating.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {checkpoint.ai_analysis.key_insights?.length > 0 && (
              <div>
                <h5 className="font-semibold text-slate-900 mb-2">Key Insights</h5>
                <ul className="space-y-1">
                  {checkpoint.ai_analysis.key_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {checkpoint.ai_analysis.concerns?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h5 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Concerns
                </h5>
                <ul className="space-y-1">
                  {checkpoint.ai_analysis.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-time Recommendations */}
      {recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`border-l-4 rounded-lg p-4 ${
                  rec.priority === 'critical' ? 'border-l-red-600 bg-red-50' :
                  rec.priority === 'high' ? 'border-l-orange-600 bg-orange-50' :
                  rec.priority === 'medium' ? 'border-l-yellow-600 bg-yellow-50' :
                  'border-l-blue-600 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getTypeIcon(rec.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{rec.recommendation}</h4>
                        <Badge className={
                          rec.priority === 'critical' ? 'bg-red-600' :
                          rec.priority === 'high' ? 'bg-orange-600' :
                          rec.priority === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{rec.rationale}</p>
                      <Badge variant="outline" className="text-xs">
                        {rec.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}