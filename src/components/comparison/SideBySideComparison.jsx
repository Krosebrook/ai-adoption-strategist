import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, StarOff, TrendingUp, Shield, Puzzle, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { generateAIComparison } from './AIComparisonEngine';
import AIComparisonView from './AIComparisonView';

export default function SideBySideComparison({ 
  assessment, 
  selectedPlatforms, 
  availablePlatforms,
  onPlatformSelectionChange 
}) {
  const [aiInsights, setAiInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [aiComparison, setAiComparison] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.FavoritePlatform.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (platform) => {
      const existing = favorites?.find(f => f.platform_name === platform);
      if (existing) {
        await base44.entities.FavoritePlatform.delete(existing.id);
      } else {
        await base44.entities.FavoritePlatform.create({
          user_email: user.email,
          platform_name: platform,
          assessment_id: assessment.id
        });
      }
    },
    onSuccess: () => {
      toast.success('Favorites updated');
    }
  });

  const isFavorite = (platform) => {
    return favorites?.some(f => f.platform_name === platform);
  };

  const generateAIInsights = async (platform) => {
    if (aiInsights[platform]) return;
    
    setLoadingInsights(true);
    try {
      const platformData = assessment.recommended_platforms?.find(p => p.platform_name === platform);
      const roiData = assessment.roi_calculations?.[platform.toLowerCase().replace(/ /g, '_')];
      
      const prompt = `Analyze this AI platform for enterprise adoption:

Platform: ${platform}
Overall Score: ${platformData?.score || 'N/A'}
ROI (1-year): ${roiData?.one_year_roi || 'N/A'}%
Compliance Score: ${assessment.compliance_scores?.[platform.toLowerCase().replace(/ /g, '_')]?.overall_score || 'N/A'}%

Organization Context:
- Pain Points: ${assessment.pain_points?.join(', ')}
- Requirements: ${assessment.compliance_requirements?.join(', ')}
- Integrations: ${assessment.desired_integrations?.join(', ')}

Provide:
1. 3 key advantages for this specific organization
2. 3 potential concerns or limitations
3. 1 unique differentiator compared to competitors`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            advantages: { type: 'array', items: { type: 'string' } },
            concerns: { type: 'array', items: { type: 'string' } },
            differentiator: { type: 'string' }
          }
        }
      });

      setAiInsights(prev => ({ ...prev, [platform]: result }));
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const getPlatformData = (platform) => {
    const normalized = platform.toLowerCase().replace(/ /g, '_');
    return {
      recommendation: assessment.recommended_platforms?.find(p => p.platform_name === platform),
      roi: assessment.roi_calculations?.[normalized],
      compliance: assessment.compliance_scores?.[normalized],
      integration: assessment.integration_scores?.[normalized]
    };
  };

  const handlePlatformToggle = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformSelectionChange(selectedPlatforms.filter(p => p !== platform));
    } else if (selectedPlatforms.length < 4) {
      onPlatformSelectionChange([...selectedPlatforms, platform]);
    } else {
      toast.error('Maximum 4 platforms can be compared');
    }
  };

  const handleGenerateAIComparison = async () => {
    if (selectedPlatforms.length < 2) {
      toast.error('Select at least 2 platforms to compare');
      return;
    }

    setLoadingComparison(true);
    try {
      const comparison = await generateAIComparison(assessment, selectedPlatforms);
      setAiComparison(comparison);
      toast.success('AI comparison generated successfully!');
    } catch (error) {
      console.error('Failed to generate AI comparison:', error);
      toast.error('Failed to generate AI comparison');
    } finally {
      setLoadingComparison(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generate AI Comparison Button */}
      {selectedPlatforms.length >= 2 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  AI-Powered Comprehensive Comparison
                </h4>
                <p className="text-sm text-slate-600">
                  Get detailed side-by-side analysis with strengths, weaknesses, pricing, and strategic recommendations
                </p>
              </div>
              <Button
                onClick={handleGenerateAIComparison}
                disabled={loadingComparison}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                {loadingComparison ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Comparison
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Comparison Results */}
      {aiComparison && (
        <AIComparisonView comparison={aiComparison} />
      )}

      {/* Platform Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Platforms to Compare (up to 4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {availablePlatforms.map(platform => (
              <label key={platform} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedPlatforms.includes(platform)}
                  onCheckedChange={() => handlePlatformToggle(platform)}
                />
                <span>{platform}</span>
                {isFavorite(platform) && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPlatforms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">Select at least one platform to begin comparison</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedPlatforms.map(platform => {
            const data = getPlatformData(platform);
            const insights = aiInsights[platform];
            
            return (
              <Card key={platform} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{platform}</CardTitle>
                      <Badge variant="secondary" className="text-lg font-semibold">
                        Score: {data.recommendation?.score?.toFixed(1) || 'N/A'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavoriteMutation.mutate(platform)}
                    >
                      {isFavorite(platform) ? (
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="h-5 w-5 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">1-Year ROI</span>
                      </div>
                      <span className="font-bold text-blue-900">
                        {formatPercentage(data.roi?.one_year_roi || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Compliance</span>
                      </div>
                      <span className="font-bold text-green-900">
                        {formatPercentage(data.compliance?.overall_score || 0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Puzzle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Integrations</span>
                      </div>
                      <span className="font-bold text-purple-900">
                        {formatPercentage(data.integration?.overall_score || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-semibold mb-2">Financial Impact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Annual Savings</span>
                        <span className="font-medium">
                          {formatCurrency(data.roi?.total_annual_savings || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Platform Cost</span>
                        <span className="font-medium">
                          {formatCurrency(data.roi?.total_cost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  {insights ? (
                    <div className="border-t pt-3 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        AI Analysis
                      </h4>
                      
                      <div>
                        <h5 className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Key Advantages
                        </h5>
                        <ul className="space-y-1">
                          {insights.advantages?.slice(0, 3).map((adv, idx) => (
                            <li key={idx} className="text-xs text-slate-700 pl-4">
                              • {adv}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Considerations
                        </h5>
                        <ul className="space-y-1">
                          {insights.concerns?.slice(0, 3).map((concern, idx) => (
                            <li key={idx} className="text-xs text-slate-700 pl-4">
                              • {concern}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {insights.differentiator && (
                        <div className="bg-purple-50 p-2 rounded text-xs">
                          <strong className="text-purple-900">Unique Edge:</strong>{' '}
                          <span className="text-purple-800">{insights.differentiator}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => generateAIInsights(platform)}
                      disabled={loadingInsights}
                    >
                      {loadingInsights ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Generate AI Insights
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}