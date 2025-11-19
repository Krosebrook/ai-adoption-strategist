import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

const statusConfig = {
  certified: { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', label: 'Certified' },
  in_progress: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'In Progress' },
  not_certified: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Certified' },
  unknown: { icon: HelpCircle, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' }
};

export default function ComplianceMatrix({ complianceData, requirements }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Shield className="h-5 w-5" />
          Compliance Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Platform</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Score</th>
                {requirements.map(req => (
                  <th key={req} className="text-center py-3 px-2 text-xs font-semibold text-slate-700">
                    {req}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(complianceData).map(([platformId, data]) => {
                const platform = AI_PLATFORMS.find(p => p.id === platformId);
                return (
                  <tr key={platformId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform?.color }} />
                        <span className="text-sm font-medium text-slate-900">{platform?.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="secondary" className="bg-slate-700 text-white">
                        {data.compliance_score.toFixed(0)}%
                      </Badge>
                    </td>
                    {requirements.map(req => {
                      const status = data.status_details[req] || 'unknown';
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      return (
                        <td key={req} className="text-center py-3 px-2">
                          <div className="flex justify-center">
                            <Icon className={`h-4 w-4 ${config.color.includes('green') ? 'text-green-600' : config.color.includes('yellow') ? 'text-yellow-600' : config.color.includes('red') ? 'text-red-600' : 'text-gray-400'}`} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-600">{config.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}