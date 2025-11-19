import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Circle } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

const supportConfig = {
  native: { color: 'bg-green-500', label: 'Native', score: 100 },
  api: { color: 'bg-blue-500', label: 'API', score: 80 },
  limited: { color: 'bg-yellow-500', label: 'Limited', score: 40 },
  not_supported: { color: 'bg-red-500', label: 'Not Supported', score: 0 }
};

export default function IntegrationMatrix({ integrationData, integrations }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Plug className="h-5 w-5" />
          Integration Compatibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {Object.entries(integrationData).map(([platformId, data]) => {
            const platform = AI_PLATFORMS.find(p => p.id === platformId);
            return (
              <div key={platformId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform?.color }} />
                    <h4 className="text-sm font-semibold text-slate-900">{platform?.name}</h4>
                  </div>
                  <Badge variant="secondary" className="bg-slate-700 text-white">
                    {data.integration_score.toFixed(0)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-green-700 font-semibold">{data.native}</div>
                    <div className="text-green-600">Native</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="text-blue-700 font-semibold">{data.api}</div>
                    <div className="text-blue-600">API</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="text-yellow-700 font-semibold">{data.limited}</div>
                    <div className="text-yellow-600">Limited</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-red-700 font-semibold">{data.not_supported}</div>
                    <div className="text-red-600">Not Supported</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-700 font-semibold">Integration</th>
                {AI_PLATFORMS.map(platform => (
                  <th key={platform.id} className="text-center py-2 px-2 text-slate-700 font-semibold">
                    {platform.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {integrations.slice(0, 10).map(integration => (
                <tr key={integration} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-700 font-medium">{integration}</td>
                  {AI_PLATFORMS.map(platform => {
                    const support = integrationData[platform.id]?.integration_details[integration] || 'not_supported';
                    const config = supportConfig[support];
                    return (
                      <td key={platform.id} className="text-center py-2 px-2">
                        <Circle className={`h-3 w-3 inline ${config.color}`} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {integrations.length > 10 && (
          <p className="text-xs text-slate-500 mt-3 text-center">
            Showing 10 of {integrations.length} integrations
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {Object.entries(supportConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <Circle className={`h-3 w-3 ${config.color}`} />
              <span className="text-xs text-slate-600">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}