import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, TrendingUp, Shield, GraduationCap, 
  DollarSign, Activity, AlertTriangle, Award,
  Users, Target, CheckCircle, Clock
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Widget Registry - All available widgets
export const WIDGET_CATALOG = [
  {
    id: 'assessment-stats',
    name: 'Assessment Statistics',
    category: 'Assessment',
    icon: BarChart3,
    description: 'Total and completed assessments'
  },
  {
    id: 'readiness-score',
    name: 'AI Readiness Score',
    category: 'Assessment',
    icon: Target,
    description: 'Overall AI readiness metric'
  },
  {
    id: 'roi-overview',
    name: 'ROI Overview',
    category: 'Financial',
    icon: DollarSign,
    description: 'Financial metrics and projections'
  },
  {
    id: 'governance-summary',
    name: 'Governance Summary',
    category: 'Governance',
    icon: Shield,
    description: 'Compliance and policy status'
  },
  {
    id: 'bias-alerts',
    name: 'Bias Alerts',
    category: 'Governance',
    icon: AlertTriangle,
    description: 'AI bias monitoring alerts'
  },
  {
    id: 'training-progress',
    name: 'Training Progress',
    category: 'Training',
    icon: GraduationCap,
    description: 'Learning completion metrics'
  },
  {
    id: 'certificates',
    name: 'Certificates Earned',
    category: 'Training',
    icon: Award,
    description: 'Training certifications'
  },
  {
    id: 'performance-metrics',
    name: 'AI Performance',
    category: 'Governance',
    icon: Activity,
    description: 'Model performance tracking'
  },
  {
    id: 'risk-summary',
    name: 'Risk Summary',
    category: 'Risk',
    icon: AlertTriangle,
    description: 'Risk indicators and alerts'
  },
  {
    id: 'strategy-progress',
    name: 'Strategy Progress',
    category: 'Strategy',
    icon: TrendingUp,
    description: 'Adoption strategy milestones'
  },
  {
    id: 'team-size',
    name: 'Team Size',
    category: 'Organization',
    icon: Users,
    description: 'User and department metrics'
  },
  {
    id: 'completion-rate',
    name: 'Completion Rate',
    category: 'Training',
    icon: CheckCircle,
    description: 'Overall completion percentage'
  }
];

// Widget Components
export function AssessmentStatsWidget({ data, onDrillDown }) {
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onDrillDown?.('assessments')}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Assessment Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-2xl font-bold">{data?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Completed</span>
            <span className="text-lg font-semibold text-green-600">{data?.completed || 0}</span>
          </div>
          <Progress value={data?.total ? (data.completed / data.total) * 100 : 0} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReadinessScoreWidget({ data, onDrillDown }) {
  const score = data?.score || 0;
  const getColor = (s) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-blue-600' : s >= 40 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onDrillDown?.('readiness')}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          AI Readiness Score
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className={`text-4xl font-black ${getColor(score)}`}>
          {score}<span className="text-lg">/100</span>
        </div>
        <Badge className="mt-2">{data?.level || 'Not Assessed'}</Badge>
      </CardContent>
    </Card>
  );
}

export function ROIOverviewWidget({ data, onDrillDown }) {
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onDrillDown?.('roi')}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          ROI Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-slate-600">Projected Savings</span>
            <div className="text-2xl font-bold text-green-600">${(data?.savings || 0).toLocaleString()}</div>
          </div>
          <div>
            <span className="text-xs text-slate-600">Investment</span>
            <div className="text-lg">${(data?.investment || 0).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GovernanceSummaryWidget({ data, onDrillDown }) {
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onDrillDown?.('governance')}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Governance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs">Policy Compliance</span>
            <Badge className="bg-green-600">{data?.compliance || 0}%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Active Policies</span>
            <span className="font-semibold">{data?.activePolicies || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Violations</span>
            <Badge variant={data?.violations > 0 ? 'destructive' : 'outline'}>{data?.violations || 0}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrainingProgressWidget({ data, onDrillDown }) {
  return (
    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onDrillDown?.('training')}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Training Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-600">Modules Completed</span>
            <span className="font-semibold">{data?.completed || 0}/{data?.total || 0}</span>
          </div>
          <Progress value={data?.total ? (data.completed / data.total) * 100 : 0} />
          <div className="flex justify-between text-xs mt-2">
            <span className="text-slate-600">Avg Score</span>
            <span className="font-semibold">{data?.avgScore || 0}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Widget renderer - maps widget IDs to components
export function renderWidget(widgetId, data, onDrillDown) {
  const widgetMap = {
    'assessment-stats': <AssessmentStatsWidget data={data?.assessmentStats} onDrillDown={onDrillDown} />,
    'readiness-score': <ReadinessScoreWidget data={data?.readiness} onDrillDown={onDrillDown} />,
    'roi-overview': <ROIOverviewWidget data={data?.roi} onDrillDown={onDrillDown} />,
    'governance-summary': <GovernanceSummaryWidget data={data?.governance} onDrillDown={onDrillDown} />,
    'training-progress': <TrainingProgressWidget data={data?.training} onDrillDown={onDrillDown} />
  };
  
  return widgetMap[widgetId] || <div>Widget not found</div>;
}