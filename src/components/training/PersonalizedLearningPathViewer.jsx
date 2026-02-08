import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target, Loader2, CheckCircle, Lock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PersonalizedLearningPathViewer({ assessmentId }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: learningPaths = [], isLoading } = useQuery({
    queryKey: ['learningPaths', user?.email],
    queryFn: () => base44.entities.LearningPath.filter({ 
      user_email: user.email,
      status: 'active'
    }),
    enabled: !!user,
    initialData: []
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['trainingModules'],
    queryFn: () => base44.entities.TrainingModule.list(),
    initialData: []
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['trainingProgress', user?.email],
    queryFn: () => base44.entities.TrainingProgress.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const generatePath = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generatePersonalizedLearningPath', {
        assessmentId,
        forceRegenerate: learningPaths.length > 0
      });
      
      if (response.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['learningPaths'] });
        toast.success('Learning path generated!');
      }
    } catch (error) {
      toast.error('Failed to generate learning path');
    } finally {
      setGenerating(false);
    }
  };

  const activePath = learningPaths[0];

  const getModuleStatus = (moduleId) => {
    const prog = progress.find(p => p.module_id === moduleId);
    if (!prog) return 'not_started';
    return prog.status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!activePath) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Learning Path Yet</h3>
          <p className="text-gray-600 mb-4">
            Generate a personalized learning path based on your role and skill gaps
          </p>
          <Button onClick={generatePath} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Learning Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Path Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {activePath.path_name}
            </CardTitle>
            <Button onClick={() => generatePath()} size="sm" variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{activePath.progress_percentage}%</span>
          </div>
          <Progress value={activePath.progress_percentage} />
          
          {activePath.personalization_notes && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
              <strong className="text-purple-800">Why this path?</strong>
              <p className="text-gray-700 mt-1">{activePath.personalization_notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs text-gray-500">Estimated Time</div>
              <div className="font-semibold">{activePath.total_estimated_hours} hours</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Modules</div>
              <div className="font-semibold">{activePath.recommended_modules?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {activePath.identified_skill_gaps && activePath.identified_skill_gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identified Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePath.identified_skill_gaps.map((gap, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium">{gap.skill}</span>
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{gap.gap_description}</div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">Current: {gap.current_level}</Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant="outline">Target: {gap.target_level}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Learning Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activePath.recommended_modules?.sort((a, b) => a.sequence_order - b.sequence_order).map((rec) => {
              const module = modules.find(m => m.id === rec.module_id);
              const status = getModuleStatus(rec.module_id);
              const isCompleted = status === 'completed';
              const isLocked = rec.sequence_order > 1 && !isCompleted;

              return (
                <div key={rec.module_id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold">
                        {rec.sequence_order}
                      </div>
                      <div>
                        <h4 className="font-semibold">{module?.title || 'Module'}</h4>
                        <div className="flex gap-2 mt-1">
                          {rec.is_required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">{module?.difficulty_level}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Play className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                  
                  {rec.addresses_gaps && rec.addresses_gaps.length > 0 && (
                    <div className="text-xs text-gray-500 mb-3">
                      Addresses: {rec.addresses_gaps.join(', ')}
                    </div>
                  )}

                  {!isCompleted && !isLocked && (
                    <Link to={createPageUrl('Training')}>
                      <Button size="sm" className="w-full">
                        Start Module
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}