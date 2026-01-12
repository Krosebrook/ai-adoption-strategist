import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2 } from 'lucide-react';
import { COMPLIANCE_STANDARDS, INTEGRATION_CATEGORIES } from './AssessmentData';

export default function WizardStep3({ formData, setFormData }) {
  const complianceReqs = formData.compliance_requirements || [];
  const integrations = formData.desired_integrations || [];

  const toggleCompliance = (standard) => {
    const updated = complianceReqs.includes(standard)
      ? complianceReqs.filter(s => s !== standard)
      : [...complianceReqs, standard];
    setFormData({ ...formData, compliance_requirements: updated });
  };

  const toggleIntegration = (integration) => {
    const updated = integrations.includes(integration)
      ? integrations.filter(i => i !== integration)
      : [...integrations, integration];
    setFormData({ ...formData, desired_integrations: updated });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-slate-700" />
            Compliance Requirements
          </CardTitle>
          <p className="text-sm text-slate-500">Select all compliance standards your organization must meet</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPLIANCE_STANDARDS.map(standard => (
              <div
                key={standard}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  complianceReqs.includes(standard)
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleCompliance(standard)}
              >
                <Checkbox
                  checked={complianceReqs.includes(standard)}
                  onCheckedChange={() => toggleCompliance(standard)}
                />
                <label className="text-sm font-medium text-slate-700 cursor-pointer flex-1">
                  {standard}
                </label>
                {complianceReqs.includes(standard) && (
                  <CheckCircle2 className="h-4 w-4 text-slate-700" />
                )}
              </div>
            ))}
          </div>
          {complianceReqs.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Selected:</span>
              {complianceReqs.map(req => (
                <Badge key={req} variant="secondary" className="bg-slate-700 text-white">
                  {req}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-semibold text-slate-900">Required Integrations</CardTitle>
          <p className="text-sm text-slate-500">Choose the systems that need to connect with your AI platform</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(INTEGRATION_CATEGORIES).map(([category, tools]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.isArray(tools) && tools.map(tool => (
                  <div
                    key={tool}
                    className={`flex items-center space-x-2 p-2 rounded-md border transition-all cursor-pointer ${
                      integrations.includes(tool)
                        ? 'border-slate-700 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleIntegration(tool)}
                  >
                    <Checkbox
                      checked={integrations.includes(tool)}
                      onCheckedChange={() => toggleIntegration(tool)}
                    />
                    <label className="text-xs font-medium text-slate-700 cursor-pointer">
                      {tool}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {integrations.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-medium text-slate-700">
                {integrations.length} integrations selected
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}