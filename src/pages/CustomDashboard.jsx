import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, Plus, Settings, Save, Eye, Trash2,
  Grid3x3, Maximize2, Minimize2, RefreshCw, BarChart3, GitCompare, Download
} from 'lucide-react';
import { toast } from 'sonner';
import RiskSummaryWidget from '../components/dashboard/widgets/RiskSummaryWidget';
import GovernanceWidget from '../components/dashboard/widgets/GovernanceWidget';
import StrategyProgressWidget from '../components/dashboard/widgets/StrategyProgressWidget';
import AssessmentStatsWidget from '../components/dashboard/widgets/AssessmentStatsWidget';
import AIFeedbackWidget from '../components/dashboard/widgets/AIFeedbackWidget';
import DashboardBuilder from '../components/dashboard/DashboardBuilder';
import DrillDownReport from '../components/reports/DrillDownReport';
import ExportManager from '../components/reports/ExportManager';
import ComparisonView from '../components/comparison/ComparisonView';

const AVAILABLE_WIDGETS = [
  { id: 'risk_summary', name: 'Risk Overview', component: RiskSummaryWidget, category: 'risk' },
  { id: 'governance', name: 'AI Governance', component: GovernanceWidget, category: 'governance' },
  { id: 'strategy_progress', name: 'Strategy Progress', component: StrategyProgressWidget, category: 'strategy' },
  { id: 'assessment_stats', name: 'Assessment Stats', component: AssessmentStatsWidget, category: 'assessment' },
  { id: 'ai_feedback', name: 'AI Feedback', component: AIFeedbackWidget, category: 'governance' }
];

const ROLE_TEMPLATES = {
  executive: {
    name: 'Executive Dashboard',
    widgets: ['strategy_progress', 'risk_summary', 'assessment_stats']
  },
  admin: {
    name: 'Admin Dashboard',
    widgets: ['governance', 'risk_summary', 'strategy_progress', 'ai_feedback']
  },
  product_manager: {
    name: 'Product Manager Dashboard',
    widgets: ['strategy_progress', 'assessment_stats', 'ai_feedback']
  }
};

