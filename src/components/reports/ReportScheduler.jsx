import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportScheduler({ assessmentId, strategyId, onClose }) {
  const queryClient = useQueryClient();
  const [schedule, setSchedule] = useState({
    report_name: '',
    report_type: 'comprehensive',
    frequency: 'weekly',
    recipients: '',
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

  const createScheduleMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomatedReport.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automatedReports'] });
      toast.success('Report schedule created');
      onClose?.();
    }
  });

  const handleSubmit = () => {
    const recipientsList = schedule.recipients.split(',').map(r => r.trim()).filter(r => r);
    
    createScheduleMutation.mutate({
      ...schedule,
      recipients: recipientsList,
      assessment_id: assessmentId,
      strategy_id: strategyId,
      status: 'active'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Schedule Automated Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Report Name</label>
          <Input
            value={schedule.report_name}
            onChange={(e) => setSchedule({ ...schedule, report_name: e.target.value })}
            placeholder="e.g., Weekly Strategy Update"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Report Type</label>
          <Select
            value={schedule.report_type}
            onValueChange={(value) => setSchedule({ ...schedule, report_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="performance_summary">Performance Summary</SelectItem>
              <SelectItem value="predictive_analysis">Predictive Analysis</SelectItem>
              <SelectItem value="compliance_gap">Compliance Gap Analysis</SelectItem>
              <SelectItem value="combined">Combined Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Frequency</label>
          <Select
            value={schedule.frequency}
            onValueChange={(value) => setSchedule({ ...schedule, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Recipients (comma-separated emails)</label>
          <Input
            value={schedule.recipients}
            onChange={(e) => setSchedule({ ...schedule, recipients: e.target.value })}
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium block">Content Settings</label>
          
          {[
            { key: 'include_executive_summary', label: 'Executive Summary' },
            { key: 'include_metrics', label: 'Key Metrics' },
            { key: 'include_charts', label: 'Charts & Visualizations' },
            { key: 'include_recommendations', label: 'AI Recommendations' },
            { key: 'include_risks', label: 'Risk Analysis' },
            { key: 'include_compliance', label: 'Compliance Status' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={schedule.content_settings[key]}
                onCheckedChange={(checked) =>
                  setSchedule({
                    ...schedule,
                    content_settings: { ...schedule.content_settings, [key]: checked }
                  })
                }
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Detail Level</label>
          <Select
            value={schedule.content_settings.detail_level}
            onValueChange={(value) =>
              setSchedule({
                ...schedule,
                content_settings: { ...schedule.content_settings, detail_level: value }
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!schedule.report_name || !schedule.recipients || createScheduleMutation.isPending}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </CardContent>
    </Card>
  );
}