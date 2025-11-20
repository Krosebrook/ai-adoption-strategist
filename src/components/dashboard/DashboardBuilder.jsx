import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_WIDGETS = [
  { type: 'roi_overview', name: 'ROI Overview', icon: '💰', description: 'Financial performance metrics' },
  { type: 'platform_trends', name: 'Platform Trends', icon: '📈', description: 'Platform recommendation trends' },
  { type: 'compliance_matrix', name: 'Compliance Matrix', icon: '🛡️', description: 'Compliance scores overview' },
  { type: 'risk_indicators', name: 'Risk Indicators', icon: '⚠️', description: 'Risk assessment alerts' },
  { type: 'recent_assessments', name: 'Recent Assessments', icon: '📋', description: 'Latest assessment activity' },
  { type: 'cost_comparison', name: 'Cost Comparison', icon: '💵', description: 'Platform cost analysis' },
  { type: 'adoption_rate', name: 'Adoption Rate', icon: '📊', description: 'User adoption metrics' },
  { type: 'time_to_value', name: 'Time to Value', icon: '⏱️', description: 'Implementation timeline' }
];

export default function DashboardBuilder({ isOpen, onClose, currentDashboard }) {
  const [dashboardName, setDashboardName] = useState(currentDashboard?.dashboard_name || 'My Dashboard');
  const [selectedWidgets, setSelectedWidgets] = useState(currentDashboard?.layout?.map(w => w.widget_type) || []);
  const queryClient = useQueryClient();

  const saveDashboardMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Generate layout positions
      const layout = selectedWidgets.map((widgetType, index) => ({
        widget_type: widgetType,
        position: {
          x: (index % 2) * 6,
          y: Math.floor(index / 2) * 4,
          w: 6,
          h: 4
        },
        config: {}
      }));

      if (currentDashboard) {
        return await base44.entities.CustomDashboard.update(currentDashboard.id, {
          dashboard_name: dashboardName,
          layout
        });
      } else {
        return await base44.entities.CustomDashboard.create({
          user_email: user.email,
          dashboard_name: dashboardName,
          layout,
          is_default: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-dashboard']);
      toast.success('Dashboard saved successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save dashboard');
    }
  });

  const toggleWidget = (widgetType) => {
    if (selectedWidgets.includes(widgetType)) {
      setSelectedWidgets(selectedWidgets.filter(w => w !== widgetType));
    } else {
      setSelectedWidgets([...selectedWidgets, widgetType]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="My Custom Dashboard"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="mb-3 block">Select Widgets ({selectedWidgets.length})</Label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_WIDGETS.map((widget) => (
                <Card
                  key={widget.type}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedWidgets.includes(widget.type)
                      ? 'border-2 border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleWidget(widget.type)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{widget.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-900">{widget.name}</h4>
                      <p className="text-xs text-slate-600 mt-1">{widget.description}</p>
                    </div>
                    {selectedWidgets.includes(widget.type) && (
                      <div className="text-purple-600 font-bold">✓</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => saveDashboardMutation.mutate()}
              disabled={saveDashboardMutation.isPending || selectedWidgets.length === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saveDashboardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Dashboard
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}