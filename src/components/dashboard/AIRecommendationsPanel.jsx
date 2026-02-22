import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Shield, Users, Zap, CheckCircle, X, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AIRecommendationsPanel({ assessments, userRole, userEmail }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    generateRecommendations();
  }, [assessments]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the following user profile and activity, generate 5 personalized AI recommendations:
        
User Role: ${userRole}
Total Assessments: ${assessments.length}
Recent Activity: ${assessments.slice(0, 3).map(a => a.organization_name).join(', ')}

Generate recommendations in these categories:
1. Platform optimization opportunities
2. Cost reduction strategies
3. Training and skill development
4. Risk mitigation actions
5. Quick wins and immediate actions

For each recommendation, provide:
- Title (concise, action-oriented)
- Description (2-3 sentences explaining the value)
- Category (optimization, cost, training, risk, or quick_win)
- Priority (high, medium, low)
- Estimated Impact (high, medium, low)`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  priority: { type: 'string' },
                  impact: { type: 'string' },
                  actionable: { type: 'boolean' }
                }
              }
            }
          }
        }
      });

      if (response?.recommendations) {
        setRecommendations(response.recommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const dismissRecommendation = (id) => {
    setDismissedIds([...dismissedIds, id]);
    toast.success('Recommendation dismissed');
  };

  const activeRecommendations = recommendations.filter(r => !dismissedIds.includes(r.id));

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'optimization': return TrendingUp;
      case 'cost': return Zap;
      case 'training': return Users;
      case 'risk': return Shield;
      case 'quick_win': return CheckCircle;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'optimization': return 'text-blue-600 bg-blue-50';
      case 'cost': return 'text-green-600 bg-green-50';
      case 'training': return 'text-purple-600 bg-purple-50';
      case 'risk': return 'text-red-600 bg-red-50';
      case 'quick_win': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-orange-600 bg-orange-50';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            AI Recommendations
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={isGenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Generating personalized recommendations...</p>
          </div>
        ) : activeRecommendations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Sparkles className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No recommendations available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRecommendations.map((rec) => {
              const Icon = getCategoryIcon(rec.category);
              const colorClass = getCategoryColor(rec.category);
              
              return (
                <div
                  key={rec.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissRecommendation(rec.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityBadge(rec.priority)} variant="outline">
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}