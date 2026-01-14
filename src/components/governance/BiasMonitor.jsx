import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export default function BiasMonitor({ biasScans }) {
  const latestScan = biasScans[0];

  const getScoreColor = (score) => {
    if (score < 20) return 'text-green-600';
    if (score < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const config = {
      clear: { bg: 'bg-green-600', icon: CheckCircle },
      needs_attention: { bg: 'bg-yellow-600', icon: AlertTriangle },
      critical: { bg: 'bg-red-600', icon: AlertTriangle }
    };
    const { bg, icon: Icon } = config[status] || config.clear;
    return (
      <Badge className={bg}>
        <Icon className="h-3 w-3 mr-1" />
        {status?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (!latestScan) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Eye className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No bias scans available</p>
          <p className="text-sm text-slate-500 mt-2">Run a scan to monitor AI fairness</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Latest Bias Scan</CardTitle>
              <p className="text-sm text-slate-600">
                {latestScan.agent_name} • {latestScan.sample_size} interactions analyzed
              </p>
            </div>
            {getStatusBadge(latestScan.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Gender Bias</p>
              <p className={`text-2xl font-bold ${getScoreColor(latestScan.bias_metrics?.gender_bias_score || 0)}`}>
                {latestScan.bias_metrics?.gender_bias_score || 0}
              </p>
              <Progress value={latestScan.bias_metrics?.gender_bias_score || 0} className="mt-2" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Racial Bias</p>
              <p className={`text-2xl font-bold ${getScoreColor(latestScan.bias_metrics?.racial_bias_score || 0)}`}>
                {latestScan.bias_metrics?.racial_bias_score || 0}
              </p>
              <Progress value={latestScan.bias_metrics?.racial_bias_score || 0} className="mt-2" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Age Bias</p>
              <p className={`text-2xl font-bold ${getScoreColor(latestScan.bias_metrics?.age_bias_score || 0)}`}>
                {latestScan.bias_metrics?.age_bias_score || 0}
              </p>
              <Progress value={latestScan.bias_metrics?.age_bias_score || 0} className="mt-2" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Language Bias</p>
              <p className={`text-2xl font-bold ${getScoreColor(latestScan.bias_metrics?.language_bias_score || 0)}`}>
                {latestScan.bias_metrics?.language_bias_score || 0}
              </p>
              <Progress value={latestScan.bias_metrics?.language_bias_score || 0} className="mt-2" />
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 mb-1">Overall Fairness Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(100 - (latestScan.bias_metrics?.overall_fairness_score || 100))}`}>
                {latestScan.bias_metrics?.overall_fairness_score || 100}
              </p>
              <Progress value={latestScan.bias_metrics?.overall_fairness_score || 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {latestScan.detected_issues && latestScan.detected_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestScan.detected_issues.map((issue, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold">{issue.issue_type}</h4>
                    </div>
                    <Badge variant="outline">{issue.severity}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{issue.description}</p>
                  {issue.examples && issue.examples.length > 0 && (
                    <div className="bg-slate-50 rounded p-2 mb-2">
                      <p className="text-xs text-slate-600 mb-1">Examples:</p>
                      <ul className="text-xs text-slate-700 list-disc list-inside">
                        {issue.examples.slice(0, 2).map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-xs text-blue-900 font-medium">Recommendation:</p>
                    <p className="text-xs text-blue-800">{issue.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {latestScan.recommendations && latestScan.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {latestScan.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}