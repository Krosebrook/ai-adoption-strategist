import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, AlertTriangle, TrendingUp, TrendingDown, Shield,
  Bell, CheckCircle, XCircle, Clock, Target, BarChart3,
  RefreshCw, Filter, Download
} from 'lucide-react';
import KRITracker from '../components/risk/KRITracker';
import MitigationProgressTracker from '../components/risk/MitigationProgressTracker';
import RiskAlertsPanel from '../components/risk/RiskAlertsPanel';
import ProjectHealthScorecard from '../components/risk/ProjectHealthScorecard';

export default function RiskMonitoring() {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: strategies, isLoading: loadingStrategies } = useQuery({
    queryKey: ['strategies'],
    queryFn: async () => {
      const strats = await base44.entities.AdoptionStrategy.filter({ status: 'active' });
      return strats;
    },
    refetchInterval: autoRefresh ? 30000 : false
  });

  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const assmts = await base44.entities.Assessment.filter({ status: 'completed' });
      return assmts;
    }
  });

  const { data: riskAlerts } = useQuery({
    queryKey: ['riskAlerts', selectedStrategy?.id],
    queryFn: async () => {
      if (!selectedStrategy) return [];
      return await base44.entities.RiskAlert.filter({
        source_type: 'strategy',
        source_id: selectedStrategy.id
      });
    },
    enabled: !!selectedStrategy,
    refetchInterval: autoRefresh ? 30000 : false
  });

  useEffect(() => {
    if (strategies?.length > 0 && !selectedStrategy) {
      setSelectedStrategy(strategies[0]);
    }
  }, [strategies, selectedStrategy]);

  const getRelatedAssessment = () => {
    if (!selectedStrategy || !assessments) return null;
    return assessments.find(a => a.id === selectedStrategy.assessment_id);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['strategies'] });
    queryClient.invalidateQueries({ queryKey: ['riskAlerts'] });
  };

  if (loadingStrategies) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  if (!strategies || strategies.length === 0) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Strategies</h2>
          <p className="text-slate-600">Create an adoption strategy to start monitoring risks.</p>
        </div>
      </div>
    );
  }

  const assessment = getRelatedAssessment();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
              <Activity className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              Risk Monitoring Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>Real-time tracking of key risk indicators and mitigation progress</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'border-green-300 text-green-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Strategy Selector */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-slate-600" />
              <select
                value={selectedStrategy?.id || ''}
                onChange={(e) => setSelectedStrategy(strategies.find(s => s.id === e.target.value))}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm"
              >
                {strategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.organization_name} - {strategy.platform}
                  </option>
                ))}
              </select>
              <Badge className={
                selectedStrategy?.status === 'active' ? 'bg-green-600' :
                selectedStrategy?.status === 'paused' ? 'bg-yellow-600' :
                'bg-slate-600'
              }>
                {selectedStrategy?.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {selectedStrategy && (
          <>
            {/* Project Health Scorecard */}
            <ProjectHealthScorecard 
              strategy={selectedStrategy}
              assessment={assessment}
              riskAlerts={riskAlerts || []}
            />

            {/* Main Content Tabs */}
            <Tabs defaultValue="kri" className="space-y-6">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="kri">
                  <Target className="h-4 w-4 mr-2" />
                  Key Risk Indicators
                </TabsTrigger>
                <TabsTrigger value="mitigation">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mitigation Progress
                </TabsTrigger>
                <TabsTrigger value="alerts">
                  <Bell className="h-4 w-4 mr-2" />
                  Active Alerts ({riskAlerts?.filter(a => a.status === 'new').length || 0})
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trends & Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="kri">
                <KRITracker 
                  strategy={selectedStrategy}
                  assessment={assessment}
                  riskAlerts={riskAlerts || []}
                />
              </TabsContent>

              <TabsContent value="mitigation">
                <MitigationProgressTracker 
                  strategy={selectedStrategy}
                  riskAlerts={riskAlerts || []}
                />
              </TabsContent>

              <TabsContent value="alerts">
                <RiskAlertsPanel 
                  riskAlerts={riskAlerts || []}
                  strategy={selectedStrategy}
                />
              </TabsContent>

              <TabsContent value="trends">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Trends & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      Historical trend analysis and predictive insights coming soon.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}