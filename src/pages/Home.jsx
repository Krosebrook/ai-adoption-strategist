import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, TrendingDown, Activity, Target, Shield, 
  AlertTriangle, CheckCircle, Clock, Users, BarChart3,
  PieChart, Zap, Settings, RefreshCw
} from 'lucide-react';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import AdoptionTrendsChart from '../components/dashboard/AdoptionTrendsChart';
import RiskIndicatorsPanel from '../components/dashboard/RiskIndicatorsPanel';
import StrategyProgressWidget from '../components/dashboard/StrategyProgressWidget';
import AssessmentFunnel from '../components/dashboard/AssessmentFunnel';
import RoleBasedWidgets from '../components/dashboard/RoleBasedWidgets';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: assessments = [], isLoading: loadingAssessments } = useQuery({
    queryKey: ['allAssessments', refreshKey],
    queryFn: () => base44.entities.Assessment.list('-created_date', 100),
    refetchInterval: 30000 // Real-time: refresh every 30 seconds
  });

  const { data: strategies = [], isLoading: loadingStrategies } = useQuery({
    queryKey: ['allStrategies', refreshKey],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 100),
    refetchInterval: 30000
  });

  const userRole = user?.role || 'user';

  // Calculate metrics
  const metrics = React.useMemo(() => {
    const completedAssessments = assessments.filter(a => a.status === 'completed');
    const activeStrategies = strategies.filter(s => s.status === 'active');
    const completedStrategies = strategies.filter(s => s.status === 'completed');
    
    // Calculate average progress
    const avgProgress = activeStrategies.length > 0
      ? activeStrategies.reduce((sum, s) => sum + (s.progress_tracking?.overall_progress || 0), 0) / activeStrategies.length
      : 0;

    // Calculate risk score average
    const avgRiskScore = strategies.length > 0
      ? strategies.reduce((sum, s) => sum + (s.risk_analysis?.risk_score || 50), 0) / strategies.length
      : 0;

    // Count high severity risks
    const highRisks = strategies.reduce((count, s) => {
      const risks = s.risk_analysis?.identified_risks || [];
      return count + risks.filter(r => r.severity === 'critical' || r.severity === 'high').length;
    }, 0);

    // Trend calculation (compare last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const recentAssessments = assessments.filter(a => new Date(a.created_date) > sevenDaysAgo).length;
    const previousAssessments = assessments.filter(a => {
      const date = new Date(a.created_date);
      return date > fourteenDaysAgo && date <= sevenDaysAgo;
    }).length;

    const assessmentTrend = previousAssessments > 0 
      ? ((recentAssessments - previousAssessments) / previousAssessments * 100).toFixed(0)
      : recentAssessments > 0 ? 100 : 0;

    return {
      totalAssessments: assessments.length,
      completedAssessments: completedAssessments.length,
      draftAssessments: assessments.filter(a => a.status === 'draft').length,
      totalStrategies: strategies.length,
      activeStrategies: activeStrategies.length,
      completedStrategies: completedStrategies.length,
      avgProgress: Math.round(avgProgress),
      avgRiskScore: Math.round(avgRiskScore),
      highRisks,
      assessmentTrend: Number(assessmentTrend),
      recentAssessments
    };
  }, [assessments, strategies]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isLoading = loadingAssessments || loadingStrategies;

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(
            180deg,
            #7A8B99 0%,
            #9A9A8E 15%,
            #C9B896 30%,
            #E8C078 45%,
            #F5A623 60%,
            #E88A1D 75%,
            #C4A35A 90%,
            #D4B896 100%
          )`
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Executive Dashboard
            </h1>
            <p className="text-white/80 mt-1">
              Real-time AI adoption metrics • {user?.full_name || 'Welcome'}
              <Badge className="ml-2 bg-white/20 text-white">{userRole}</Badge>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32 bg-white/90 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              className="bg-white/90 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <MetricsOverview metrics={metrics} isLoading={isLoading} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <AdoptionTrendsChart 
              assessments={assessments} 
              strategies={strategies} 
              timeRange={selectedTimeRange}
            />
            <AssessmentFunnel assessments={assessments} />
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            <RiskIndicatorsPanel strategies={strategies} />
            <StrategyProgressWidget strategies={strategies} />
          </div>
        </div>

        {/* Role-Based Widgets */}
        <RoleBasedWidgets 
          userRole={userRole} 
          assessments={assessments} 
          strategies={strategies}
        />
      </div>
    </div>
  );
}