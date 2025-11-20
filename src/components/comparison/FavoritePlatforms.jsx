import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../ui/EmptyState';

export default function FavoritePlatforms({ assessmentId }) {
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', user?.email, assessmentId],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.FavoritePlatform.filter({ 
        user_email: user.email,
        assessment_id: assessmentId 
      });
    },
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FavoritePlatform.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success('Removed from favorites');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.FavoritePlatform.update(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success('Notes updated');
      setEditingId(null);
    }
  });

  const startEdit = (favorite) => {
    setEditingId(favorite.id);
    setEditNotes(favorite.notes || '');
  };

  const saveEdit = (id) => {
    updateMutation.mutate({ id, notes: editNotes });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading favorites...</div>;
  }

  if (!favorites?.length) {
    return (
      <EmptyState
        icon={Star}
        title="No favorite platforms yet"
        description="Click the star icon on any platform in the comparison view to save it for later review"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            My Favorite Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Platforms you've bookmarked for further consideration
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map(favorite => (
          <Card key={favorite.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <CardTitle className="text-lg">{favorite.platform_name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(favorite.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingId === favorite.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add your notes about this platform..."
                    rows={4}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveEdit(favorite.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {favorite.notes ? (
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                      {favorite.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No notes yet</p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(favorite)}
                    className="w-full"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    {favorite.notes ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}