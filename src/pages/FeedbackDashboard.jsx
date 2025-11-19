import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';

export default function FeedbackDashboard() {
  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: () => base44.entities.Feedback.list('-created_date', 100),
    initialData: []
  });

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const averageUsefulness = feedbacks.filter(f => f.usefulness_score).length > 0
    ? (feedbacks.filter(f => f.usefulness_score).reduce((sum, f) => sum + f.usefulness_score, 0) / 
       feedbacks.filter(f => f.usefulness_score).length).toFixed(1)
    : 0;

  const allFeatureSuggestions = feedbacks
    .flatMap(f => f.missing_features || [])
    .filter(f => f && f.trim());

  const featureFrequency = allFeatureSuggestions.reduce((acc, feature) => {
    const normalized = feature.toLowerCase().trim();
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  const topFeatures = Object.entries(featureFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([feature, count]) => ({ feature, count }));

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length,
    percentage: feedbacks.length > 0 ? (feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100 : 0
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Feedback Dashboard</h1>
          <p className="text-slate-600">User insights and feature requests</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Loading feedback...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Feedback</p>
                      <p className="text-3xl font-bold text-slate-900">{feedbacks.length}</p>
                    </div>
                    <MessageSquare className="h-10 w-10 text-slate-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Avg Rating</p>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-slate-900">{averageRating}</p>
                        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Usefulness</p>
                      <p className="text-3xl font-bold text-slate-900">{averageUsefulness}/10</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Feature Requests</p>
                      <p className="text-3xl font-bold text-slate-900">{allFeatureSuggestions.length}</p>
                    </div>
                    <Lightbulb className="h-10 w-10 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Rating Distribution */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900">Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm font-medium text-slate-700">{rating}</span>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Feature Requests */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Top Feature Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topFeatures.length > 0 ? (
                    <div className="space-y-2">
                      {topFeatures.map(({ feature, count }, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-700 capitalize">{feature}</span>
                          <Badge variant="secondary" className="bg-slate-700 text-white">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No feature requests yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {feedbacks.slice(0, 10).map((feedback) => (
                      <div key={feedback.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                            {feedback.usefulness_score && (
                              <Badge variant="secondary" className="ml-2">
                                Usefulness: {feedback.usefulness_score}/10
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(feedback.created_date).toLocaleDateString()}
                          </span>
                        </div>
                        {feedback.comments && (
                          <p className="text-sm text-slate-700 mb-2">{feedback.comments}</p>
                        )}
                        {feedback.missing_features && feedback.missing_features.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {feedback.missing_features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <Lightbulb className="h-3 w-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No feedback yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}