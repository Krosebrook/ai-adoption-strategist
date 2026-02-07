import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Lock, Activity } from 'lucide-react';
import RoleManagement from '../components/admin/RoleManagement';
import PermissionMatrix from '../components/admin/PermissionMatrix';
import AuditLogViewer from '../components/admin/AuditLogViewer';

export default function AdminPanel() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be an administrator to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <Shield className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            Admin Control Panel
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Manage users, permissions, and system configuration
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Lock className="h-4 w-4 mr-2" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Activity className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionMatrix />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}