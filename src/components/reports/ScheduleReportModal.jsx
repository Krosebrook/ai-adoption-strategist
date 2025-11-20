import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ScheduleReportModal({ isOpen, onClose, assessment, reportType }) {
  const [formData, setFormData] = useState({
    report_name: `${assessment?.organization_name || 'Report'} - ${reportType}`,
    frequency: 'once',
    scheduled_date: '',
    recipients: ''
  });

  const queryClient = useQueryClient();

  const createScheduleMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return await base44.entities.ScheduledReport.create({
        user_email: user.email,
        report_name: data.report_name,
        report_type: reportType,
        assessment_id: assessment.id,
        frequency: data.frequency,
        scheduled_date: new Date(data.scheduled_date).toISOString(),
        next_run: new Date(data.scheduled_date).toISOString(),
        recipients: data.recipients.split(',').map(e => e.trim()).filter(e => e),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduled-reports']);
      toast.success('Report scheduled successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to schedule report');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.scheduled_date) {
      toast.error('Please select a date and time');
      return;
    }
    createScheduleMutation.mutate(formData);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Report Generation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="report_name">Report Name</Label>
            <Input
              id="report_name"
              value={formData.report_name}
              onChange={(e) => setFormData({ ...formData, report_name: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger id="frequency" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scheduled_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formData.frequency === 'once' ? 'Generate On' : 'Start Date & Time'}
            </Label>
            <Input
              id="scheduled_date"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              min={getMinDateTime()}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recipients" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Recipients (comma-separated)
            </Label>
            <Input
              id="recipients"
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty to not send emails
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
            <Clock className="h-4 w-4 inline mr-2" />
            {formData.frequency === 'once' 
              ? 'Report will be generated once at the specified time'
              : `Report will be generated ${formData.frequency} starting from the specified date`
            }
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={createScheduleMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {createScheduleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Report'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}