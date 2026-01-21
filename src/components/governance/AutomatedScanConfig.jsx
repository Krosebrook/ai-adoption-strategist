import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Play, Pause, Settings, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomatedScanConfig() {
  const [testRunning, setTestRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: automations = [] } = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      // Fetch list of automations - using a simple approach
      return [];
    }
  });

  const agents = [
    'StrategyAdvisor',
    'SecurityAdvisor', 
    'EngineeringManagerAdvisor',
    'UXAdvisor',
    'TrainingCoach',
    'ComplianceAnalyst',
    'ReportGenerator'
  ];

  const handleTestRun = async (agentName) => {
    setTestRunning(true);
    try {
      const response = await base44.functions.invoke('automatedBiasScan', {
        agent_name: agentName,
        lookback_days: 7
      });

      if (response.data.success) {
        toast.success(`Scan completed: ${response.data.issues_detected} issues detected`);
        queryClient.invalidateQueries({ queryKey: ['biasMonitoring'] });
        queryClient.invalidateQueries({ queryKey: ['aiUsageLogs'] });
      } else {
        toast.error(response.data.message || 'Scan failed');
      }
    } catch (error) {
      toast.error('Failed to run scan');
    } finally {
      setTestRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Bias Scanning Configuration</CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Configure automated, scheduled bias scans for your AI agents. Scans analyze recent usage logs,
            detect bias patterns, flag high-risk interactions, and generate mitigation strategies.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Test */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Play className="h-4 w-4" />
              Test Automated Scan
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              Run a test scan on any agent to see automated bias detection in action
            </p>
            <div className="flex gap-2">
              {agents.slice(0, 3).map(agent => (
                <Button
                  key={agent}
                  onClick={() => handleTestRun(agent)}
                  disabled={testRunning}
                  size="sm"
                  variant="outline"
                >
                  {testRunning ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  {agent}
                </Button>
              ))}
            </div>
          </div>

          {/* Scan Schedules */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Scheduled Scans
            </h4>
            
            {agents.map(agent => (
              <ScanScheduleRow key={agent} agent={agent} />
            ))}
          </div>

          {/* Global Settings */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Global Settings
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Auto-flag High-Risk Interactions</p>
                  <p className="text-xs text-slate-600">Automatically flag usage logs with detected bias</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Send Critical Alerts</p>
                  <p className="text-xs text-slate-600">Email admins when critical bias is detected</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Auto-generate Mitigation Strategies</p>
                  <p className="text-xs text-slate-600">AI generates actionable mitigation plans</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Suggest Policy Updates</p>
                  <p className="text-xs text-slate-600">Recommend policy changes based on findings</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScanScheduleRow({ agent }) {
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState('weekly');

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', days: 1 },
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'biweekly', label: 'Bi-weekly', days: 14 },
    { value: 'monthly', label: 'Monthly', days: 30 }
  ];

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <Switch 
          checked={enabled} 
          onCheckedChange={setEnabled}
        />
        <div>
          <p className="font-medium text-sm">{agent}</p>
          <p className="text-xs text-slate-600">
            {enabled ? `Scans ${frequency}` : 'Disabled'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select value={frequency} onValueChange={setFrequency} disabled={!enabled}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {frequencyOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {enabled && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </div>
    </div>
  );
}