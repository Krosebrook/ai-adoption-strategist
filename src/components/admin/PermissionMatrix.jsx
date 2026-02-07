import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

const ENTITIES = [
  'Assessment', 'AdoptionStrategy', 'RiskAlert', 'AIPolicy', 
  'TrainingModule', 'ImplementationPlan', 'Task', 'BiasMonitoring'
];

const ROLES = ['admin', 'executive', 'product_manager', 'analyst', 'user'];

export default function PermissionMatrix() {
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState({});

  const { data: existingPermissions = [] } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: () => base44.entities.UserPermission.list(),
    onSuccess: (data) => {
      const permMap = {};
      data.forEach(p => {
        const key = `${p.role}-${p.entity_name}`;
        permMap[key] = p;
      });
      setPermissions(permMap);
    }
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data) => base44.entities.UserPermission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      toast.success('Permissions updated');
    }
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserPermission.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      toast.success('Permissions updated');
    }
  });

  const handlePermissionChange = (role, entity, action, value) => {
    const key = `${role}-${entity}`;
    const existing = permissions[key];
    
    const updatedPerm = {
      ...existing,
      role,
      entity_name: entity,
      [action]: value
    };

    if (existing?.id) {
      updatePermissionMutation.mutate({ id: existing.id, data: updatedPerm });
    } else {
      createPermissionMutation.mutate(updatedPerm);
    }
  };

  const getPermission = (role, entity, action) => {
    const key = `${role}-${entity}`;
    return permissions[key]?.[action] || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Entity Permission Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Role / Entity</th>
                {ENTITIES.map(entity => (
                  <th key={entity} className="p-2 text-center text-xs">{entity}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map(role => (
                <tr key={role} className="border-b">
                  <td className="p-2 font-medium capitalize">{role.replace('_', ' ')}</td>
                  {ENTITIES.map(entity => (
                    <td key={entity} className="p-2">
                      <div className="flex justify-center gap-1">
                        <Checkbox
                          checked={getPermission(role, entity, 'can_create')}
                          onCheckedChange={(val) => handlePermissionChange(role, entity, 'can_create', val)}
                          title="Create"
                        />
                        <Checkbox
                          checked={getPermission(role, entity, 'can_update')}
                          onCheckedChange={(val) => handlePermissionChange(role, entity, 'can_update', val)}
                          title="Update"
                        />
                        <Checkbox
                          checked={getPermission(role, entity, 'can_delete')}
                          onCheckedChange={(val) => handlePermissionChange(role, entity, 'can_delete', val)}
                          title="Delete"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-xs text-gray-500">
            <span className="font-semibold">Legend:</span> First checkbox = Create, Second = Update, Third = Delete
          </div>
        </div>
      </CardContent>
    </Card>
  );
}