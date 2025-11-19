import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X, Users, DollarSign } from 'lucide-react';
import { DEPARTMENTS, COMPLIANCE_STANDARDS, INTEGRATION_CATEGORIES, PAIN_POINTS } from '../assessment/AssessmentData';

export default function ScenarioEditor({ baselineScenario, onSave, onCancel }) {
  const [scenario, setScenario] = useState({
    name: '',
    departments: baselineScenario?.departments || [],
    compliance_requirements: baselineScenario?.compliance_requirements || [],
    desired_integrations: baselineScenario?.desired_integrations || [],
    pain_points: baselineScenario?.pain_points || []
  });

  const [newDept, setNewDept] = useState({
    name: '',
    user_count: '',
    hourly_rate: ''
  });

  const addDepartment = () => {
    if (newDept.name && newDept.user_count && newDept.hourly_rate) {
      setScenario({
        ...scenario,
        departments: [...scenario.departments, {
          name: newDept.name,
          user_count: parseInt(newDept.user_count),
          hourly_rate: parseFloat(newDept.hourly_rate),
          annual_spend: 0
        }]
      });
      setNewDept({ name: '', user_count: '', hourly_rate: '' });
    }
  };

  const removeDepartment = (index) => {
    setScenario({
      ...scenario,
      departments: scenario.departments.filter((_, i) => i !== index)
    });
  };

  const updateDepartment = (index, field, value) => {
    const updated = [...scenario.departments];
    updated[index] = {
      ...updated[index],
      [field]: field === 'user_count' ? parseInt(value) : parseFloat(value)
    };
    setScenario({ ...scenario, departments: updated });
  };

  const toggleCompliance = (standard) => {
    const updated = scenario.compliance_requirements.includes(standard)
      ? scenario.compliance_requirements.filter(s => s !== standard)
      : [...scenario.compliance_requirements, standard];
    setScenario({ ...scenario, compliance_requirements: updated });
  };

  const toggleIntegration = (integration) => {
    const updated = scenario.desired_integrations.includes(integration)
      ? scenario.desired_integrations.filter(i => i !== integration)
      : [...scenario.desired_integrations, integration];
    setScenario({ ...scenario, desired_integrations: updated });
  };

  const togglePainPoint = (point) => {
    const updated = scenario.pain_points.includes(point)
      ? scenario.pain_points.filter(p => p !== point)
      : [...scenario.pain_points, point];
    setScenario({ ...scenario, pain_points: updated });
  };

  const handleSave = () => {
    if (!scenario.name) {
      alert('Please enter a scenario name');
      return;
    }
    if (scenario.departments.length === 0) {
      alert('Please add at least one department');
      return;
    }
    onSave(scenario);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Name */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Scenario Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Scenario Name *</Label>
            <Input
              value={scenario.name}
              onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
              placeholder="e.g., Phased Rollout Q2 2025, Full Enterprise Deployment"
              className="text-lg font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Departments */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Departments & Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Departments */}
          <div className="space-y-2">
            {scenario.departments.map((dept, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-xs text-slate-600">Department</Label>
                  <p className="font-medium text-slate-900">{dept.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Users</Label>
                  <Input
                    type="number"
                    min="1"
                    value={dept.user_count}
                    onChange={(e) => updateDepartment(index, 'user_count', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Hourly Rate ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={dept.hourly_rate}
                    onChange={(e) => updateDepartment(index, 'hourly_rate', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDepartment(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Department */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded-lg border-2 border-dashed border-slate-300">
            <Select value={newDept.name} onValueChange={(value) => setNewDept({ ...newDept, name: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Add department..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.filter(d => !scenario.departments.find(dept => dept.name === d)).map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={newDept.user_count}
              onChange={(e) => setNewDept({ ...newDept, user_count: e.target.value })}
              placeholder="Users"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newDept.hourly_rate}
              onChange={(e) => setNewDept({ ...newDept, hourly_rate: e.target.value })}
              placeholder="$/hr"
            />
            <Button onClick={addDepartment} variant="outline" className="border-slate-300">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Compliance Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {COMPLIANCE_STANDARDS.map(standard => (
              <div
                key={standard}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-all ${
                  scenario.compliance_requirements.includes(standard)
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => toggleCompliance(standard)}
              >
                <Checkbox
                  checked={scenario.compliance_requirements.includes(standard)}
                  onCheckedChange={() => toggleCompliance(standard)}
                />
                <label className="text-xs font-medium text-slate-700 cursor-pointer">
                  {standard}
                </label>
              </div>
            ))}
          </div>
          {scenario.compliance_requirements.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {scenario.compliance_requirements.map(req => (
                <Badge key={req} variant="secondary" className="bg-slate-700 text-white">
                  {req}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Required Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(INTEGRATION_CATEGORIES).map(([category, tools]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-600 uppercase mb-2">{category}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {tools.map(tool => (
                  <div
                    key={tool}
                    className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer text-xs ${
                      scenario.desired_integrations.includes(tool)
                        ? 'border-slate-700 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleIntegration(tool)}
                  >
                    <Checkbox
                      checked={scenario.desired_integrations.includes(tool)}
                      onCheckedChange={() => toggleIntegration(tool)}
                    />
                    <label className="font-medium text-slate-700 cursor-pointer">{tool}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pain Points */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Key Pain Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PAIN_POINTS.map((point, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${
                  scenario.pain_points.includes(point)
                    ? 'border-slate-700 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => togglePainPoint(point)}
              >
                <Checkbox
                  checked={scenario.pain_points.includes(point)}
                  onCheckedChange={() => togglePainPoint(point)}
                />
                <label className="text-sm text-slate-700 cursor-pointer">{point}</label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
        <Button variant="outline" onClick={onCancel} className="border-slate-300">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800">
          <Save className="h-4 w-4 mr-2" />
          Save & Analyze Scenario
        </Button>
      </div>
    </div>
  );
}