import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogViewer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs = [] } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-created_date', 200)
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      read: 'bg-gray-100 text-gray-800',
      login: 'bg-purple-100 text-purple-800',
      export: 'bg-orange-100 text-orange-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user or entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3 border rounded-lg text-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionColor(log.action_type)}>
                      {log.action_type}
                    </Badge>
                    <span className="font-medium">{log.entity_type}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.created_date), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold">{log.user_email}</span>
                  {log.entity_id && <span> • ID: {log.entity_id.substring(0, 8)}...</span>}
                </div>
                {!log.success && log.error_message && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    Error: {log.error_message}
                  </div>
                )}
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No audit logs found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}