import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Map, Shield, Activity, Plus, RefreshCw, DollarSign, TrendingUp, FileText, AlertTriangle, Target } from 'lucide-react';
import { generateAdoptionStrategy, identifyRisks, monitorAndRecommend, createCheckpoint } from '../components/strategy/StrategyAutomationEngine';
import { forecastLongTermCosts, identifyCostSavings, simulateBudgetScenario } from '../components/financial/FinancialOptimizationEngine';
import StrategyRoadmap from '../components/strategy/StrategyRoadmap';
import RiskManagement from '../components/strategy/RiskManagement';
import ProgressMonitor from '../components/strategy/ProgressMonitor';
import FinancialForecast from '../components/financial/FinancialForecast';
import CostOptimizationPanel from '../components/financial/CostOptimizationPanel';
import BudgetScenarioSimulator from '../components/financial/BudgetScenarioSimulator';
import AdvancedScenarioModeler from '../components/scenarios/AdvancedScenarioModeler';
import CustomComplianceUploader from '../components/compliance/CustomComplianceUploader';
import RiskAlertsDashboard from '../components/risk/RiskAlertsDashboard';
import { toast } from 'sonner';

export default function StrategyAutomationPage() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [checkpoint, setCheckpoint] = useState(null);
  const [financialForecast, setFinancialForecast] = useState(null);
  const [costSavings, setCostSavings] = useState(null);
  const [budgetScenarios, setBudgetScenarios] = useState([]);
  const [scenarioPlans, setScenarioPlans] = useState(null);
  const [generatingScenarios, setGeneratingScenarios] = useState(false);

  const queryClient = useQueryClient();

  // Fetch completed assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50),
    initialData: []
  });

  // Fetch strategies
  const { data: strategies = [] } = useQuery({
    queryKey: ['adoptionStrategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 100),
    initialData: []
  });

  // Fetch checkpoints for selected strategy
  const { data: checkpoints = [] } = useQuery({
    queryKey: ['strategyCheckpoints', selectedStrategy?.id],
    queryFn: () => selectedStrategy ? base44.entities.StrategyCheckpoint.filter({ strategy_id: selectedStrategy.id }, '-checkpoint_date') : [],
    enabled: !!selectedStrategy,
    initialData: []
  });

  const createStrategyMutation = useMutation({
    mutationFn: (data) => base44.entities.AdoptionStrategy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionStrategies'] });
      toast.success('Strategy created successfully!');
    }
  });

  const updateStrategyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdoptionStrategy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionStrategies'] });
    }
  });

  const createCheckpointMutation = useMutation({
    mutationFn: (data) => base44.entities.StrategyCheckpoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategyCheckpoints'] });
      toast.success('Checkpoint created!');
    }
  });

  const createBudgetScenarioMutation = useMutation({
    mutationFn: (data) => base44.entities.BudgetScenario.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetScenarios'] });
      toast.success('Budget scenario saved!');
    }
  });

  const handleGenerateStrategy = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setGenerating(true);
    try {
      // Generate strategy and risks in parallel
      const [strategyData, riskData] = await Promise.all([
        generateAdoptionStrategy(selectedAssessment),
        identifyRisks(selectedAssessment, { platform: selectedAssessment.recommended_platforms?.[0]?.platform_name })
      ]);

      const fullStrategy = {
        ...strategyData,
        risk_analysis: riskData
      };

      await createStrategyMutation.mutateAsync(fullStrategy);
    } catch (error) {
      console.error('Failed to generate strategy:', error);
      toast.error('Failed to generate strategy');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshRisks = async () => {
    if (!selectedStrategy || !selectedAssessment) return;

    setGenerating(true);
    try {
      const riskData = await identifyRisks(selectedAssessment, selectedStrategy);
      
      await updateStrategyMutation.mutateAsync({
        id: selectedStrategy.id,
        data: { risk_analysis: riskData }
      });

      toast.success('Risk analysis updated!');
    } catch (error) {
      toast.error('Failed to update risks');
    } finally {
      setGenerating(false);
    }
  };

  const handleMonitorProgress = async () => {
    if (!selectedStrategy) return;

    setGenerating(true);
    try {
      const analysis = await monitorAndRecommend(selectedStrategy, null);
      
      // Update strategy with new recommendations
      const newRecommendations = analysis.recommendations?.map(rec => ({
        date: new Date().toISOString(),
        ...rec,
        implemented: false
      })) || [];

      await updateStrategyMutation.mutateAsync({
        id: selectedStrategy.id,
        data: {
          ai_recommendations: [...(selectedStrategy.ai_recommendations || []), ...newRecommendations]
        }
      });

      setRecommendations(analysis.recommendations);
      
      // Create checkpoint
      const checkpointData = await createCheckpoint(selectedStrategy);
      await createCheckpointMutation.mutateAsync(checkpointData);
      setCheckpoint(checkpointData);

      toast.success('Progress analysis complete!');
    } catch (error) {
      toast.error('Failed to monitor progress');
    } finally {
      setGenerating(false);
    }
  };

  const handleForecastCosts = async () => {
    if (!selectedStrategy || !selectedAssessment) return;

    setGenerating(true);
    try {
      const forecast = await forecastLongTermCosts(selectedStrategy, selectedAssessment, {
        monthly: 0,
        annual: 0
      });
      setFinancialForecast(forecast);
      toast.success('Financial forecast complete!');
    } catch (error) {
      toast.error('Failed to forecast costs');
    } finally {
      setGenerating(false);
    }
  };

  const handleIdentifySavings = async () => {
    if (!selectedStrategy || !selectedAssessment || !financialForecast) return;

    setGenerating(true);
    try {
      const savings = await identifyCostSavings(selectedStrategy, selectedAssessment, financialForecast);
      setCostSavings(savings);
      toast.success('Cost savings identified!');
    } catch (error) {
      toast.error('Failed to identify cost savings');
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateScenario = async (scenarioConfig) => {
    if (!selectedStrategy || !selectedAssessment) return;

    setGenerating(true);
    try {
      const result = await simulateBudgetScenario(selectedStrategy, selectedAssessment, {
        ...scenarioConfig,
        strategy_id: selectedStrategy.id
      });
      
      await createBudgetScenarioMutation.mutateAsync(result);
      setBudgetScenarios([...budgetScenarios, result]);
      toast.success('Budget scenario simulated!');
    } catch (error) {
      toast.error('Failed to simulate scenario');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateScenarios = async () => {
    if (!selectedAssessment) return;

    setGeneratingScenarios(true);
    try {
      const platforms = selectedAssessment.recommended_platforms || [];
      const scenarios = await generateScenarioPlans(selectedAssessment, platforms);
      setScenarioPlans(scenarios);
      toast.success('Scenario plans generated!');
    } catch (error) {
      console.error('Scenario generation failed:', error);
      toast.error('Failed to generate scenarios');
    } finally {
      setGeneratingScenarios(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              AI Strategy Automation
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Automated strategy generation, risk management, and real-time progress monitoring
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="strategies">
              <Map className="h-4 w-4 mr-2" />
              Strategies
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </TabsTrigger>
            <TabsTrigger value="scenarios">
              <Target className="h-4 w-4 mr-2" />
              Scenario Planning
            </TabsTrigger>
            <TabsTrigger value="risk-alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            {selectedStrategy ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setSelectedStrategy(null)}>
                    ← Back to Strategies
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRefreshRisks}
                      disabled={generating}
                    >
                      {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Refresh Risks
                    </Button>
                    <Button
                      onClick={handleMonitorProgress}
                      disabled={generating}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                      Monitor Progress
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="roadmap" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                    <TabsTrigger value="risks">Risk Management</TabsTrigger>
                    <TabsTrigger value="progress">Progress Monitor</TabsTrigger>
                    <TabsTrigger value="financial">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="scenarios">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Scenario Modeling
                    </TabsTrigger>
                    <TabsTrigger value="compliance">
                      <FileText className="h-4 w-4 mr-1" />
                      Custom Compliance
                    </TabsTrigger>
                    <TabsTrigger value="tasks">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="versions">
                      Versions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="roadmap">
                    <StrategyRoadmap strategy={selectedStrategy} />
                  </TabsContent>

                  <TabsContent value="risks">
                    <RiskManagement riskAnalysis={selectedStrategy.risk_analysis} />
                  </TabsContent>

                  <TabsContent value="progress">
                    <ProgressMonitor
                      strategy={selectedStrategy}
                      recommendations={recommendations || selectedStrategy.ai_recommendations}
                      checkpoint={checkpoint || checkpoints[0]}
                    />
                  </TabsContent>

                  <TabsContent value="financial" className="space-y-6">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleForecastCosts}
                        disabled={generating}
                        variant="outline"
                      >
                        {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Forecast Costs
                      </Button>
                      <Button
                        onClick={handleIdentifySavings}
                        disabled={generating || !financialForecast}
                        variant="outline"
                      >
                        {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Identify Savings
                      </Button>
                    </div>

                    {financialForecast && <FinancialForecast forecast={financialForecast} />}
                    
                    {costSavings && <CostOptimizationPanel costSavings={costSavings} />}

                    <BudgetScenarioSimulator
                      onSimulate={handleSimulateScenario}
                      generating={generating}
                    />

                    {budgetScenarios.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Simulated Scenarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {budgetScenarios.map((scenario, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">{scenario.scenario_name}</h4>
                                    <p className="text-sm text-slate-600">
                                      Budget: ${(scenario.total_budget / 1000).toFixed(0)}K - {scenario.budget_period}
                                    </p>
                                  </div>
                                  <Badge className={
                                    scenario.scenario_analysis?.feasibility === 'fully_feasible' ? 'bg-green-600' :
                                    scenario.scenario_analysis?.feasibility === 'feasible_with_adjustments' ? 'bg-blue-600' :
                                    scenario.scenario_analysis?.feasibility === 'challenging' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                  }>
                                    {scenario.scenario_analysis?.feasibility?.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="scenarios">
                    <AdvancedScenarioModeler strategy={selectedStrategy} />
                  </TabsContent>

                  <TabsContent value="compliance">
                    <CustomComplianceUploader />
                  </TabsContent>

                  <TabsContent value="tasks">
                    <TaskBoard
                      resourceType="strategy"
                      resourceId={selectedStrategy.id}
                      phases={selectedStrategy.roadmap?.phases?.map(p => p.phase_name) || []}
                    />
                  </TabsContent>

                  <TabsContent value="versions">
                    <VersionHistory
                      resourceType="strategy"
                      resourceId={selectedStrategy.id}
                      onRestore={async (snapshot) => {
                        await base44.entities.AdoptionStrategy.update(selectedStrategy.id, snapshot);
                        queryClient.invalidateQueries({ queryKey: ['adoptionStrategies'] });
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies.map((strategy) => (
                  <Card key={strategy.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedStrategy(strategy)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{strategy.organization_name}</CardTitle>
                          <p className="text-sm text-slate-600 mt-1">{strategy.platform}</p>
                        </div>
                        <Badge className={
                          strategy.status === 'completed' ? 'bg-green-600' :
                          strategy.status === 'active' ? 'bg-blue-600' :
                          strategy.status === 'paused' ? 'bg-yellow-600' :
                          'bg-slate-400'
                        }>
                          {strategy.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{strategy.roadmap?.phases?.length || 0} phases</Badge>
                          <Badge variant="outline">{strategy.risk_analysis?.identified_risks?.length || 0} risks</Badge>
                          <Badge variant="outline">{strategy.milestones?.length || 0} milestones</Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          Progress: {strategy.progress_tracking?.overall_progress || 0}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Multi-Scenario Strategic Planning
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Generate and compare conservative, balanced, and aggressive scenarios
                </p>
              </CardHeader>
              <CardContent>
                <Select value={selectedAssessment?.id} onValueChange={(id) => setSelectedAssessment(assessments.find(a => a.id === id))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.organization_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleGenerateScenarios}
                  disabled={!selectedAssessment || generatingScenarios}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  {generatingScenarios ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Scenario Plans
                </Button>
              </CardContent>
            </Card>

            {scenarioPlans && (
              <ScenarioComparison 
                scenarioPlans={scenarioPlans}
                onSelectScenario={(scenario) => toast.success(`Selected ${scenario.scenario_name} scenario`)}
              />
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Generate AI Adoption Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Assessment</label>
                  <Select value={selectedAssessment?.id} onValueChange={(id) => {
                    const assessment = assessments.find(a => a.id === id);
                    setSelectedAssessment(assessment);
                  }}>
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Assessment Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700">Platform:</span>
                        <span className="ml-2 font-medium">{selectedAssessment.recommended_platforms?.[0]?.platform_name}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Maturity:</span>
                        <span className="ml-2 font-medium">{selectedAssessment.ai_assessment_score?.maturity_level}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Departments:</span>
                        <span className="ml-2 font-medium">{selectedAssessment.departments?.length}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Compliance:</span>
                        <span className="ml-2 font-medium">{selectedAssessment.compliance_requirements?.length} requirements</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerateStrategy}
                  disabled={generating || !selectedAssessment}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Strategy & Risk Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Complete Strategy
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-600 text-center">
                  AI will automatically generate a strategic roadmap, identify risks, and create mitigation plans
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk-alerts">
            <RiskAlertsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}