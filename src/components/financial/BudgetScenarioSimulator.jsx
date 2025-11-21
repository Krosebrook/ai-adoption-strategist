import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';

export default function BudgetScenarioSimulator({ onSimulate, generating }) {
  const [scenario, setScenario] = useState({
    scenario_name: '',
    total_budget: '',
    budget_period: 'annual',
    scenario_type: 'optimized',
    allocations: {
      platform_licenses: 40,
      training: 20,
      infrastructure: 15,
      consulting: 10,
      change_management: 10,
      contingency: 5
    }
  });

  const handleAllocationChange = (category, value) => {
    const numValue = parseFloat(value) || 0;
    setScenario({
      ...scenario,
      allocations: {
        ...scenario.allocations,
        [category]: numValue
      }
    });
  };

  const totalAllocation = Object.values(scenario.allocations).reduce((sum, val) => sum + val, 0);
  const isValid = Math.abs(totalAllocation - 100) < 0.1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Budget Scenario Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Scenario Name</Label>
            <Input
              value={scenario.scenario_name}
              onChange={(e) => setScenario({ ...scenario, scenario_name: e.target.value })}
              placeholder="e.g., Conservative Budget"
            />
          </div>
          <div>
            <Label>Scenario Type</Label>
            <Select
              value={scenario.scenario_type}
              onValueChange={(val) => setScenario({ ...scenario, scenario_type: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimized">Optimized</SelectItem>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                <SelectItem value="constrained">Budget Constrained</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Total Budget ($)</Label>
            <Input
              type="number"
              value={scenario.total_budget}
              onChange={(e) => setScenario({ ...scenario, total_budget: e.target.value })}
              placeholder="500000"
            />
          </div>
          <div>
            <Label>Budget Period</Label>
            <Select
              value={scenario.budget_period}
              onValueChange={(val) => setScenario({ ...scenario, budget_period: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="3-year">3-Year</SelectItem>
                <SelectItem value="5-year">5-Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Budget Allocation (%)</Label>
            <Badge className={isValid ? 'bg-green-600' : 'bg-red-600'}>
              Total: {totalAllocation.toFixed(0)}%
            </Badge>
          </div>

          <div className="space-y-3">
            {Object.entries(scenario.allocations).map(([category, value]) => (
              <div key={category} className="flex items-center gap-3">
                <Label className="w-40 text-sm capitalize">{category.replace(/_/g, ' ')}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleAllocationChange(category, e.target.value)}
                  className="w-24"
                />
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!isValid && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-900">
                  Total allocation must equal 100%. Current: {totalAllocation.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={() => onSimulate(scenario)}
          disabled={generating || !isValid || !scenario.scenario_name || !scenario.total_budget}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Simulating Scenario...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}