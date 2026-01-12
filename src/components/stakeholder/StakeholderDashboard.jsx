import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Users, AlertTriangle, CheckCircle, Target, Sparkles } from 'lucide-react';
import { analyzeStakeholderPerspectives, generateConflictResolution } from './StakeholderAnalysisEngine';
import { toast } from 'sonner';

const ROLE_ICONS = {
  startup_founder: '🚀',
  engineering_manager: '🏗️',
  frontend_developer: '🎨',
  backend_developer: '⚙️',
  ux_designer: '✨',
  documentation_specialist: '📚',
  security_engineer: '🔒',
  qa_specialist: '🧪',
  observability_lead: '📊'
};

export default function StakeholderDashboard({ assessmentId, strategyId }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolution, setResolution] = useState(null);

  const { data: assessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => base44.entities.Assessment.filter({ id: assessmentId }).then(r => r[0]),
    enabled: !!assessmentId
  });

  const { data: strategy } = useQuery({
    queryKey: ['strategy', strategyId],
    queryFn: () => base44.entities.AdoptionStrategy.filter({ id: strategyId }).then(r => r[0]),
    enabled: !!strategyId
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeStakeholderPerspectives(assessment, strategy);
      setAnalysis(result);
      toast.success('Stakeholder analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolveConflict = async (conflict) => {
    setSelectedConflict(conflict);
    try {
      const res = await generateConflictResolution(conflict, assessment, strategy);
      setResolution(res);
    } catch (error) {
      toast.error('Failed to generate resolution');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'blocking': return 'bg-red-600';
      case 'significant': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  if (!assessment) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Multi-Stakeholder Analysis
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Evaluate from 9 different stakeholder perspectives
              </p>
            </div>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Alignment Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-purple-600">
                  {analysis.overall_alignment_score}%
                </div>
                <div className="flex-1">
                  <Progress value={analysis.overall_alignment_score} />
                  <p className="text-sm text-slate-600 mt-2">
                    {analysis.overall_alignment_score >= 80 ? 'Strong alignment across stakeholders' :
                     analysis.overall_alignment_score >= 60 ? 'Moderate alignment, some conflicts to resolve' :
                     'Low alignment, significant conflicts detected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="stakeholders">
            <TabsList>
              <TabsTrigger value="stakeholders">Stakeholder Views</TabsTrigger>
              <TabsTrigger value="conflicts">Conflicts ({analysis.conflicts?.length || 0})</TabsTrigger>
              <TabsTrigger value="alignment">Alignment Opportunities</TabsTrigger>
              <TabsTrigger value="critical-path">Critical Path</TabsTrigger>
            </TabsList>

            <TabsContent value="stakeholders" className="space-y-4">
              {analysis.stakeholder_analyses?.map((stakeholder, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ROLE_ICONS[stakeholder.role]}</span>
                        <div>
                          <CardTitle className="text-lg">{stakeholder.role_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={stakeholder.satisfaction_score} className="w-24" />
                            <span className="text-sm text-slate-600">
                              {stakeholder.satisfaction_score}% satisfied
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stakeholder.key_concerns?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Key Concerns</h4>
                        <div className="space-y-2">
                          {stakeholder.key_concerns.map((concern, cidx) => (
                            <div key={cidx} className="flex items-start gap-2 p-2 bg-slate-50 rounded">
                              <Badge className={getSeverityColor(concern.severity)}>
                                {concern.severity}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{concern.concern}</div>
                                <div className="text-xs text-slate-600">{concern.impact}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Must-Haves</h4>
                        <ul className="text-sm space-y-1">
                          {stakeholder.must_haves?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Deal Breakers</h4>
                        <ul className="text-sm space-y-1">
                          {stakeholder.deal_breakers?.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="conflicts" className="space-y-4">
              {analysis.conflicts?.map((conflict, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{ROLE_ICONS[conflict.stakeholder_a]}</span>
                          <span className="text-slate-600">vs</span>
                          <span className="text-xl">{ROLE_ICONS[conflict.stakeholder_b]}</span>
                          <Badge className={getImpactColor(conflict.impact)}>
                            {conflict.impact}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{conflict.issue}</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleResolveConflict(conflict)}
                        variant="outline"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Resolution Strategies</h4>
                      <ul className="space-y-1">
                        {conflict.resolution_strategies?.map((strategy, sidx) => (
                          <li key={sidx} className="text-sm text-slate-700">• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedConflict && resolution && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-900">AI-Generated Resolution Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Root Cause</h4>
                      <p className="text-sm text-purple-800">{resolution.root_cause}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Compromise Solutions</h4>
                      <div className="space-y-3">
                        {resolution.compromise_solutions?.map((sol, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg">
                            <div className="font-medium text-purple-900 mb-2">{sol.solution}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="font-semibold text-green-700">Pros for {selectedConflict.stakeholder_a}:</div>
                                <ul className="mt-1 space-y-0.5">
                                  {sol.pros_for_a?.map((pro, pidx) => (
                                    <li key={pidx}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-semibold text-green-700">Pros for {selectedConflict.stakeholder_b}:</div>
                                <ul className="mt-1 space-y-0.5">
                                  {sol.pros_for_b?.map((pro, pidx) => (
                                    <li key={pidx}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-xs text-purple-700">
                              <span>Complexity: {sol.implementation_complexity}</span>
                              <span>Timeline: {sol.timeline}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Phased Approach</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <div className="font-medium text-xs text-purple-700 mb-1">Quick Wins</div>
                          <ul className="text-xs space-y-0.5">
                            {resolution.phased_approach?.quick_wins?.map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium text-xs text-purple-700 mb-1">Medium Term</div>
                          <ul className="text-xs space-y-0.5">
                            {resolution.phased_approach?.medium_term?.map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium text-xs text-purple-700 mb-1">Long Term</div>
                          <ul className="text-xs space-y-0.5">
                            {resolution.phased_approach?.long_term?.map((item, idx) => (
                              <li key={idx}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alignment">
              <div className="space-y-4">
                {analysis.alignment_opportunities?.map((opp, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {opp.stakeholders?.map((role, ridx) => (
                              <span key={ridx} className="text-lg">{ROLE_ICONS[role]}</span>
                            ))}
                          </div>
                          <h4 className="font-semibold text-slate-900 mb-1">{opp.shared_goal}</h4>
                          <p className="text-sm text-slate-700">{opp.recommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="critical-path">
              <div className="space-y-3">
                {analysis.critical_path?.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge className={item.priority === 'critical' ? 'bg-red-600' : item.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'}>
                          {item.priority}
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{item.action}</h4>
                          <p className="text-sm text-slate-700 mb-2">{item.rationale}</p>
                          <div className="flex items-center gap-2">
                            {item.stakeholders_involved?.map((role, ridx) => (
                              <span key={ridx} className="text-sm">{ROLE_ICONS[role]}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}