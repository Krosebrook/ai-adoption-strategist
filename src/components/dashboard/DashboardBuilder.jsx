import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, X, Settings, Save } from 'lucide-react';
import { WIDGET_CATALOG, renderWidget } from './WidgetLibrary';
import { toast } from 'sonner';

export default function DashboardBuilder({ dashboardConfig, onSave, widgetData, onDrillDown }) {
  const [widgets, setWidgets] = useState(dashboardConfig?.widgets || []);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `${widgetType.id}-${Date.now()}`,
      type: widgetType.id,
      name: widgetType.name,
      position: widgets.length,
      size: 'medium' // small, medium, large
    };
    setWidgets([...widgets, newWidget]);
    setShowWidgetPicker(false);
    toast.success('Widget added');
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    toast.success('Widget removed');
  };

  const moveWidget = (widgetId, direction) => {
    const index = widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= widgets.length) return;
    
    const newWidgets = [...widgets];
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
    setWidgets(newWidgets);
  };

  const handleSave = () => {
    onSave?.({ widgets });
    toast.success('Dashboard layout saved');
  };

  const groupedWidgets = WIDGET_CATALOG.reduce((acc, widget) => {
    if (!acc[widget.category]) acc[widget.category] = [];
    acc[widget.category].push(widget);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customize Dashboard</h3>
        <div className="flex gap-2">
          <Button onClick={() => setShowWidgetPicker(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {widgets.map((widget, index) => (
          <div key={widget.id} className="relative group">
            {/* Widget Controls */}
            <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                size="icon" 
                variant="destructive" 
                className="h-6 w-6"
                onClick={() => removeWidget(widget.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Widget Content */}
            {renderWidget(widget.type, widgetData, onDrillDown)}
          </div>
        ))}
      </div>

      {widgets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Plus className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-4">No widgets added yet</p>
            <Button onClick={() => setShowWidgetPicker(true)}>
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widget Picker Dialog */}
      <Dialog open={showWidgetPicker} onOpenChange={setShowWidgetPicker}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(groupedWidgets).map(([category, categoryWidgets]) => (
              <div key={category}>
                <h4 className="font-semibold mb-3 text-sm text-slate-700">{category}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {categoryWidgets.map((widget) => {
                    const Icon = widget.icon;
                    return (
                      <Card 
                        key={widget.id}
                        className="cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                        onClick={() => addWidget(widget)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm mb-1">{widget.name}</h5>
                              <p className="text-xs text-slate-600">{widget.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}