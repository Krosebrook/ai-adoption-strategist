import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Activity, AlertTriangle, FileText, 
  Eye, TrendingUp, Loader2, RefreshCw, Download,
  CheckCircle, XCircle, Clock, BarChart3
} from 'lucide-react';
import UsageAnalytics from '../components/governance/UsageAnalytics';
import PolicyManager from '../components/governance/PolicyManager';
import BiasMonitor from '../components/governance/BiasMonitor';
import AuditLog from '../components/governance/AuditLog';
import AutomatedScanConfig from '../components/governance/AutomatedScanConfig';
import MitigationStrategies from '../components/governance/MitigationStrategies';
import FeedbackAnalytics from '../components/governance/FeedbackAnalytics';
import { toast } from 'sonner';

export default function AIGovernance() {
  const [scanning, setScanning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('all');

  const queryClient = useQueryClient();

  const { data: usageLogs = [] } = useQuery({
    queryKey: ['aiUsageLogs'],
    queryFn: () => base44.entities.AIUsageLog.list('-created_date', 1000)
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['aiPolicies'],
    queryFn: () => base44.entities.AIPolicy.filter({ status: 'active' })
  });

  const { data: biasScans = [] } = useQuery({
    queryKey: ['biasMonitoring'],
    queryFn: () => base44.entities.BiasMonitoring.list('-scan_date', 50)
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createBiasScanMutation = useMutation({
    mutationFn: (data) => base44.entities.BiasMonitoring.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biasMonitoring'] });
      toast.success('Bias scan completed');
    }
  });

  const handleRunBiasScan = async () => {
    setScanning(true);
    try {
      const logsToAnalyze = selectedAgent === 'all' 
        ? usageLogs 
        : usageLogs.filter(log => log.agent_name === selectedAgent);

      const prompt = `Analyze the following AI interaction logs for bias and fairness issues.

Sample Size: ${logsToAnalyze.length} interactions
Agent: ${selectedAgent}

Look for:
1. Gender bias
2. Racial/ethnic bias
3. Age bias
4. Language/cultural bias
5. Overall fairness concerns

Provide bias scores (0-100, where 0 is no bias, 100 is severe bias) and specific examples.`;

      const schema = {
        type: 'object',
        properties: {
          bias_metrics: {
            type: 'object',
            properties: {
              gender_bias_score: { type: 'number' },
              racial_bias_score: { type: 'number' },
              age_bias_score: { type: 'number' },
              language_bias_score: { type: 'number' },
              overall_fairness_score: { type: 'number' }
            }
          },
          detected_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue_type: { type: 'string' },
                severity: { type: 'string' },
                description: { type: 'string' },
                examples: { type: 'array', items: { type: 'string' } },
                recommendation: { type: 'string' }
              }
            }
          },
          recommendations: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['clear', 'needs_attention', 'critical'] }
        }
      };

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema
      });

      await createBiasScanMutation.mutateAsync({
        agent_name: selectedAgent,
        sample_size: logsToAnalyze.length,
        ...analysis
      });
    } catch (error) {
      toast.error('Failed to run bias scan');
    } finally {
      setScanning(false);
    }
  };

  // Calculate summary stats
  const totalInteractions = usageLogs.length;
  const totalCost = usageLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const avgLatency = usageLogs.length > 0 
    ? usageLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / usageLogs.length 
    : 0;
  const policyViolations = usageLogs.filter(log => 
    log.policy_compliance?.compliant === false
  ).length;
  const biasFlags = usageLogs.filter(log => 
    log.bias_flags && log.bias_flags.length > 0
  ).length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
              <Shield className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              AI Governance & Compliance
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Monitor AI usage, enforce policies, and ensure responsible AI practices
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Interactions</p>
                  <p className="text-2xl font-bold">{totalInteractions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Latency</p>
                  <p className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={policyViolations > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Policy Violations</p>
                  <p className="text-2xl font-bold text-red-600">{policyViolations}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={biasFlags > 0 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Bias Flags</p>
                  <p className="text-2xl font-bold text-orange-600">{biasFlags}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="usage" className="space-y-6">
          <TabsList>
            <TabsTrigger value="usage">
              <BarChart3 className="h-4 w-4 mr-2" />
              Usage Analytics
            </TabsTrigger>
            <TabsTrigger value="policies">
              <FileText className="h-4 w-4 mr-2" />
              Policies ({policies.length})
            </TabsTrigger>
            <TabsTrigger value="bias">
              <Eye className="h-4 w-4 mr-2" />
              Bias Monitoring
            </TabsTrigger>
            <TabsTrigger value="automation">
              <RefreshCw className="h-4 w-4 mr-2" />
              Automated Scans
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              User Feedback
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Shield className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <UsageAnalytics usageLogs={usageLogs} />
          </TabsContent>

          <TabsContent value="policies">
            <PolicyManager policies={policies} />
          </TabsContent>

          <TabsContent value="bias">
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="all">All Agents</option>
                    <option value="StrategyAdvisor">Strategy Advisor</option>
                    <option value="SecurityAdvisor">Security Advisor</option>
                    <option value="EngineeringManagerAdvisor">Engineering Manager</option>
                    <option value="UXAdvisor">UX Designer</option>
                    <option value="TrainingCoach">Training Coach</option>
                    <option value="ComplianceAnalyst">Compliance Analyst</option>
                    <option value="ReportGenerator">Report Generator</option>
                  </select>
                  <Button
                    onClick={handleRunBiasScan}
                    disabled={scanning || usageLogs.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {scanning ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Run Manual Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <BiasMonitor biasScans={biasScans} />
              <MitigationStrategies biasScans={biasScans} />
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <AutomatedScanConfig />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackAnalytics />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog usageLogs={usageLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}