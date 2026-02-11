import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function ComparisonView({ items, itemType, onSelect }) {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else if (selectedItems.length < 3) {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const getComparison = () => {
    if (itemType === 'assessments') {
      return compareAssessments(items.filter(i => selectedItems.includes(i.id)));
    } else if (itemType === 'platforms') {
      return comparePlatforms(items.filter(i => selectedItems.includes(i.id)));
    } else if (itemType === 'skills') {
      return compareSkills(items.filter(i => selectedItems.includes(i.id)));
    }
    return null;
  };

  const compareAssessments = (assessments) => {
    if (assessments.length < 2) return null;

    const metrics = assessments.map(a => ({
      name: a.organization_name,
      readiness: a.ai_readiness_score?.overall_readiness_score || 0,
      departments: a.departments?.length || 0,
      users: a.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0,
      complianceReqs: a.compliance_requirements?.length || 0
    }));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Readiness Score Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="readiness" fill="#8b5cf6" name="Readiness Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          {assessments.map((assessment, idx) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle className="text-base">{assessment.organization_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-slate-600">Readiness Score</span>
                  <div className="text-2xl font-bold text-purple-600">
                    {assessment.ai_readiness_score?.overall_readiness_score || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-600">Departments</span>
                  <div className="font-semibold">{assessment.departments?.length || 0}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-600">Total Users</span>
                  <div className="font-semibold">
                    {assessment.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-600">Top Platform</span>
                  <Badge>{assessment.recommended_platforms?.[0]?.platform_name || 'N/A'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const comparePlatforms = (platforms) => {
    if (platforms.length < 2) return null;

    const radarData = [
      { metric: 'Features', ...platforms.reduce((acc, p, idx) => ({ ...acc, [`platform${idx}`]: p.features || 80 }), {}) },
      { metric: 'Cost', ...platforms.reduce((acc, p, idx) => ({ ...acc, [`platform${idx}`]: p.cost || 70 }), {}) },
      { metric: 'Compliance', ...platforms.reduce((acc, p, idx) => ({ ...acc, [`platform${idx}`]: p.compliance || 85 }), {}) },
      { metric: 'Integration', ...platforms.reduce((acc, p, idx) => ({ ...acc, [`platform${idx}`]: p.integration || 75 }), {}) },
      { metric: 'Support', ...platforms.reduce((acc, p, idx) => ({ ...acc, [`platform${idx}`]: p.support || 90 }), {}) }
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                {platforms.map((p, idx) => (
                  <Radar
                    key={p.id}
                    name={p.name}
                    dataKey={`platform${idx}`}
                    stroke={['#8b5cf6', '#ec4899', '#3b82f6'][idx]}
                    fill={['#8b5cf6', '#ec4899', '#3b82f6'][idx]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const compareSkills = (users) => {
    return <div>Skill comparison view</div>;
  };

  const comparison = getComparison();

  return (
    <div className="space-y-6">
      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Items to Compare (up to 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedItems.includes(item.id)
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h4 className="font-semibold text-sm">
                  {item.organization_name || item.name || item.title}
                </h4>
                {item.assessment_date && (
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(item.assessment_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison */}
      {comparison}

      {!comparison && selectedItems.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-slate-500">
            Select at least 2 items to compare
          </CardContent>
        </Card>
      )}
    </div>
  );
}