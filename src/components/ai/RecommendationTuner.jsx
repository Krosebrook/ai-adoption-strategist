import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Save, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RecommendationTuner({ onPreferencesChange }) {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    roi_weight: 25,
    compliance_weight: 25,
    integration_weight: 25,
    pain_point_weight: 25,
    business_priorities: '',
    constraints: '',
    risk_tolerance: 50
  });

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const user = await base44.auth.me();
      const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
      if (settings[0]?.ai_preferences) {
        setPreferences(settings[0].ai_preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      const user = await base44.auth.me();
      const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
      
      if (settings[0]) {
        return await base44.entities.UserSettings.update(settings[0].id, {
          ai_preferences: prefs
        });
      } else {
        return await base44.entities.UserSettings.create({
          user_email: user.email,
          ai_preferences: prefs
        });
      }
    },
    onSuccess: () => {
      toast.success('AI preferences saved');
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      if (onPreferencesChange) onPreferencesChange(preferences);
    }
  });

  const updateWeight = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value[0] }));
  };

  const resetToDefaults = () => {
    const defaults = {
      roi_weight: 25,
      compliance_weight: 25,
      integration_weight: 25,
      pain_point_weight: 25,
      business_priorities: '',
      constraints: '',
      risk_tolerance: 50
    };
    setPreferences(defaults);
  };

  const totalWeight = preferences.roi_weight + preferences.compliance_weight + 
                      preferences.integration_weight + preferences.pain_point_weight;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Recommendation Tuning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-900">
            Customize how AI weighs different factors when recommending platforms. 
            Adjust the sliders to match your organization's priorities.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-700">ROI & Financial Impact</Label>
              <span className="text-sm font-semibold text-slate-900">{preferences.roi_weight}%</span>
            </div>
            <Slider
              value={[preferences.roi_weight]}
              onValueChange={(v) => updateWeight('roi_weight', v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-700">Compliance & Security</Label>
              <span className="text-sm font-semibold text-slate-900">{preferences.compliance_weight}%</span>
            </div>
            <Slider
              value={[preferences.compliance_weight]}
              onValueChange={(v) => updateWeight('compliance_weight', v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-700">Integration Capability</Label>
              <span className="text-sm font-semibold text-slate-900">{preferences.integration_weight}%</span>
            </div>
            <Slider
              value={[preferences.integration_weight]}
              onValueChange={(v) => updateWeight('integration_weight', v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-700">Pain Point Resolution</Label>
              <span className="text-sm font-semibold text-slate-900">{preferences.pain_point_weight}%</span>
            </div>
            <Slider
              value={[preferences.pain_point_weight]}
              onValueChange={(v) => updateWeight('pain_point_weight', v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {totalWeight !== 100 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
              ⚠️ Total weight is {totalWeight}%. Adjust weights to sum to 100% for optimal results.
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-700">Risk Tolerance</Label>
              <span className="text-sm font-semibold text-slate-900">
                {preferences.risk_tolerance < 33 ? 'Conservative' : 
                 preferences.risk_tolerance < 66 ? 'Moderate' : 'Aggressive'}
              </span>
            </div>
            <Slider
              value={[preferences.risk_tolerance]}
              onValueChange={(v) => updateWeight('risk_tolerance', v)}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-slate-700">Business Priorities (Optional)</Label>
            <Textarea
              value={preferences.business_priorities}
              onChange={(e) => setPreferences(prev => ({ ...prev, business_priorities: e.target.value }))}
              placeholder="e.g., Cost reduction is critical. Must support remote teams. Data privacy is top priority."
              className="mt-2 h-24"
            />
          </div>

          <div>
            <Label className="text-slate-700">Constraints (Optional)</Label>
            <Textarea
              value={preferences.constraints}
              onChange={(e) => setPreferences(prev => ({ ...prev, constraints: e.target.value }))}
              placeholder="e.g., Limited IT resources. Cannot use cloud-only solutions. Budget cap of $100k/year."
              className="mt-2 h-24"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => savePreferencesMutation.mutate(preferences)}
            disabled={savePreferencesMutation.isPending || totalWeight !== 100}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}