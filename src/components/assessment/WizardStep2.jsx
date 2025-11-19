import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users } from 'lucide-react';
import { DEPARTMENTS } from './AssessmentData';

export default function WizardStep2({ formData, setFormData }) {
  const [newDept, setNewDept] = useState({
    name: '',
    user_count: '',
    annual_spend: '',
    hourly_rate: ''
  });

  const departments = formData.departments || [];

  const addDepartment = () => {
    if (newDept.name && newDept.user_count && newDept.hourly_rate) {
      setFormData({
        ...formData,
        departments: [...departments, {
          name: newDept.name,
          user_count: parseInt(newDept.user_count),
          annual_spend: parseFloat(newDept.annual_spend) || 0,
          hourly_rate: parseFloat(newDept.hourly_rate)
        }]
      });
      setNewDept({ name: '', user_count: '', annual_spend: '', hourly_rate: '' });
    }
  };

  const removeDepartment = (index) => {
    setFormData({
      ...formData,
      departments: departments.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold text-slate-900">Department Configuration</CardTitle>
        <p className="text-sm text-slate-500">Add the departments that will use AI platforms</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Department</Label>
            <Select value={newDept.name} onValueChange={(value) => setNewDept({ ...newDept, name: value })}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Number of Users</Label>
            <Input
              type="number"
              min="1"
              value={newDept.user_count}
              onChange={(e) => setNewDept({ ...newDept, user_count: e.target.value })}
              placeholder="50"
              className="bg-white border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Avg. Hourly Rate ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newDept.hourly_rate}
              onChange={(e) => setNewDept({ ...newDept, hourly_rate: e.target.value })}
              placeholder="65"
              className="bg-white border-slate-200"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={addDepartment}
              className="w-full bg-slate-700 hover:bg-slate-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {departments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Added Departments ({departments.length})
            </h4>
            <div className="space-y-2">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-900">{dept.name}</span>
                    </div>
                    <div className="text-slate-600">
                      {dept.user_count} users
                    </div>
                    <div className="text-slate-600">
                      ${dept.hourly_rate}/hr
                    </div>
                    <div className="text-slate-600">
                      ${(dept.annual_spend || 0).toLocaleString()}/yr
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDepartment(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {departments.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No departments added yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}