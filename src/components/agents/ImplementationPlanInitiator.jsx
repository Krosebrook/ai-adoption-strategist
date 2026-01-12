import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Users, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeStakeholderPerspectives } from '../stakeholder/StakeholderAnalysisEngine';
import { generateStakeholderAwareImplementationPlan, createTasksFromPlan } from '../implementation/StakeholderAwareImplementationEngine';
import { toast } from 'sonner';

export default function ImplementationPlanInitiator() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [stakeholderAnalysis, setStakeholderAnalysis] = useState(null);
  const [implementationPlan, setImplementationPlan] = useState(null);

  const queryClient = useQueryClient();

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 20)
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 20)
  });

  const createImplementationMutation = useMutation({
    mutationFn: (data) => base44.entities.ImplementationPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementationPlans'] });
    }
  });

  const handleGeneratePlan = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setGenerating(true);
    try {
      // Step 1: Analyze stakeholder perspectives
      toast.info('Analyzing stakeholder perspectives...');
      const analysis = await analyzeStakeholderPerspectives(selectedAssessment, selectedStrategy);
      setStakeholderAnalysis(analysis);

      // Step 2: Generate stakeholder-aware implementation plan
      toast.info('Generating implementation plan...');
      const plan = await generateStakeholderAwareImplementationPlan(selectedAssessment, analysis, selectedStrategy);
      setImplementationPlan(plan);

      // Step 3: Create strategy if none exists
      let strategyId = selectedStrategy?.id;
      if (!strategyId) {
        const newStrategy = await base44.entities.AdoptionStrategy.create({
          assessment_id: selectedAssessment.id,
          organization_name: selectedAssessment.organization_name,
          platform: selectedAssessment.recommended_platforms?.[0]?.platform_name,
          status: 'draft',
          roadmap: {
            executive_summary: plan.executive_summary,
            phases: plan.phases.map(p => ({
              phase_name: p.phase_name,
              duration: p.duration,
              objectives: p.objectives
            }))
          }
        });
        strategyId = newStrategy.id;
      }

      // Step 4: Create implementation plan record
      const implPlan = await createImplementationMutation.mutateAsync({
        assessment_id: selectedAssessment.id,
        strategy_id: strategyId,
        platform: selectedAssessment.recommended_platforms?.[0]?.platform_name,
        plan_data: plan,
        stakeholder_analysis: analysis,
        status: 'draft'
      });

      // Step 5: Create tasks from plan
      toast.info('Creating tasks...');
      await createTasksFromPlan(plan, strategyId, selectedAssessment.id);

      toast.success('Implementation plan generated successfully!');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error('Failed to generate implementation plan');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            AI-Generated Implementation Plan
          </CardTitle>
          <p className="text-sm text-slate-600">
            Generate a stakeholder-aware implementation plan with task assignments to roles and AI agents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Assessment</label>
            <Select
              value={selectedAssessment?.id}
              onValueChange={(id) => {
                const assessment = assessments.find(a => a.id === id);
                setSelectedAssessment(assessment);
                setStakeholderAnalysis(null);
                setImplementationPlan(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.organization_name} - {assessment.recommended_platforms?.[0]?.platform_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAssessment && (
            <div>
              <label className="text-sm font-medium mb-2 block">Existing Strategy (Optional)</label>
              <Select
                value={selectedStrategy?.id || 'none'}
                onValueChange={(id) => {
                  const strategy = strategies.find(s => s.id === id);
                  setSelectedStrategy(strategy || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Create new or link to existing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Create New Strategy</SelectItem>
                  {strategies
                    .filter(s => s.assessment_id === selectedAssessment.id)
                    .map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.organization_name} - {strategy.status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleGeneratePlan}
            disabled={!selectedAssessment || generating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Generate Implementation Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {stakeholderAnalysis && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              Stakeholder Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-blue-600">
                  {stakeholderAnalysis.overall_alignment_score}%
                </div>
                <div className="flex-1">
                  <div className="text-sm text-blue-900 font-medium">Overall Alignment</div>
                  <div className="text-xs text-blue-700">
                    {stakeholderAnalysis.conflicts?.length || 0} conflicts identified
                  </div>
                </div>
              </div>
              {stakeholderAnalysis.conflicts?.slice(0, 3).map((conflict, idx) => (
                <div key={idx} className="text-sm p-2 bg-white rounded border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span className="text-blue-900">{conflict.issue}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {implementationPlan && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              {implementationPlan.plan_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-800">{implementationPlan.executive_summary}</p>

            <div>
              <h4 className="font-semibold text-green-900 mb-2">Phases</h4>
              <div className="space-y-2">
                {implementationPlan.phases?.map((phase, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-green-900">{phase.phase_name}</div>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </div>
                    <div className="text-xs text-green-700">
                      {phase.tasks?.length || 0} tasks assigned to stakeholder roles
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-green-900 mb-2">AI Agent Collaboration</h4>
              <div className="space-y-2">
                {implementationPlan.agent_collaboration_model?.agent_assignments?.map((agent, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border border-green-200 text-xs">
                    <div className="font-medium text-green-900">{agent.agent_name}</div>
                    <div className="text-green-700">{agent.role_in_implementation}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}