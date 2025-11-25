import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Plus, Loader2, Play, Pause, Trash2, 
  Download, Clock, Calendar, Sparkles, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { generatePerformanceSummaryReport, generatePredictiveReport, generateComplianceGapReport } from './AutomatedReportEngine';

export default function AutomatedReportDashboard() {
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: 'performance_summary',
    frequency: 'weekly',
    content_settings: {
      include_executive_summary: true,
      include_metrics: true,
      include_charts: true,
      include_recommendations: true,
      include_risks: true,
      include_compliance: false,
      detail_level: 'detailed'
    }
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['automatedReports', user?.email],
    queryFn: () => base44.entities.AutomatedReport.filter({ user_email: user?.email }),
    enabled: !!user,
    initialData: []
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 10),
    initialData: []
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }),
    initialData: []
  });

  const createReportMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomatedReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automatedReports'] });
      setShowCreate(false);
      toast.success('Report schedule created!');
    }
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomatedReport.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automatedReports'] })
  });

  const deleteReportMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomatedReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automatedReports'] });
      toast.success('Report deleted');
    }
  });

  const handleCreateReport = async () => {
    await createReportMutation.mutateAsync({
      ...newReport,
      user_email: user?.email,
      status: 'active',
      next_scheduled: new Date().toISOString()
    });
  };

  const handleGenerateNow = async (report) => {
    setGenerating(true);
    try {
      let reportData;
      const strategy = strategies.find(s => s.id === report.strategy_id);
      const assessment = assessments.find(a => a.id === report.assessment_id);

      if (report.report_type === 'performance_summary') {
        reportData = await generatePerformanceSummaryReport(strategies, assessments, {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        });
      } else if (report.report_type === 'predictive_analysis') {
        reportData = await generatePredictiveReport(strategy || strategies[0], assessment || assessments[0]);
      } else if (report.report_type === 'compliance_gap') {
        reportData = await generateComplianceGapReport(assessment || assessments[0], strategy);
      }

      await updateReportMutation.mutateAsync({
        id: report.id,
        data: {
          last_generated: new Date().toISOString(),
          generated_reports: [...(report.generated_reports || []), { generated_at: new Date().toISOString(), report_data: reportData }]
        }
      });

      toast.success('Report generated!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getFrequencyLabel = (freq) => ({
    daily: 'Daily', weekly: 'Weekly', 'bi-weekly': 'Bi-Weekly', monthly: 'Monthly', quarterly: 'Quarterly'
  }[freq]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Automated Reports</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>AI-generated reports on your schedule</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} style={{ background: '#E88A1D' }}>
          <Plus className="h-4 w-4 mr-2" />
          New Report Schedule
        </Button>
      </div>

      {showCreate && (
        <Card className="border-2" style={{ borderColor: '#E88A1D' }}>
          <CardHeader>
            <CardTitle>Create Report Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <Input
                  value={newReport.report_name}
                  onChange={(e) => setNewReport({ ...newReport, report_name: e.target.value })}
                  placeholder="Weekly Performance Summary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={newReport.report_type} onValueChange={(v) => setNewReport({ ...newReport, report_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance_summary">Performance Summary</SelectItem>
                    <SelectItem value="predictive_analysis">Predictive ROI & Risk</SelectItem>
                    <SelectItem value="compliance_gap">Compliance Gap Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <Select value={newReport.frequency} onValueChange={(v) => setNewReport({ ...newReport, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Detail Level</label>
                <Select 
                  value={newReport.content_settings.detail_level} 
                  onValueChange={(v) => setNewReport({ 
                    ...newReport, 
                    content_settings: { ...newReport.content_settings, detail_level: v } 
                  })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Include Sections</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'include_executive_summary', label: 'Executive Summary' },
                  { key: 'include_metrics', label: 'Key Metrics' },
                  { key: 'include_charts', label: 'Charts' },
                  { key: 'include_recommendations', label: 'Recommendations' },
                  { key: 'include_risks', label: 'Risk Analysis' },
                  { key: 'include_compliance', label: 'Compliance' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      checked={newReport.content_settings[key]}
                      onCheckedChange={(checked) => setNewReport({
                        ...newReport,
                        content_settings: { ...newReport.content_settings, [key]: checked }
                      })}
                    />
                    <label className="text-sm">{label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreateReport} style={{ background: '#E88A1D' }}>Create Schedule</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="sunrise-card">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}>
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{report.report_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{report.report_type.replace('_', ' ')}</Badge>
                      <Badge style={{ background: report.status === 'active' ? '#E88A1D' : '#6B5B7A', color: 'white' }}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getFrequencyLabel(report.frequency)}
                      </span>
                      {report.last_generated && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last: {new Date(report.last_generated).toLocaleDateString()}
                        </span>
                      )}
                      <span>{report.generated_reports?.length || 0} reports generated</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateNow(report)}
                    disabled={generating}
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateReportMutation.mutate({
                      id: report.id,
                      data: { status: report.status === 'active' ? 'paused' : 'active' }
                    })}
                  >
                    {report.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteReportMutation.mutate(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card className="sunrise-card">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-gray-400)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>No automated reports configured</p>
              <Button onClick={() => setShowCreate(true)} className="mt-4" style={{ background: '#E88A1D' }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}