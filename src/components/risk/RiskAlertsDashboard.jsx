import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, Shield, Loader2, RefreshCw, CheckCircle,
  FileText, Target, Clock, ChevronRight, X, Sparkles,
  Bell, TrendingDown, Eye
} from 'lucide-react';
import { runProactiveRiskScan } from './ProactiveRiskEngine';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function RiskAlertsDashboard() {
  const [scanning, setScanning] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showComplianceDoc, setShowComplianceDoc] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => base44.entities.RiskAlert.list('-created_date', 100)
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.filter({ status: 'active' }, '-created_date', 50)
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50)
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.RiskAlert.create(data),
    onSuccess: () => queryClient.invalidateQueries(['riskAlerts'])
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RiskAlert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['riskAlerts'])
  });

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const newAlerts = await runProactiveRiskScan(strategies, assessments);
      
      for (const alert of newAlerts) {
        await createAlertMutation.mutateAsync(alert);
      }
      
      toast.success(`Found ${newAlerts.length} new risk alert(s)`);
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Risk scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (alert) => {
    await updateAlertMutation.mutateAsync({
      id: alert.id,
      data: { status: 'acknowledged' }
    });
    toast.success('Alert acknowledged');
  };

  const handleResolve = async (alert) => {
    await updateAlertMutation.mutateAsync({
      id: alert.id,
      data: { status: 'resolved', resolved_at: new Date().toISOString() }
    });
    toast.success('Alert resolved');
  };

  const handleDismiss = async (alert) => {
    await updateAlertMutation.mutateAsync({
      id: alert.id,
      data: { status: 'dismissed' }
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const newAlerts = alerts.filter(a => a.status === 'new');
  const activeAlerts = alerts.filter(a => ['acknowledged', 'in_progress'].includes(a.status));
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'new').length;
  const highCount = alerts.filter(a => a.severity === 'high' && a.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Proactive Risk Monitoring</h2>
                <p className="text-red-100">AI-powered risk detection and mitigation</p>
              </div>
            </div>
            <Button 
              onClick={handleRunScan}
              disabled={scanning}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              {scanning ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Run Risk Scan</>
              )}
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-red-100 text-sm">Critical</p>
              <p className="text-2xl font-bold">{criticalCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-red-100 text-sm">High</p>
              <p className="text-2xl font-bold">{highCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-red-100 text-sm">Active</p>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-red-100 text-sm">Resolved</p>
              <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            New Alerts
            {newAlerts.length > 0 && (
              <Badge className="ml-2 bg-red-600">{newAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            <Eye className="h-4 w-4 mr-2" />
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {newAlerts.length === 0 ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-green-900">No new alerts</p>
                <p className="text-sm text-green-700">All systems are operating normally</p>
              </CardContent>
            </Card>
          ) : (
            newAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                alert={alert}
                onSelect={() => setSelectedAlert(alert)}
                onAcknowledge={() => handleAcknowledge(alert)}
                onDismiss={() => handleDismiss(alert)}
                getSeverityColor={getSeverityColor}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.map(alert => (
            <AlertCard 
              key={alert.id}
              alert={alert}
              onSelect={() => setSelectedAlert(alert)}
              onResolve={() => handleResolve(alert)}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
            />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.slice(0, 10).map(alert => (
            <AlertCard 
              key={alert.id}
              alert={alert}
              onSelect={() => setSelectedAlert(alert)}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              readonly
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Risk Alert Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Alert Info */}
                <div className="flex items-center gap-3">
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                  <Badge variant="outline">{selectedAlert.risk_category}</Badge>
                  <Badge className={getStatusColor(selectedAlert.status)}>
                    {selectedAlert.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Source</h4>
                  <p className="text-slate-600">
                    {selectedAlert.source_name} ({selectedAlert.source_type})
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Risk Description</h4>
                  <p className="text-slate-600">{selectedAlert.risk_description}</p>
                </div>

                {selectedAlert.potential_impact && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-1">Potential Impact</h4>
                    <p className="text-red-800">{selectedAlert.potential_impact}</p>
                  </div>
                )}

                {/* Mitigation Steps */}
                {selectedAlert.mitigation_steps?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Mitigation Steps
                    </h4>
                    <div className="space-y-2">
                      {selectedAlert.mitigation_steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{step.step}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {step.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.timeline}
                              </Badge>
                              {step.owner && (
                                <Badge variant="outline" className="text-xs">
                                  Owner: {step.owner}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strategy Adjustments */}
                {selectedAlert.strategy_adjustments?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Strategy Adjustments
                    </h4>
                    <div className="space-y-2">
                      {selectedAlert.strategy_adjustments.map((adj, idx) => (
                        <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-purple-900">{adj.adjustment}</p>
                            <Badge className={
                              adj.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              adj.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {adj.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-purple-700">{adj.rationale}</p>
                          <p className="text-xs text-purple-600 mt-1">
                            <strong>Impact:</strong> {adj.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Draft */}
                {selectedAlert.compliance_draft && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Compliance Documentation Draft
                    </h4>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Badge className="bg-green-600">{selectedAlert.compliance_draft.document_type}</Badge>
                            <p className="font-medium text-green-900 mt-1">{selectedAlert.compliance_draft.title}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowComplianceDoc(true)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Full Draft
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compliance Doc Dialog */}
      <Dialog open={showComplianceDoc} onOpenChange={setShowComplianceDoc}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compliance Documentation Draft</DialogTitle>
          </DialogHeader>
          {selectedAlert?.compliance_draft && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{selectedAlert.compliance_draft.content}</ReactMarkdown>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertCard({ alert, onSelect, onAcknowledge, onResolve, onDismiss, getSeverityColor, getStatusColor, readonly }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
              alert.severity === 'critical' ? 'text-red-600' :
              alert.severity === 'high' ? 'text-orange-500' :
              'text-yellow-500'
            }`} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                <Badge variant="outline">{alert.risk_category}</Badge>
                <Badge className={getStatusColor(alert.status)}>
                  {alert.status}
                </Badge>
              </div>
              <p className="font-medium text-slate-900">{alert.risk_description}</p>
              <p className="text-sm text-slate-500 mt-1">
                Source: {alert.source_name} • Trigger: {alert.trigger_reason}
              </p>
              <div className="flex gap-2 mt-2">
                {alert.mitigation_steps?.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {alert.mitigation_steps.length} steps
                  </Badge>
                )}
                {alert.compliance_draft && (
                  <Badge variant="outline" className="text-xs bg-green-50">
                    <Shield className="h-3 w-3 mr-1" />
                    Compliance doc
                  </Badge>
                )}
                {alert.strategy_adjustments?.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-purple-50">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {alert.strategy_adjustments.length} adjustments
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {!readonly && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {onAcknowledge && alert.status === 'new' && (
                <Button variant="outline" size="sm" onClick={onAcknowledge}>
                  <Eye className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              )}
              {onResolve && (
                <Button variant="outline" size="sm" className="text-green-600" onClick={onResolve}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              )}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}