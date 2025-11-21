import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, DollarSign, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

export default function CostOptimizationPanel({ costSavings, onImplement }) {
  const totalSavings = costSavings?.total_potential_savings || 0;
  const opportunities = costSavings?.opportunities || [];

  const getEffortColor = (effort) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[effort] || 'bg-slate-100 text-slate-800';
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[risk] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Cost Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-slate-600 mb-1">Total Potential Savings</div>
              <div className="text-3xl font-bold text-green-900">
                ${(totalSavings / 1000).toFixed(0)}K
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-slate-600 mb-1">Opportunities</div>
              <div className="text-3xl font-bold text-blue-900">
                {opportunities.length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-slate-600 mb-1">Quick Wins</div>
              <div className="text-3xl font-bold text-purple-900">
                {costSavings?.quick_wins?.length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      {costSavings?.quick_wins?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {costSavings.quick_wins.map((win, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-900">{win}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Opportunities */}
      <div className="space-y-4">
        {opportunities.map((opp, idx) => (
          <Card key={idx} className="border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900">{opp.opportunity}</h4>
                    <Badge variant="outline">{opp.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-900">
                        ${(opp.estimated_savings / 1000).toFixed(0)}K
                      </span>
                      <span className="text-slate-600">/ {opp.savings_type.replace(/_/g, ' ')}</span>
                    </div>
                    <Badge className={getEffortColor(opp.implementation_effort)}>
                      {opp.implementation_effort} effort
                    </Badge>
                    <Badge className={getRiskColor(opp.risk_level)}>
                      {opp.risk_level} risk
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-3">
                <div className="text-sm text-slate-700 mb-2">
                  <strong>Timeline:</strong> {opp.timeline_to_realize}
                </div>
                {opp.requirements?.length > 0 && (
                  <div className="text-sm">
                    <strong className="text-slate-900">Requirements:</strong>
                    <ul className="mt-1 space-y-1">
                      {opp.requirements.map((req, i) => (
                        <li key={i} className="text-slate-700">• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {opp.potential_tradeoffs && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900">
                      <strong>Potential Tradeoffs:</strong> {opp.potential_tradeoffs}
                    </div>
                  </div>
                </div>
              )}

              {onImplement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onImplement(opp)}
                  className="w-full"
                >
                  Mark as Implemented
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Long-term Optimizations */}
      {costSavings?.long_term_optimizations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Long-term Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {costSavings.long_term_optimizations.map((opt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {opt}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}