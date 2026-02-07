import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PersonalizedRecommendations() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generatePersonalizedRecommendations', {});
      setRecommendations(response.data);
      toast.success('Personalized recommendations generated');
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      strategy: '🎯',
      risk: '⚠️',
      training: '📚',
      governance: '🛡️',
      productivity: '⚡'
    };
    return icons[category] || '💡';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Recommendations
          </div>
          <Button onClick={generateRecommendations} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Recommendations
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-300" />
            <p>Click the button above to get personalized AI recommendations</p>
            <p className="text-sm mt-2">Based on your role, activity, and current system state</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.personalization_note && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                <strong className="text-purple-800">Note:</strong> {recommendations.personalization_note}
              </div>
            )}
            
            <div className="space-y-3">
              {recommendations.recommendations?.map((rec, idx) => (
                <div key={idx} className="p-4 border rounded-lg hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                      <div>
                        <h4 className="font-semibold">{rec.title}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {rec.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  
                  {rec.action_items && rec.action_items.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Action Items:</div>
                      <ul className="text-sm space-y-1">
                        {rec.action_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-600">→</span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {rec.estimated_impact && (
                    <div className="text-xs text-gray-500 mb-2">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      Impact: {rec.estimated_impact}
                    </div>
                  )}
                  
                  {rec.page_to_visit && (
                    <Link to={createPageUrl(rec.page_to_visit)}>
                      <Button size="sm" variant="outline" className="w-full">
                        Go to {rec.page_to_visit}
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}