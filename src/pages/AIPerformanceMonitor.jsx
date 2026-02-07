import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Zap, TrendingUp, AlertCircle } from 'lucide-react';

export default function AIPerformanceMonitor() {
  const { data: usageLogs = [] } = useQuery({
    queryKey: ['aiUsageLogs'],
    queryFn: () => base44.entities.AIUsageLog.list('-created_date', 500)
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['aiFeedback'],
    queryFn: () => base44.entities.AIFeedback.list('-created_date', 200)
  });

  const metrics = useMemo(() => {
    const totalCalls = usageLogs.length;
    const totalCost = usageLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const avgLatency = usageLogs.length > 0
      ? usageLogs.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / usageLogs.length
      : 0;
    const avgRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
      : 0;

    // Per-agent metrics
    const agentMetrics = {};
    usageLogs.forEach(log => {
      if (!agentMetrics[log.agent_name]) {
        agentMetrics[log.agent_name] = {
          calls: 0,
          cost: 0,
          tokens: 0,
          latency: []
        };
      }
      agentMetrics[log.agent_name].calls += 1;
      agentMetrics[log.agent_name].cost += log.cost || 0;
      agentMetrics[log.agent_name].tokens += log.tokens_used || 0;
      agentMetrics[log.agent_name].latency.push(log.latency_ms || 0);
    });

    const agentData = Object.entries(agentMetrics).map(([name, data]) => ({
      name,
      calls: data.calls,
      cost: data.cost.toFixed(2),
      avgLatency: (data.latency.reduce((a, b) => a + b, 0) / data.latency.length).toFixed(0),
      totalTokens: data.tokens
    }));

    // Cost over time (by day)
    const dailyCosts = {};
    usageLogs.forEach(log => {
      const date = new Date(log.created_date).toISOString().split('T')[0];
      dailyCosts[date] = (dailyCosts[date] || 0) + (log.cost || 0);
    });
    const costTrend = Object.entries(dailyCosts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, cost]) => ({ date, cost: parseFloat(cost.toFixed(2)) }));

    return {
      totalCalls,
      totalCost: totalCost.toFixed(2),
      avgLatency: avgLatency.toFixed(0),
      avgRating: avgRating.toFixed(1),
      agentData,
      costTrend
    };
  }, [usageLogs, feedback]);

  const COLORS = ['#E88A1D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <Activity className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            AI Performance Monitor
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Real-time monitoring of AI system performance and cost efficiency
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Total Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCalls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalCost}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgLatency}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-yellow-600" />
                User Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgRating} / 5</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Trend (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.costTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#E88A1D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.agentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Agent Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Agent Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Agent</th>
                    <th className="text-right p-2">Calls</th>
                    <th className="text-right p-2">Total Cost</th>
                    <th className="text-right p-2">Avg Latency</th>
                    <th className="text-right p-2">Total Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.agentData.map(agent => (
                    <tr key={agent.name} className="border-b">
                      <td className="p-2 font-medium">{agent.name}</td>
                      <td className="text-right p-2">{agent.calls}</td>
                      <td className="text-right p-2">${agent.cost}</td>
                      <td className="text-right p-2">{agent.avgLatency}ms</td>
                      <td className="text-right p-2">{agent.totalTokens.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}