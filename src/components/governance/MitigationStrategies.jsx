import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

export default function MitigationStrategies({ biasScans }) {
  const latestScan = biasScans[0];

  if (!latestScan?.detected_issues) {
    return null;
  }

  const issuesWithStrategies = latestScan.detected_issues.filter(
    issue => issue.mitigation_strategies && issue.mitigation_strategies.length > 0
  );

  if (issuesWithStrategies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            AI-Generated Mitigation Strategies
          </CardTitle>
          <p className="text-sm text-slate-600">
            Automated strategies to address detected bias issues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {issuesWithStrategies.map((issue, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {issue.issue_type}
                  </h4>
                  <p className="text-sm text-slate-600">{issue.description}</p>
                </div>
                <Badge variant="outline">{issue.severity}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700">Mitigation Strategies:</p>
                {issue.mitigation_strategies.map((strategy, sidx) => (
                  <div 
                    key={sidx} 
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-600 text-xs">
                          {strategy.priority} priority
                        </Badge>
                        <span className="text-xs text-slate-600">
                          Effort: {strategy.estimated_effort}
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">{strategy.strategy}</p>
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <TrendingUp className="h-3 w-3" />
                        Expected Impact: {strategy.expected_impact}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Implement
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {latestScan.policy_recommendations && latestScan.policy_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Policy Recommendations
            </CardTitle>
            <p className="text-sm text-slate-600">
              Suggested policy updates to prevent future bias
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestScan.policy_recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge className={
                      rec.action === 'create' ? 'bg-green-600' :
                      rec.action === 'update' ? 'bg-blue-600' :
                      'bg-orange-600'
                    }>
                      {rec.action}
                    </Badge>
                    <h4 className="font-semibold mt-2">{rec.policy_name}</h4>
                    <p className="text-xs text-slate-600">{rec.policy_type}</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 mb-3">{rec.rationale}</p>
                
                {rec.suggested_rules && rec.suggested_rules.length > 0 && (
                  <div className="bg-slate-50 rounded p-3 space-y-1">
                    <p className="text-xs font-medium text-slate-700">Suggested Rules:</p>
                    {rec.suggested_rules.map((rule, ridx) => (
                      <div key={ridx} className="text-xs text-slate-600 flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.severity}
                        </Badge>
                        <span>{rule.rule_description}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Apply Recommendation
                  </Button>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}