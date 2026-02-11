import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Lightbulb, Target, Zap, Clock, Loader2 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReadinessScoreCard({ assessment, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [readinessData, setReadinessData] = useState(assessment?.ai_readiness_score);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateReadinessScore', {
        assessment_id: assessment.id
      });
      setReadinessData(response.data);
      if (onUpdate) onUpdate();
      toast.success('AI Readiness Score generated!');
    } catch (error) {
      toast.error('Failed to generate readiness score');
    } finally {
      setGenerating(false);
    }
  };

  if (!readinessData && !generating) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">Generate AI Readiness Score</h3>
          <p className="text-sm text-slate-600 mb-4">
            Get a comprehensive analysis of your organization's AI readiness with actionable insights
          </p>
          <Button onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700">
            <Zap className="h-4 w-4 mr-2" />
            Generate Readiness Score
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (generating) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-slate-600">Analyzing your AI readiness...</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return <TrendingUp className="h-5 w-5" />;
    if (score >= 40) return <AlertTriangle className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              AI Readiness Score
            </span>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className={`text-6xl font-black mb-2 ${getScoreColor(readinessData.overall_readiness_score)}`}>
              {readinessData.overall_readiness_score}
              <span className="text-2xl">/100</span>
            </div>
            <Badge className="text-lg px-4 py-1">
              {readinessData.readiness_level?.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(readinessData.category_scores || {}).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <div className="text-xs text-slate-600 mt-1 capitalize">{category}</div>
                <Progress value={score} className="h-1 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Priority Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {readinessData.priority_actions?.slice(0, 5).map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className={
                  action.priority === 'critical' ? 'bg-red-600' :
                  action.priority === 'high' ? 'bg-orange-600' :
                  'bg-blue-600'
                }>
                  {action.priority}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{action.action}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {action.category} • {action.timeline} • Impact: {action.impact}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {action.effort} effort
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-green-600" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readinessData.quick_wins?.map((win, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Long-term Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {readinessData.long_term_initiatives?.map((initiative, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{initiative}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Success Metrics to Track</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {readinessData.success_metrics?.map((metric, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm mb-1">{metric.metric}</h4>
                <p className="text-xs text-slate-600">Target: {metric.target}</p>
                <p className="text-xs text-slate-500">Timeline: {metric.timeline}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}