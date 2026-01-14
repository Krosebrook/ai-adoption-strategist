import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function UsageAnalytics({ usageLogs }) {
  // Group by agent
  const byAgent = usageLogs.reduce((acc, log) => {
    acc[log.agent_name] = (acc[log.agent_name] || 0) + 1;
    return acc;
  }, {});

  const agentData = Object.entries(byAgent).map(([name, count]) => ({
    name,
    interactions: count
  }));

  // Group by interaction type
  const byType = usageLogs.reduce((acc, log) => {
    acc[log.interaction_type] = (acc[log.interaction_type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(byType).map(([name, value]) => ({
    name,
    value
  }));

  // Daily usage trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyUsage = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    interactions: usageLogs.filter(log => 
      log.created_date?.startsWith(date)
    ).length
  }));

  const COLORS = ['#E88A1D', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interactions by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interactions" fill="#E88A1D" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="interactions" stroke="#E88A1D" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentData.map(agent => {
              const agentLogs = usageLogs.filter(l => l.agent_name === agent.name);
              const cost = agentLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
              const avgLatency = agentLogs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / agentLogs.length;
              
              return (
                <div key={agent.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-slate-600">{agent.interactions} interactions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${cost.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">{avgLatency.toFixed(0)}ms avg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}