import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, AlertCircle, Plus, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskBoard({ resourceType, resourceId, phases = [] }) {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    phase: '',
    due_date: ''
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', resourceType, resourceId],
    queryFn: () => base44.entities.Task.filter({
      resource_type: resourceType,
      resource_id: resourceId
    }, '-created_date', 100)
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Task.create({
      ...taskData,
      resource_type: resourceType,
      resource_id: resourceId,
      assigned_by: user?.email
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowCreateTask(false);
      setNewTask({ title: '', description: '', assigned_to: '', priority: 'medium', phase: '', due_date: '' });
      toast.success('Task created');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const tasksByStatus = {
    todo: tasks?.filter(t => t.status === 'todo') || [],
    in_progress: tasks?.filter(t => t.status === 'in_progress') || [],
    blocked: tasks?.filter(t => t.status === 'blocked') || [],
    completed: tasks?.filter(t => t.status === 'completed') || []
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Task Board</CardTitle>
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status.replace(/_/g, ' ').toUpperCase()}
                  <Badge variant="outline">{statusTasks.length}</Badge>
                </h4>
                <div className="space-y-2">
                  {statusTasks.map(task => (
                    <Card key={task.id} className="border-l-4" style={{
                      borderLeftColor: 
                        task.priority === 'critical' ? '#dc2626' :
                        task.priority === 'high' ? '#f97316' :
                        task.priority === 'medium' ? '#eab308' : '#22c55e'
                    }}>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge className={getPriorityColor(task.priority)} style={{ fontSize: '10px' }}>
                              {task.priority}
                            </Badge>
                            {task.phase && (
                              <Badge variant="outline" style={{ fontSize: '10px' }}>{task.phase}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <User className="h-3 w-3" />
                            {task.assigned_to}
                          </div>
                          {task.due_date && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                          <Select
                            value={task.status}
                            onValueChange={(newStatus) => updateTaskMutation.mutate({ 
                              id: task.id, 
                              data: { 
                                status: newStatus,
                                ...(newStatus === 'completed' && { completion_date: new Date().toISOString() })
                              }
                            })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assign To (Email)</label>
                <Input
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  placeholder="user@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {phases.length > 0 && (
              <div>
                <label className="text-sm font-medium">Phase</label>
                <Select value={newTask.phase} onValueChange={(v) => setNewTask({ ...newTask, phase: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map(phase => (
                      <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>
            <Button
              onClick={() => createTaskMutation.mutate(newTask)}
              disabled={!newTask.title || !newTask.assigned_to || createTaskMutation.isPending}
              className="w-full"
            >
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}