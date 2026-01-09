import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Target, Users, DollarSign } from 'lucide-react';

export default function EnhancedPlanInputs({ onSubmit, assessment, selectedPlatform }) {
  const [methodology, setMethodology] = useState('agile');
  const [teamRoles, setTeamRoles] = useState([
    { role: 'Project Manager', count: 1, required: true },
    { role: 'Technical Lead', count: 1, required: true },
    { role: 'AI/ML Engineer', count: 2, required: true }
  ]);
  const [phaseConstraints, setPhaseConstraints] = useState([
    { phase: 'Planning', budget: 50000, duration: '2 weeks' },
    { phase: 'Implementation', budget: 200000, duration: '12 weeks' },
    { phase: 'Testing', budget: 50000, duration: '4 weeks' }
  ]);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [includeAdvancedRisk, setIncludeAdvancedRisk] = useState(true);

  const methodologies = [
    { id: 'agile', name: 'Agile/Scrum', description: 'Iterative development with 2-week sprints' },
    { id: 'waterfall', name: 'Waterfall', description: 'Sequential phase-by-phase approach' },
    { id: 'hybrid', name: 'Hybrid', description: 'Combination of Agile and Waterfall' },
    { id: 'lean', name: 'Lean', description: 'Focus on minimizing waste and maximizing value' }
  ];

  const addTeamRole = () => {
    setTeamRoles([...teamRoles, { role: '', count: 1, required: false }]);
  };

  const updateTeamRole = (index, field, value) => {
    const updated = [...teamRoles];
    updated[index][field] = value;
    setTeamRoles(updated);
  };

  const removeTeamRole = (index) => {
    setTeamRoles(teamRoles.filter((_, i) => i !== index));
  };

  const addPhaseConstraint = () => {
    setPhaseConstraints([...phaseConstraints, { phase: '', budget: 0, duration: '' }]);
  };

  const updatePhaseConstraint = (index, field, value) => {
    const updated = [...phaseConstraints];
    updated[index][field] = value;
    setPhaseConstraints(updated);
  };

  const removePhaseConstraint = (index) => {
    setPhaseConstraints(phaseConstraints.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const config = {
      methodology,
      team_roles: teamRoles.filter(r => r.role),
      phase_constraints: phaseConstraints.filter(p => p.phase),
      additional_requirements: additionalRequirements,
      include_advanced_risk: includeAdvancedRisk
    };
    onSubmit(config);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-900">
            <strong>Configure your implementation plan:</strong> Specify methodology, team composition, 
            and budget constraints for a tailored AI adoption strategy.
          </p>
        </CardContent>
      </Card>

      {/* Methodology Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Project Management Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {methodologies.map(method => (
              <div
                key={method.id}
                onClick={() => setMethodology(method.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  methodology === method.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Checkbox checked={methodology === method.id} />
                  <span className="font-semibold text-slate-900">{method.name}</span>
                </div>
                <p className="text-xs text-slate-600 ml-6">{method.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Team Composition
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addTeamRole}>
              <Plus className="h-4 w-4 mr-1" />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamRoles.map((role, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Input
                  placeholder="Role name"
                  value={role.role}
                  onChange={(e) => updateTeamRole(idx, 'role', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Count"
                  value={role.count}
                  onChange={(e) => updateTeamRole(idx, 'count', parseInt(e.target.value) || 1)}
                  className="w-24"
                  min="1"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={role.required}
                    onCheckedChange={(checked) => updateTeamRole(idx, 'required', checked)}
                  />
                  <span className="text-xs text-slate-600">Required</span>
                </div>
                {!role.required && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTeamRole(idx)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Total team members: {teamRoles.reduce((sum, r) => sum + (r.count || 0), 0)}
          </div>
        </CardContent>
      </Card>

      {/* Phase Budget Constraints */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Phase Budget & Timeline Constraints
            </CardTitle>
            <Button size="sm" variant="outline" onClick={addPhaseConstraint}>
              <Plus className="h-4 w-4 mr-1" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phaseConstraints.map((constraint, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Input
                  placeholder="Phase name"
                  value={constraint.phase}
                  onChange={(e) => updatePhaseConstraint(idx, 'phase', e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">$</span>
                  <Input
                    type="number"
                    placeholder="Budget"
                    value={constraint.budget}
                    onChange={(e) => updatePhaseConstraint(idx, 'budget', parseInt(e.target.value) || 0)}
                    className="w-32"
                    min="0"
                  />
                </div>
                <Input
                  placeholder="Duration (e.g., 2 weeks)"
                  value={constraint.duration}
                  onChange={(e) => updatePhaseConstraint(idx, 'duration', e.target.value)}
                  className="w-36"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePhaseConstraint(idx)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-600">
            Total budget: ${phaseConstraints.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Additional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Requirements & Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Describe any specific requirements, constraints, or preferences for your implementation plan..."
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            rows={4}
          />
          
          <div className="flex items-center gap-2">
            <Checkbox
              checked={includeAdvancedRisk}
              onCheckedChange={setIncludeAdvancedRisk}
            />
            <label className="text-sm text-slate-700">
              Include advanced risk analysis with detailed scoring (RPN)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button 
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        size="lg"
      >
        Generate Enhanced Implementation Plan
      </Button>
    </div>
  );
}