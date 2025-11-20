import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, BookOpen, MessageSquare, Target, CheckCircle2 } from 'lucide-react';
import InlineFeedback from '../feedback/InlineFeedback';

export default function ImplementationRoadmap({ roadmap, platformName, assessmentId }) {
  if (!roadmap) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Implementation Roadmap</h2>
        <p className="text-slate-200">Comprehensive deployment plan for {platformName}</p>
      </div>

      {/* Pilot Program */}
      {roadmap.pilot_program && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Pilot Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Recommended Size</div>
                  <div className="text-sm font-semibold text-blue-900">{roadmap.pilot_program.recommended_size}</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-blue-900">{roadmap.pilot_program.duration_weeks} weeks</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Ideal Departments</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {roadmap.pilot_program.ideal_departments?.join(', ') || 'TBD'}
                  </div>
                </div>
              </div>
              
              {roadmap.pilot_program.key_activities && roadmap.pilot_program.key_activities.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Activities</h4>
                  <ul className="space-y-2">
                    {roadmap.pilot_program.key_activities.map((activity, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Phases */}
      {roadmap.phases && roadmap.phases.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Implementation Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {roadmap.phases.map((phase, idx) => (
                <div key={idx} className="relative pl-8 pb-6 border-l-2 border-purple-200 last:border-0">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-purple-900">{phase.phase_name}</h4>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {phase.duration_weeks} weeks
                      </Badge>
                    </div>
                    
                    {phase.objectives && phase.objectives.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-purple-700 mb-2">OBJECTIVES</h5>
                        <ul className="space-y-1">
                          {phase.objectives.map((obj, oidx) => (
                            <li key={oidx} className="text-sm text-purple-800 flex items-start gap-2">
                              <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {phase.activities && phase.activities.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-purple-700 mb-2">ACTIVITIES</h5>
                        <ul className="space-y-1">
                          {phase.activities.map((activity, aidx) => (
                            <li key={aidx} className="text-sm text-purple-800 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {phase.success_metrics && phase.success_metrics.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-purple-700 mb-2">SUCCESS METRICS</h5>
                        <div className="flex flex-wrap gap-2">
                          {phase.success_metrics.map((metric, midx) => (
                            <Badge key={midx} variant="outline" className="text-xs border-purple-300 text-purple-700">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Modules */}
      {roadmap.training_modules && roadmap.training_modules.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Training Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.training_modules.map((module, idx) => (
                <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-green-900">{module.module_name}</h4>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {module.duration_hours}h
                    </Badge>
                  </div>
                  <p className="text-xs text-green-600 mb-2">{module.target_audience}</p>
                  {module.topics && module.topics.length > 0 && (
                    <ul className="space-y-1">
                      {module.topics.map((topic, tidx) => (
                        <li key={tidx} className="text-sm text-green-800 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Management */}
      {roadmap.change_management && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-600" />
              Change Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roadmap.change_management.key_stakeholders && roadmap.change_management.key_stakeholders.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Key Stakeholders</h4>
                <div className="flex flex-wrap gap-2">
                  {roadmap.change_management.key_stakeholders.map((stakeholder, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-amber-100 text-amber-800">
                      {stakeholder}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {roadmap.change_management.communication_plan && roadmap.change_management.communication_plan.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Communication Plan</h4>
                <ul className="space-y-2">
                  {roadmap.change_management.communication_plan.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {roadmap.change_management.resistance_mitigation && roadmap.change_management.resistance_mitigation.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Resistance Mitigation</h4>
                <ul className="space-y-2">
                  {roadmap.change_management.resistance_mitigation.map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Metrics */}
      {roadmap.success_metrics && roadmap.success_metrics.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Success Metrics & KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.success_metrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-1">{metric.metric_name}</h4>
                  <p className="text-sm text-indigo-700 mb-2">Target: <strong>{metric.target_value}</strong></p>
                  <p className="text-xs text-indigo-600">{metric.measurement_method}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline Feedback */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="py-4">
          <InlineFeedback 
            assessmentId={assessmentId}
            contentType="implementation"
            contentId="roadmap"
          />
        </CardContent>
      </Card>
    </div>
  );
}