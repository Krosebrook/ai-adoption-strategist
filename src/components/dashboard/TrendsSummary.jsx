import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { analyzeTrends } from '../trends/AITrendAnalyzer';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function TrendsSummary({ assessments }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuickAnalysis = async () => {
    if (!assessments || assessments.length < 2) {
      toast.error('Need at least 2 assessments');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeTrends(assessments);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze:', error);
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!assessments || assessments.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Quick Trends Overview
        </CardTitle>
        {!analysis && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickAnalysis}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-2" />
                Analyze
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <p className="text-sm text-slate-600 text-center py-4">
            Click "Analyze" to see AI-powered trend insights
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Overall Trend:</span>
              <Badge className={
                analysis.trend_direction === 'improving' ? 'bg-green-100 text-green-800' :
                analysis.trend_direction === 'declining' ? 'bg-red-100 text-red-800' :
                'bg-slate-100 text-slate-800'
              }>
                {analysis.trend_direction}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-600 line-clamp-3">
              {analysis.overall_summary}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Readiness</div>
                <div className="font-bold text-blue-900">
                  {analysis.readiness_trend?.average_change > 0 ? '+' : ''}
                  {analysis.readiness_trend?.average_change?.toFixed(1)}
                </div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xs text-amber-600 mb-1">Risk Change</div>
                <div className="font-bold text-amber-900">
                  {analysis.risk_trend?.average_change > 0 ? '+' : ''}
                  {analysis.risk_trend?.average_change?.toFixed(1)}
                </div>
              </div>
            </div>

            <Link to={createPageUrl('Trends')} className="block">
              <Button variant="outline" className="w-full mt-3" size="sm">
                View Full Analysis
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}