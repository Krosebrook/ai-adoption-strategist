import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuditLog({ usageLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');

  const filteredLogs = usageLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.response?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = filterAgent === 'all' || log.agent_name === filterAgent;
    return matchesSearch && matchesAgent;
  });

  const agents = [...new Set(usageLogs.map(l => l.agent_name))];

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Agent', 'Type', 'Cost', 'Latency', 'Policy Compliant', 'Bias Flags'],
      ...filteredLogs.map(log => [
        log.created_date,
        log.user_email,
        log.agent_name,
        log.interaction_type,
        log.cost || 0,
        log.latency_ms || 0,
        log.policy_compliance?.compliant ? 'Yes' : 'No',
        log.bias_flags?.length || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-audit-log-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="all">All Agents</option>
              {agents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({filteredLogs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.agent_name}</Badge>
                    <Badge variant="outline">{log.interaction_type}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.policy_compliance?.compliant === false && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    {log.bias_flags && log.bias_flags.length > 0 && (
                      <Badge className="bg-orange-600">
                        {log.bias_flags.length} bias flags
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium text-slate-600">User:</span>{' '}
                    <span className="text-slate-700">{log.user_email}</span>
                  </div>
                  {log.cost && (
                    <div>
                      <span className="font-medium text-slate-600">Cost:</span>{' '}
                      <span className="text-slate-700">${log.cost.toFixed(4)}</span>
                      {' • '}
                      <span className="font-medium text-slate-600">Latency:</span>{' '}
                      <span className="text-slate-700">{log.latency_ms}ms</span>
                    </div>
                  )}
                  {log.policy_compliance?.violations && log.policy_compliance.violations.length > 0 && (
                    <div className="bg-red-50 rounded p-2 mt-2">
                      <p className="text-xs text-red-900 font-medium">Policy Violations:</p>
                      <ul className="text-xs text-red-800 list-disc list-inside">
                        {log.policy_compliance.violations.map((v, i) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}