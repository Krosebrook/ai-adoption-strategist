import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DrillDownReport({ initialData, dataType, onExport }) {
  const [breadcrumb, setBreadcrumb] = useState([{ label: dataType, data: initialData }]);
  
  const currentLevel = breadcrumb[breadcrumb.length - 1];

  const drillDown = (label, data) => {
    setBreadcrumb([...breadcrumb, { label, data }]);
  };

  const drillUp = () => {
    if (breadcrumb.length > 1) {
      setBreadcrumb(breadcrumb.slice(0, -1));
    }
  };

  const reset = () => {
    setBreadcrumb([breadcrumb[0]]);
  };

  // Render content based on data type and level
  const renderContent = () => {
    switch (dataType) {
      case 'readiness':
        return renderReadinessDrillDown();
      case 'assessments':
        return renderAssessmentsDrillDown();
      case 'training':
        return renderTrainingDrillDown();
      case 'governance':
        return renderGovernanceDrillDown();
      default:
        return <div>No drill-down available for this data type</div>;
    }
  };

  const renderReadinessDrillDown = () => {
    if (breadcrumb.length === 1) {
      // Top level - category scores
      return (
        <div className="space-y-4">
          <h3 className="font-semibold">Readiness by Category</h3>
          {currentLevel.data?.category_scores && Object.entries(currentLevel.data.category_scores).map(([category, score]) => (
            <Card 
              key={category}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => drillDown(category, { category, score, details: currentLevel.data[`${category}_readiness`] })}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold capitalize">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{score}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <Progress value={score} />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else {
      // Drill-down level - show details
      const details = currentLevel.data.details;
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score: {currentLevel.data.score}/100</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Strengths</h4>
                <ul className="space-y-1">
                  {details?.strengths?.map((s, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-700">Gaps</h4>
                <ul className="space-y-1">
                  {details?.gaps?.map((g, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-red-600">✗</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Recommended Actions</h4>
                <ul className="space-y-1">
                  {details?.actions?.map((a, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-blue-600">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  const renderAssessmentsDrillDown = () => {
    if (breadcrumb.length === 1) {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold">All Assessments</h3>
          {currentLevel.data?.assessments?.map((assessment) => (
            <Card 
              key={assessment.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => drillDown(assessment.organization_name, assessment)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{assessment.organization_name}</h4>
                    <p className="text-sm text-slate-600">
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    } else {
      const assessment = currentLevel.data;
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{assessment.organization_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Assessment Date</span>
                  <p className="font-semibold">{new Date(assessment.assessment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge>{assessment.status}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Departments</h4>
                <div className="space-y-2">
                  {assessment.departments?.map((dept, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{dept.name}</span>
                      <span className="text-slate-600">{dept.user_count} users</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Top Recommendation</h4>
                <p className="text-sm">{assessment.recommended_platforms?.[0]?.platform_name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  const renderTrainingDrillDown = () => {
    return <div>Training drill-down view</div>;
  };

  const renderGovernanceDrillDown = () => {
    return <div>Governance drill-down view</div>;
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {breadcrumb.length > 1 && (
          <Button variant="outline" size="sm" onClick={drillUp}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
              <span 
                className={idx === breadcrumb.length - 1 ? 'font-semibold' : 'text-slate-600 cursor-pointer hover:text-slate-900'}
                onClick={() => idx < breadcrumb.length - 1 && setBreadcrumb(breadcrumb.slice(0, idx + 1))}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => onExport?.(currentLevel)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}