import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';

export default function GovernanceWidget({ config = {} }) {
  const { data: usageLogs = [] } = useQuery({
    queryKey: ['aiUsageLogs'],
    queryFn: () => base44.entities.AIUsageLog.list('-created_date', 100)
  });

  const { data: policies = [] } = useQuery({
    queryKey: ['aiPolicies'],
    queryFn: () => base44.entities.AIPolicy.list()
  });

  const violations = usageLogs.filter(l => l.policy_compliance?.compliant === false).length;
  const totalInteractions = usageLogs.length;
  const complianceRate = totalInteractions > 0 ? ((totalInteractions - violations) / totalInteractions * 100).toFixed(1) : 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          AI Governance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold text-purple-700">{complianceRate}%</div>
            <p className="text-xs text-gray-600">Compliance Rate</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Active Policies</span>
              <span className="font-semibold">{policies.filter(p => p.status === 'active').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Violations</span>
              <span className="font-semibold text-red-600">{violations}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total Interactions</span>
              <span className="font-semibold">{totalInteractions}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}