export default function CustomDashboard() {
  const [editMode, setEditMode] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [selectedWidgets, setSelectedWidgets] = useState([]);
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [selectedRole, setSelectedRole] = useState('custom');
  const [drillDownData, setDrillDownData] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['customDashboards', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.CustomDashboard.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 50),
    initialData: []
  });

  const { data: trainingProgress = [] } = useQuery({
    queryKey: ['trainingProgress', user?.email],
    queryFn: () => user ? base44.entities.TrainingProgress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: []
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['aiPolicies'],
    queryFn: () => base44.entities.AIPolicy.filter({ status: 'active' }),
    initialData: []
  });

  const createDashboardMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomDashboard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast.success('Dashboard saved');
      setEditMode(false);
    }
  });

  const updateDashboardMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CustomDashboard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast.success('Dashboard updated');
      setEditMode(false);
    }
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomDashboard.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast.success('Dashboard deleted');
      setSelectedDashboard(null);
    }
  });

  useEffect(() => {
    if (dashboards.length > 0 && !selectedDashboard) {
      const defaultDashboard = dashboards.find(d => d.is_default) || dashboards[0];
      setSelectedDashboard(defaultDashboard);
      setSelectedWidgets(defaultDashboard.widgets?.map(w => w.id) || []);
      setDashboardName(defaultDashboard.dashboard_name);
      setSelectedRole(defaultDashboard.user_role);
    }
  }, [dashboards, selectedDashboard]);

  const handleSaveDashboard = async () => {
    if (!user) return;

    const dashboardData = {
      user_email: user.email,
      dashboard_name: dashboardName,
      user_role: selectedRole,
      widgets: selectedWidgets.map(id => ({
        id,
        type: id,
        title: AVAILABLE_WIDGETS.find(w => w.id === id)?.name || id,
        enabled: true,
        settings: {}
      })),
      is_default: dashboards.length === 0 || (selectedDashboard?.is_default || false)
    };

    if (selectedDashboard?.id) {
      updateDashboardMutation.mutate({ id: selectedDashboard.id, data: dashboardData });
    } else {
      createDashboardMutation.mutate(dashboardData);
    }
  };

  const handleLoadTemplate = (role) => {
    const template = ROLE_TEMPLATES[role];
    if (template) {
      setSelectedWidgets(template.widgets);
      setDashboardName(template.name);
      setSelectedRole(role);
    }
  };

  const toggleWidget = (widgetId) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleDrillDown = (dataType) => {
    let data = null;
    switch(dataType) {
      case 'assessments':
        data = { assessments: assessments };
        break;
      case 'readiness':
        data = assessments[0]?.ai_readiness_score;
        break;
      case 'training':
        data = trainingProgress;
        break;
      case 'governance':
        data = { policies };
        break;
    }
    setDrillDownData({ type: dataType, data });
  };

  const handleExport = (data, title) => {
    setExportData({ data, title });
    setShowExport(true);
  };

  const widgetData = {
    assessmentStats: {
      total: assessments.length,
      completed: assessments.filter(a => a.status === 'completed').length
    },
    readiness: {
      score: assessments[0]?.ai_readiness_score?.overall_readiness_score || 0,
      level: assessments[0]?.ai_readiness_score?.readiness_level || 'Not Assessed'
    },
    roi: {
      savings: 150000,
      investment: 75000
    },
    governance: {
      compliance: 92,
      activePolicies: policies.length,
      violations: 2
    },
    training: {
      completed: trainingProgress.filter(p => p.status === 'completed').length,
      total: trainingProgress.length,
      avgScore: trainingProgress.length > 0 
        ? trainingProgress.reduce((sum, p) => sum + (p.best_score || 0), 0) / trainingProgress.length 
        : 0
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
              <LayoutDashboard className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              Custom Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Personalize your workspace with widgets tailored to your role
            </p>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                {dashboards.length > 0 && (
                  <select
                    value={selectedDashboard?.id || ''}
                    onChange={(e) => {
                      const dash = dashboards.find(d => d.id === e.target.value);
                      setSelectedDashboard(dash);
                      setSelectedWidgets(dash?.widgets?.map(w => w.id) || []);
                      setDashboardName(dash?.dashboard_name || '');
                      setSelectedRole(dash?.user_role || 'custom');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    {dashboards.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.dashboard_name} {d.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDashboard}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Dashboard
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="customize">
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="compare">
              <GitCompare className="h-4 w-4 mr-2" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedWidgets.map(widgetId => {
                const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                if (!widgetDef) return null;
                const WidgetComponent = widgetDef.component;
                return (
                  <div key={widgetId}>
                    <WidgetComponent config={{}} />
                  </div>
                );
              })}
              {selectedWidgets.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Grid3x3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Widgets Selected</h3>
                  <p className="text-slate-500 mb-4">Click "Customize" to add widgets to your dashboard</p>
                  <Button onClick={() => setEditMode(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widgets
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customize">
            {editMode ? (
              <div className="space-y-6">
            {/* Dashboard Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Dashboard Name</label>
                  <Input
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder="My Dashboard"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role Template</label>
                  <div className="flex gap-2">
                    {Object.entries(ROLE_TEMPLATES).map(([role, template]) => (
                      <Button
                        key={role}
                        variant={selectedRole === role ? 'default' : 'outline'}
                        onClick={() => handleLoadTemplate(role)}
                      >
                        {template.name}
                      </Button>
                    ))}
                    <Button
                      variant={selectedRole === 'custom' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('custom')}
                    >
                      Custom
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available Widgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_WIDGETS.map(widget => (
                    <div
                      key={widget.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedWidgets.includes(widget.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{widget.name}</span>
                        {selectedWidgets.includes(widget.id) && (
                          <Badge className="bg-blue-600">Active</Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{widget.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedDashboard && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700 text-sm">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this dashboard?')) {
                        deleteDashboardMutation.mutate(selectedDashboard.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
              </div>
            ) : (
              <DashboardBuilder 
                dashboardConfig={selectedDashboard}
                onSave={(config) => handleSaveDashboard()}
                widgetData={widgetData}
                onDrillDown={handleDrillDown}
              />
            )}
          </TabsContent>

          <TabsContent value="reports">
            {drillDownData ? (
              <DrillDownReport 
                initialData={drillDownData.data}
                dataType={drillDownData.type}
                onExport={(data) => handleExport(data.data, data.label)}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 mb-4">Click on any dashboard widget to explore detailed data</p>
                  <Button onClick={() => handleDrillDown('assessments')}>
                    View Sample Drill-Down
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="compare">
            <ComparisonView 
              items={assessments}
              itemType="assessments"
            />
          </TabsContent>
        </Tabs>

        <ExportManager 
          data={exportData?.data}
          title={exportData?.title}
          open={showExport}
          onOpenChange={setShowExport}
        />
      </div>
    </div>
  );
}