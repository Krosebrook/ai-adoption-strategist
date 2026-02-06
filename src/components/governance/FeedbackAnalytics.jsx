import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, TrendingUp, TrendingDown, AlertCircle, 
  CheckCircle, Eye, MessageSquare, BarChart3 
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FeedbackAnalytics() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: allFeedback = [] } = useQuery({
    queryKey: ['aiFeedback'],
    queryFn: () => base44.entities.AIFeedback.list('-created_date', 1000)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIFeedback.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aiFeedback']);
    }
  });

  // Filter feedback
  const filteredFeedback = allFeedback.filter(f => {
    if (selectedAgent !== 'all' && f.agent_name !== selectedAgent) return false;
    if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
    return true;
  });

  // Calculate metrics
  const metrics = {
    total: filteredFeedback.length,
    avgRating: filteredFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (filteredFeedback.length || 1),
    positive: filteredFeedback.filter(f => f.rating >= 4).length,
    negative: filteredFeedback.filter(f => f.rating <= 2).length,
    needsReview: filteredFeedback.filter(f => f.status === 'new').length,
    addressed: filteredFeedback.filter(f => f.status === 'addressed').length
  };

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} ⭐`,
    count: filteredFeedback.filter(f => f.rating === rating).length
  }));

  // Feedback by agent
  const agentNames = [...new Set(allFeedback.map(f => f.agent_name))];
  const feedbackByAgent = agentNames.map(agent => ({
    agent: agent.replace('Advisor', '').replace('Analyst', ''),
    avgRating: allFeedback
      .filter(f => f.agent_name === agent)
      .reduce((sum, f) => sum + (f.rating || 0), 0) / 
      (allFeedback.filter(f => f.agent_name === agent).length || 1),
    count: allFeedback.filter(f => f.agent_name === agent).length
  }));

  // Issues breakdown
  const allIssues = filteredFeedback
    .flatMap(f => f.specific_issues || [])
    .reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {});
  
  const issuesData = Object.entries(allIssues).map(([issue, count]) => ({
    issue: issue.replace('_', ' '),
    count
  }));

  // Trend data (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const trendData = last30Days.map(date => {
    const dayFeedback = allFeedback.filter(f => 
      f.created_date && f.created_date.split('T')[0] === date
    );
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: dayFeedback.length,
      avgRating: dayFeedback.length > 0 
        ? dayFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / dayFeedback.length
        : 0
    };
  });

  const handleReviewFeedback = (id, status, notes) => {
    updateFeedbackMutation.mutate({
      id,
      data: {
        status,
        reviewed_by: user?.email,
        reviewed_date: new Date().toISOString(),
        resolution_notes: notes
      }
    });
  };

  const COLORS = ['#E88A1D', '#D07612', '#9A6B3E', '#6B4423', '#4A3018'];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-slate-600">Total Feedback</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold flex items-center gap-1">
              {metrics.avgRating.toFixed(1)}
              <Star className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xs text-slate-600">Avg Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{metrics.positive}</div>
            <p className="text-xs text-slate-600">Positive (4-5⭐)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{metrics.negative}</div>
            <p className="text-xs text-slate-600">Negative (1-2⭐)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{metrics.needsReview}</div>
            <p className="text-xs text-slate-600">Needs Review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{metrics.addressed}</div>
            <p className="text-xs text-slate-600">Addressed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="all">All Agents</option>
              {agentNames.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="addressed">Addressed</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#E88A1D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feedbackByAgent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="avgRating" fill="#D07612" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#E88A1D" name="Count" />
                <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#D07612" name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {issuesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={issuesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ issue, percent }) => `${issue}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {issuesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">
                No issues reported
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredFeedback.slice(0, 20).map(feedback => (
              <FeedbackItem 
                key={feedback.id} 
                feedback={feedback}
                onReview={handleReviewFeedback}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackItem({ feedback, onReview, isAdmin }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < feedback.rating 
                      ? 'fill-orange-500 text-orange-500' 
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <Badge variant="outline">{feedback.agent_name}</Badge>
            <Badge className={
              feedback.status === 'new' ? 'bg-orange-500' :
              feedback.status === 'addressed' ? 'bg-green-600' :
              'bg-blue-600'
            }>
              {feedback.status}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-700 mb-2">
            <span className="font-medium">{feedback.feedback_type?.replace('_', ' ')}</span>
            {feedback.specific_issues && feedback.specific_issues.length > 0 && (
              <span className="text-slate-500">
                {' • '}{feedback.specific_issues.join(', ').replace(/_/g, ' ')}
              </span>
            )}
          </p>
          
          {feedback.comment && (
            <p className="text-sm text-slate-600 italic">"{feedback.comment}"</p>
          )}
          
          <p className="text-xs text-slate-500 mt-2">
            {feedback.user_email} • {new Date(feedback.created_date).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {isAdmin && feedback.status === 'new' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(feedback.id, 'reviewed', 'Under review')}
              >
                Review
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onReview(feedback.id, 'addressed', 'Addressed via system improvement')}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {showDetails && feedback.context && (
        <div className="mt-4 p-3 bg-slate-50 rounded space-y-2 text-xs">
          <div>
            <p className="font-medium text-slate-700">Prompt:</p>
            <p className="text-slate-600">{feedback.context.prompt}</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Response:</p>
            <p className="text-slate-600">{feedback.context.response?.substring(0, 200)}...</p>
          </div>
        </div>
      )}
    </div>
  );
}