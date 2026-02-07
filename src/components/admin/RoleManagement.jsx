import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Shield, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_ROLES = ['admin', 'executive', 'product_manager', 'analyst', 'user'];

export default function RoleManagement() {
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: () => base44.entities.UserPermission.list()
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      toast.success('User role updated');
      setEditingUser(null);
    }
  });

  const handleSaveRole = (user) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { role: selectedRole }
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      executive: 'bg-purple-100 text-purple-800',
      product_manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.user;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Role Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">{user.full_name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <div className="flex items-center gap-3">
                {editingUser?.id === user.id ? (
                  <>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      {AVAILABLE_ROLES.map(role => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => handleSaveRole(user)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role || 'user'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUser(user);
                        setSelectedRole(user.role || 'user');
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}