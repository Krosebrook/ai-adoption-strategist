import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Target, DollarSign, Server, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function WizardStep5({ formData, setFormData }) {
  const [currentGoal, setCurrentGoal] = React.useState('');
  const [currentDataResidency, setCurrentDataResidency] = React.useState('');
  const [currentAPIRequirement, setCurrentAPIRequirement] = React.useState('');

  const addGoal = () => {
    if (currentGoal.trim()) {
      setFormData({
        ...formData,
        business_goals: [...(formData.business_goals || []), currentGoal.trim()]
      });
      setCurrentGoal('');
    }
  };

  const removeGoal = (index) => {
    setFormData({
      ...formData,
      business_goals: formData.business_goals.filter((_, i) => i !== index)
    });
  };

  const addDataResidency = () => {
    if (currentDataResidency.trim()) {
      const constraints = formData.technical_constraints || {};
      setFormData({
        ...formData,
        technical_constraints: {
          ...constraints,
          data_residency: [...(constraints.data_residency || []), currentDataResidency.trim()]
        }
      });
      setCurrentDataResidency('');
    }
  };

  const removeDataResidency = (index) => {
    const constraints = formData.technical_constraints || {};
    setFormData({
      ...formData,
      technical_constraints: {
        ...constraints,
        data_residency: constraints.data_residency?.filter((_, i) => i !== index) || []
      }
    });
  };

  const addAPIRequirement = () => {
    if (currentAPIRequirement.trim()) {
      const constraints = formData.technical_constraints || {};
      setFormData({
        ...formData,
        technical_constraints: {
          ...constraints,
          api_requirements: [...(constraints.api_requirements || []), currentAPIRequirement.trim()]
        }
      });
      setCurrentAPIRequirement('');
    }
  };

  const removeAPIRequirement = (index) => {
    const constraints = formData.technical_constraints || {};
    setFormData({
      ...formData,
      technical_constraints: {
        ...constraints,
        api_requirements: constraints.api_requirements?.filter((_, i) => i !== index) || []
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Business Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Business Goals & Objectives
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>What are your key business goals for AI adoption?</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="E.g., Reduce customer response time by 50%"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              />
              <Button onClick={addGoal} type="button">Add</Button>
            </div>
          </div>
          {formData.business_goals?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.business_goals.map((goal, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                  {goal}
                  <button onClick={() => removeGoal(idx)} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-600" />
            Technical Constraints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cloud/Infrastructure Preference</Label>
            <Select
              value={formData.technical_constraints?.cloud_preference || 'any'}
              onValueChange={(value) => setFormData({
                ...formData,
                technical_constraints: {
                  ...formData.technical_constraints,
                  cloud_preference: value
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Cloud Provider</SelectItem>
                <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                <SelectItem value="azure">Microsoft Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                <SelectItem value="on-premise">On-Premise Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data Residency Requirements</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="E.g., EU only, US East"
                value={currentDataResidency}
                onChange={(e) => setCurrentDataResidency(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDataResidency()}
              />
              <Button onClick={addDataResidency} type="button">Add</Button>
            </div>
            {formData.technical_constraints?.data_residency?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technical_constraints.data_residency.map((region, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {region}
                    <button onClick={() => removeDataResidency(idx)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Existing Infrastructure & Systems</Label>
            <Textarea
              placeholder="Describe your current technical stack and infrastructure..."
              value={formData.technical_constraints?.existing_infrastructure || ''}
              onChange={(e) => setFormData({
                ...formData,
                technical_constraints: {
                  ...formData.technical_constraints,
                  existing_infrastructure: e.target.value
                }
              })}
              rows={3}
            />
          </div>

          <div>
            <Label>API & Integration Requirements</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="E.g., REST API, GraphQL, Webhooks"
                value={currentAPIRequirement}
                onChange={(e) => setCurrentAPIRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAPIRequirement()}
              />
              <Button onClick={addAPIRequirement} type="button">Add</Button>
            </div>
            {formData.technical_constraints?.api_requirements?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technical_constraints.api_requirements.map((req, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {req}
                    <button onClick={() => removeAPIRequirement(idx)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Budget Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Budget</Label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.budget_constraints?.min_budget || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  budget_constraints: {
                    ...formData.budget_constraints,
                    min_budget: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
            <div>
              <Label>Maximum Budget</Label>
              <Input
                type="number"
                placeholder="100000"
                value={formData.budget_constraints?.max_budget || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  budget_constraints: {
                    ...formData.budget_constraints,
                    max_budget: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
          </div>

          <div>
            <Label>Budget Period</Label>
            <Select
              value={formData.budget_constraints?.budget_period || 'annual'}
              onValueChange={(value) => setFormData({
                ...formData,
                budget_constraints: {
                  ...formData.budget_constraints,
                  budget_period: value
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Budget Flexibility</Label>
            <Select
              value={formData.budget_constraints?.flexibility || 'moderate'}
              onValueChange={(value) => setFormData({
                ...formData,
                budget_constraints: {
                  ...formData.budget_constraints,
                  flexibility: value
                }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict - Cannot exceed maximum</SelectItem>
                <SelectItem value="moderate">Moderate - Some flexibility</SelectItem>
                <SelectItem value="flexible">Flexible - Can adjust if needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}