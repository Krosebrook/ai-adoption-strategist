import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MitigationProgressTracker({ strategy, riskAlerts }) {
  const queryClient = useQueryClient();

  const updateStepMutation = useMutation({
    mutationFn: async ({ alertId, stepIndex, newStatus }) => {
      const alert = riskAlerts.find(a => a.id === alertId);
      const updatedSteps = [...alert.mitigation_steps];
      updatedSteps[stepIndex].status = newStatus;
      
      return await base44.entities.RiskAlert.update(alertId, {
        mitigation_steps: updatedSteps
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riskAlerts'] });
      toast.success('Mitigation step updated');
    }
  });

  const handleUpdateStep = (alertId, stepIndex, newStatus) => {
    updateStepMutation.mutate({ alertId, stepIndex, newStatus });
  };

  const calculateProgress = (steps) => {
    if (!steps || steps.length === 0) return 0;
    const completed = steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white';
      case 'in_progress': return 'bg-blue-600 text-white';
      case 'pending': return 'bg-slate-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-600';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-slate-300';
    }
  };

  const activeRisks = riskAlerts.filter(a => a.status !== 'resolved' && a.mitigation_steps?.length > 0);

  if (activeRisks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600">No active mitigation plans</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activeRisks.map(alert => {
        const progress = calculateProgress(alert.mitigation_steps);
        
        return (
          <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {alert.risk_description}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getStatusColor(alert.status)}>
                      {alert.status}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {alert.risk_category}
                    </Badge>
                    <Badge className={
                      alert.severity === 'critical' ? 'bg-red-600' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    Mitigation Progress
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-slate-600 mt-1">
                  {alert.mitigation_steps.filter(s => s.status === 'completed').length} of {alert.mitigation_steps.length} steps completed
                </div>
              </div>

              {/* Mitigation Steps */}
              <div className="space-y-3">
                {alert.mitigation_steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border-2 ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900">
                            Step {idx + 1}: {step.step}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {step.priority}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {step.owner}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {step.timeline}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {step.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {step.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {step.status}
                      </Badge>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-2">
                      {step.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStep(alert.id, idx, 'in_progress')}
                          disabled={updateStepMutation.isPending}
                        >
                          Start
                        </Button>
                      )}
                      {step.status === 'in_progress' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStep(alert.id, idx, 'completed')}
                          disabled={updateStepMutation.isPending}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}