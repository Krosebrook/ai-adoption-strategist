import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, MessageSquare, Sparkles, ThumbsUp, ThumbsDown, 
  CheckCircle, Loader2, Send, Plus, FileText, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCollaborativeSuggestions, summarizeStrategySession, analyzeRoadmapEdit } from './CollaborativeStrategyEngine';

export default function StrategySessionPanel({ strategy }) {
  const [activeSession, setActiveSession] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('comment');
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: sessions = [] } = useQuery({
    queryKey: ['strategySessions', strategy?.id],
    queryFn: () => strategy ? base44.entities.StrategySession.filter({ strategy_id: strategy.id }, '-created_date') : [],
    enabled: !!strategy,
    initialData: []
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.StrategySession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategySessions'] });
      toast.success('Session created!');
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StrategySession.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategySessions'] });
    }
  });

  const handleCreateSession = async () => {
    await createSessionMutation.mutateAsync({
      strategy_id: strategy.id,
      session_name: `Strategy Session - ${new Date().toLocaleDateString()}`,
      status: 'active',
      participants: [{
        email: user?.email,
        name: user?.full_name,
        role: 'facilitator',
        joined_at: new Date().toISOString()
      }],
      discussion_points: [],
      roadmap_edits: [],
      ai_suggestions: [],
      started_at: new Date().toISOString()
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeSession) return;

    const newPoint = {
      id: `dp_${Date.now()}`,
      author_email: user?.email,
      author_name: user?.full_name,
      content: newComment,
      type: commentType,
      timestamp: new Date().toISOString(),
      replies: [],
      votes: { up: [], down: [] },
      resolved: false
    };

    await updateSessionMutation.mutateAsync({
      id: activeSession.id,
      data: {
        discussion_points: [...(activeSession.discussion_points || []), newPoint]
      }
    });

    setNewComment('');
    setActiveSession({
      ...activeSession,
      discussion_points: [...(activeSession.discussion_points || []), newPoint]
    });
  };

  const handleVote = async (pointId, voteType) => {
    const updatedPoints = activeSession.discussion_points.map(point => {
      if (point.id === pointId) {
        const votes = { ...point.votes };
        const userEmail = user?.email;
        
        if (voteType === 'up') {
          if (votes.up?.includes(userEmail)) {
            votes.up = votes.up.filter(e => e !== userEmail);
          } else {
            votes.up = [...(votes.up || []), userEmail];
            votes.down = (votes.down || []).filter(e => e !== userEmail);
          }
        } else {
          if (votes.down?.includes(userEmail)) {
            votes.down = votes.down.filter(e => e !== userEmail);
          } else {
            votes.down = [...(votes.down || []), userEmail];
            votes.up = (votes.up || []).filter(e => e !== userEmail);
          }
        }
        
        return { ...point, votes };
      }
      return point;
    });

    await updateSessionMutation.mutateAsync({
      id: activeSession.id,
      data: { discussion_points: updatedPoints }
    });

    setActiveSession({ ...activeSession, discussion_points: updatedPoints });
  };

  const handleGetSuggestions = async () => {
    if (!activeSession) return;

    setGenerating(true);
    try {
      const result = await generateCollaborativeSuggestions(
        strategy,
        activeSession.discussion_points,
        'Strategy refinement'
      );

      const suggestions = result.suggestions?.map(s => ({ ...s, status: 'pending' })) || [];
      
      await updateSessionMutation.mutateAsync({
        id: activeSession.id,
        data: { ai_suggestions: [...(activeSession.ai_suggestions || []), ...suggestions] }
      });

      setActiveSession({
        ...activeSession,
        ai_suggestions: [...(activeSession.ai_suggestions || []), ...suggestions]
      });

      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setGenerating(false);
    }
  };

  const handleSummarize = async () => {
    if (!activeSession) return;

    setGenerating(true);
    try {
      const summary = await summarizeStrategySession(activeSession, strategy);
      
      await updateSessionMutation.mutateAsync({
        id: activeSession.id,
        data: { ai_summary: summary }
      });

      setActiveSession({ ...activeSession, ai_summary: summary });
      toast.success('Session summarized!');
    } catch (error) {
      toast.error('Failed to summarize session');
    } finally {
      setGenerating(false);
    }
  };

  const getTypeColor = (type) => ({
    comment: 'bg-slate-500',
    suggestion: 'bg-blue-600',
    decision: 'bg-green-600',
    question: 'bg-purple-600',
    action_item: 'bg-orange-600'
  }[type] || 'bg-slate-500');

  if (!activeSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Collaborative Strategy Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => setActiveSession(session)}
                  >
                    <div>
                      <h4 className="font-semibold">{session.session_name}</h4>
                      <p className="text-sm text-slate-600">
                        {session.participants?.length || 0} participants • {session.discussion_points?.length || 0} discussion points
                      </p>
                    </div>
                    <Badge className={session.status === 'active' ? 'bg-green-600' : 'bg-slate-500'}>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-4">No sessions yet</p>
            )}
            
            <Button onClick={handleCreateSession} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setActiveSession(null)}>
          ← Back to Sessions
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGetSuggestions} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Suggestions
          </Button>
          <Button onClick={handleSummarize} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Summarize
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discussion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discussion">
            <MessageSquare className="h-4 w-4 mr-1" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-1" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussion" className="space-y-4">
          {/* Add Comment */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-2 mb-2">
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="action_item">Action Item</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add to discussion..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discussion Points */}
          <div className="space-y-3">
            {activeSession.discussion_points?.map((point) => (
              <Card key={point.id} className={point.resolved ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(point.type)}>{point.type}</Badge>
                      <span className="font-medium text-sm">{point.author_name}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(point.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {point.resolved && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-slate-700 mb-3">{point.content}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(point.id, 'up')}
                      className={`flex items-center gap-1 text-sm ${point.votes?.up?.includes(user?.email) ? 'text-green-600' : 'text-slate-500'}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {point.votes?.up?.length || 0}
                    </button>
                    <button
                      onClick={() => handleVote(point.id, 'down')}
                      className={`flex items-center gap-1 text-sm ${point.votes?.down?.includes(user?.email) ? 'text-red-600' : 'text-slate-500'}`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {point.votes?.down?.length || 0}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="space-y-3">
            {activeSession.ai_suggestions?.map((suggestion, idx) => (
              <Card key={idx} className="border-l-4 border-l-purple-600">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{suggestion.category}</Badge>
                    <Badge className={
                      suggestion.priority === 'high' ? 'bg-red-600' :
                      suggestion.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                    }>
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-slate-900 mb-2">{suggestion.suggestion}</p>
                  <p className="text-sm text-slate-600">{suggestion.rationale}</p>
                </CardContent>
              </Card>
            ))}
            {(!activeSession.ai_suggestions || activeSession.ai_suggestions.length === 0) && (
              <p className="text-slate-600 text-center py-8">
                Click "AI Suggestions" to get collaborative decision-making recommendations
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary">
          {activeSession.ai_summary ? (
            <div className="space-y-4">
              {/* Key Decisions */}
              {activeSession.ai_summary.key_decisions?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Key Decisions</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {activeSession.ai_summary.key_decisions.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Items */}
              {activeSession.ai_summary.action_items?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Action Items</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {activeSession.ai_summary.action_items.map((item, i) => (
                        <div key={i} className="bg-orange-50 border border-orange-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <span className="font-medium">{item.action}</span>
                            <Badge>{item.priority}</Badge>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            Owner: {item.owner} • Due: {item.deadline}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              {activeSession.ai_summary.next_steps?.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Next Steps</CardTitle></CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {activeSession.ai_summary.next_steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-purple-600">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">
              Click "Summarize" to generate an AI summary of this session
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}