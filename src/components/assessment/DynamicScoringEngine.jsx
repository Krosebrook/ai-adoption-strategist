import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from 'lucide-react';

export default function DynamicScoringEngine({ onWeightsChange, initialWeights }) {
  const [weights, setWeights] = useState(initialWeights || {
    roi_weight: 25,
    compliance_weight: 25,
    integration_weight: 25,
    features_weight: 25
  });

  const handleWeightChange = (key, value) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
    onWeightsChange(newWeights);
  };

  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0);
  const isBalanced = totalWeight === 100;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Scoring Priorities
        </CardTitle>
        <p className="text-sm text-slate-600">
          Adjust weights to prioritize what matters most to your organization
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>ROI & Cost Optimization</Label>
              <Badge variant={weights.roi_weight > 30 ? "default" : "outline"}>
                {weights.roi_weight}%
              </Badge>
            </div>
            <Slider
              value={[weights.roi_weight]}
              onValueChange={([value]) => handleWeightChange('roi_weight', value)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-slate-500">
              Prioritizes platforms with best cost-benefit ratio
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Compliance & Security</Label>
              <Badge variant={weights.compliance_weight > 30 ? "default" : "outline"}>
                {weights.compliance_weight}%
              </Badge>
            </div>
            <Slider
              value={[weights.compliance_weight]}
              onValueChange={([value]) => handleWeightChange('compliance_weight', value)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-slate-500">
              Emphasizes regulatory compliance and data security
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Integration Compatibility</Label>
              <Badge variant={weights.integration_weight > 30 ? "default" : "outline"}>
                {weights.integration_weight}%
              </Badge>
            </div>
            <Slider
              value={[weights.integration_weight]}
              onValueChange={([value]) => handleWeightChange('integration_weight', value)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-slate-500">
              Focuses on seamless integration with existing tools
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Features & Capabilities</Label>
              <Badge variant={weights.features_weight > 30 ? "default" : "outline"}>
                {weights.features_weight}%
              </Badge>
            </div>
            <Slider
              value={[weights.features_weight]}
              onValueChange={([value]) => handleWeightChange('features_weight', value)}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-slate-500">
              Values advanced features and technical capabilities
            </p>
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total Weight:</span>
            <Badge className={isBalanced ? 'bg-green-600' : 'bg-yellow-600'}>
              {totalWeight}%
            </Badge>
          </div>
          {!isBalanced && (
            <p className="text-xs text-yellow-700 mt-1">
              Adjust weights to total 100% for optimal scoring
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}