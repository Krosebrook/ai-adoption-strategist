import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Sparkles } from 'lucide-react';

export default function PainPointsSummary({ painPoints, painPointMappings }) {
  // Count solutions per pain point
  const painPointSolutions = {};
  
  if (painPointMappings) {
    Object.entries(painPointMappings).forEach(([painPoint, data]) => {
      if (painPoints?.includes(painPoint)) {
        painPointSolutions[painPoint] = {
          solutionCount: data.recommended_solutions?.length || 0,
          platforms: data.platforms_offering_solution?.length || 0
        };
      }
    });
  }

  const totalPainPoints = painPoints?.length || 0;
  const addressedPainPoints = Object.keys(painPointSolutions).length;
  const coveragePercent = totalPainPoints > 0 ? (addressedPainPoints / totalPainPoints) * 100 : 0;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-700" />
            Pain Points Analysis
          </CardTitle>
          <Badge className="bg-slate-100 text-slate-800">
            {totalPainPoints} identified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Coverage Summary */}
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Solution Coverage</span>
            <span className="text-lg font-bold text-slate-900">{coveragePercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {addressedPainPoints} of {totalPainPoints} pain points have AI-recommended solutions
          </p>
        </div>

        {/* Pain Points List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Primary Challenges</h4>
          {painPoints?.slice(0, 5).map((painPoint, index) => {
            const hasSolution = painPointSolutions[painPoint];
            return (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  hasSolution 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {hasSolution ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Target className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{painPoint}</p>
                  {hasSolution && (
                    <div className="flex items-center gap-2 mt-1">
                      <Sparkles className="h-3 w-3 text-green-600" />
                      <p className="text-xs text-green-700">
                        {hasSolution.solutionCount} solutions · {hasSolution.platforms} platforms
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {totalPainPoints > 5 && (
            <p className="text-xs text-slate-500 text-center pt-2">
              + {totalPainPoints - 5} more pain points
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}