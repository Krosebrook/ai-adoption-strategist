import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, Plus, Settings, Save, Eye, Trash2,
  Grid3x3, Maximize2, Minimize2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import RiskSummaryWidget from '../components/dashboard/widgets/RiskSummaryWidget';
import GovernanceWidget from '../components/dashboard/widgets/GovernanceWidget';
import StrategyProgressWidget from '../components/dashboard/widgets/StrategyProgressWidget';
import AssessmentStatsWidget from '../components/dashboard/widgets/AssessmentStatsWidget';
import AIFeedbackWidget from '../components/dashboard/widgets/AIFeedbackWidget';

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
        )}
      </div>
    </div>
  );
}