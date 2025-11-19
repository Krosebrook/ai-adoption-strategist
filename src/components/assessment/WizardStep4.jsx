import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import { PAIN_POINTS } from './AssessmentData';

export default function WizardStep4({ formData, setFormData }) {
  const painPoints = formData.pain_points || [];

  const togglePainPoint = (point) => {
    const updated = painPoints.includes(point)
      ? painPoints.filter(p => p !== point)
      : [...painPoints, point];
    setFormData({ ...formData, pain_points: updated });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-slate-700" />
          Key Pain Points
        </CardTitle>
        <p className="text-sm text-slate-500">Identify the biggest challenges your organization faces</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {PAIN_POINTS.map((point, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                painPoints.includes(point)
                  ? 'border-slate-700 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => togglePainPoint(point)}
            >
              <Checkbox
                checked={painPoints.includes(point)}
                onCheckedChange={() => togglePainPoint(point)}
                className="mt-1"
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 cursor-pointer block">
                  {point}
                </label>
              </div>
            </div>
          ))}
        </div>

        {painPoints.length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Selected Pain Points ({painPoints.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {painPoints.map((point, index) => (
                    <Badge key={index} variant="secondary" className="bg-white border border-slate-300">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {painPoints.length === 0 && (
          <div className="mt-6 text-center py-8 text-slate-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No pain points selected yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}