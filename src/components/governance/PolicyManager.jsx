import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Archive, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyManager({ policies }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const queryClient = useQueryClient();

  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.AIPolicy.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiPolicies'] });
      toast.success('Policy created');
      setDialogOpen(false);
    }
  });

  const updatePolicyMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIPolicy.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiPolicies'] });
      toast.success('Policy updated');
    }
  });

  const handleCreateDefaultPolicies = async () => {
    const defaultPolicies = [
      {
        policy_name: "Data Privacy Protection",
        policy_type: "privacy",
        description: "Ensure no PII or sensitive data is exposed in AI interactions",
        rules: [
          {
            rule_id: "privacy-001",
            rule_description: "No credit card numbers in prompts or responses",
            severity: "critical",
            enforcement: "block"
          },
          {
            rule_id: "privacy-002",
            rule_description: "No SSN or government IDs",
            severity: "critical",
            enforcement: "block"
          }
        ],
        applicable_agents: ["all"],
        status: "active",
        version: "1.0"
      },
      {
        policy_name: "Fairness & Bias Prevention",
        policy_type: "fairness",
        description: "Monitor and prevent biased AI outputs",
        rules: [
          {
            rule_id: "fairness-001",
            rule_description: "Flag gender-biased language",
            severity: "high",
            enforcement: "warn"
          },
          {
            rule_id: "fairness-002",
            rule_description: "Detect racial stereotypes",
            severity: "critical",
            enforcement: "warn"
          }
        ],
        applicable_agents: ["all"],
        status: "active",
        version: "1.0"
      }
    ];

    for (const policy of defaultPolicies) {
      await createPolicyMutation.mutateAsync(policy);
    }
  };

  const getPolicyIcon = (type) => {
    switch (type) {
      case 'privacy': return '🔒';
      case 'fairness': return '⚖️';
      case 'security': return '🛡️';
      case 'compliance': return '📋';
      case 'transparency': return '👁️';
      default: return '📄';
    }
  };

  const needsReview = (policy) => {
    if (!policy.last_reviewed || !policy.review_frequency_days) return false;
    const lastReview = new Date(policy.last_reviewed);
    const daysSince = (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= policy.review_frequency_days;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Policies</h3>
        <div className="flex gap-2">
          <Button onClick={handleCreateDefaultPolicies} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Default Policies
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create AI Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Define policies to govern AI usage, ensure compliance, and maintain responsible AI practices.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No policies configured</p>
            <Button onClick={handleCreateDefaultPolicies} className="bg-purple-600 hover:bg-purple-700">
              Create Default Policies
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <Card key={policy.id} className={needsReview(policy) ? 'border-amber-300' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{getPolicyIcon(policy.policy_type)}</span>
                      {policy.policy_name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                  </div>
                  <Badge className={
                    policy.status === 'active' ? 'bg-green-600' :
                    policy.status === 'draft' ? 'bg-blue-600' :
                    'bg-slate-400'
                  }>
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Rules</p>
                    <div className="space-y-1">
                      {policy.rules?.slice(0, 2).map((rule, idx) => (
                        <div key={idx} className="text-sm flex items-start gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rule.severity}
                          </Badge>
                          <span className="text-slate-700">{rule.rule_description}</span>
                        </div>
                      ))}
                      {policy.rules?.length > 2 && (
                        <p className="text-xs text-slate-500">+{policy.rules.length - 2} more rules</p>
                      )}
                    </div>
                  </div>
                  
                  {needsReview(policy) && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Needs review</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updatePolicyMutation.mutate({
                        id: policy.id,
                        data: { status: 'archived' }
                      })}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}