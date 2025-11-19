import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Calendar } from 'lucide-react';

export default function WizardStep1({ formData, setFormData }) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold text-slate-900">Organization Details</CardTitle>
        <p className="text-sm text-slate-500">Let's start with some basic information about your organization</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="org_name" className="text-slate-700 font-medium">
            Organization Name *
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="org_name"
              value={formData.organization_name || ''}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              placeholder="Enter your organization name"
              className="pl-10 border-slate-200 focus:border-slate-400"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assessment_date" className="text-slate-700 font-medium">
            Assessment Date *
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="assessment_date"
              type="date"
              value={formData.assessment_date || new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
              className="pl-10 border-slate-200 focus:border-slate-400"
              required
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">What's Next?</h4>
          <p className="text-sm text-slate-600">
            After providing your organization details, you'll select departments to evaluate, 
            specify compliance requirements, choose desired integrations, and identify key pain points.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}