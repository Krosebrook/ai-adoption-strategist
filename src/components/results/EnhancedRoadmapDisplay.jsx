import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Users, BookOpen, MessageSquare, Target, CheckCircle2, 
  AlertTriangle, DollarSign, Shield, TrendingUp, Zap, Clock 
} from 'lucide-react';
import InlineFeedback from '../feedback/InlineFeedback';

export default function EnhancedRoadmapDisplay({ roadmap, platformName, assessmentId }) {
  if (!roadmap) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeline */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Enhanced Implementation Roadmap</h2>
            <p className="text-indigo-100">Optimized deployment plan for {platformName}</p>
          </div>
          {roadmap.optimized_timeline && (
            <div className="text-right">
              <div className="text-3xl font-bold">{roadmap.optimized_timeline.total_duration_weeks}</div>
              <div className="text-sm text-indigo-200">weeks total</div>
              <Badge className="mt-2 bg-white text-indigo-600">
                {roadmap.optimized_timeline.confidence_level} confidence
              </Badge>
            </div>
          )}
        </div>
        
        {roadmap.optimized_timeline?.adjustment_factors && (
          <div className="mt-4 pt-4 border-t border-indigo-400">
            <div className="text-sm text-indigo-200 mb-2">Timeline Optimization Factors:</div>
            <div className="flex flex-wrap gap-2">
              {roadmap.optimized_timeline.adjustment_factors.map((factor, idx) => (
                <Badge key={idx} variant="outline" className="bg-indigo-500 text-white border-indigo-400">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      {roadmap.risk_assessment && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
              <Badge className={`ml-2 ${getSeverityColor(roadmap.risk_assessment.overall_risk_level)}`}>
                {roadmap.risk_assessment.overall_risk_level} risk
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.risk_assessment.key_risks?.map((risk, idx) => (
                <div key={idx} className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-red-900">{risk.risk}</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{risk.probability} probability</Badge>
                      <Badge variant="outline" className="text-xs">{risk.impact} impact</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-red-700">
                    <strong>Mitigation:</strong> {risk.mitigation_strategy}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market-Driven Priorities */}
      {roadmap.market_driven_priorities && roadmap.market_driven_priorities.length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <TrendingUp className="h-5 w-5" />
              Market-Driven Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.market_driven_priorities.map((priority, idx) => (
                <div key={idx} className="bg-white border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-semibold text-purple-900">{priority.priority}</h5>
                    <Badge variant="outline" className="text-purple-700">
                      {priority.target_phase}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-700">{priority.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pilot Program with Resources */}
      {roadmap.pilot_program && (
        <Card className="border-blue-200">
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
                  <div className="text-xs text-blue-600 mb-1">Program Size</div>
                  <div className="text-sm font-semibold text-blue-900">{roadmap.pilot_program.recommended_size}</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Duration</div>
                  <div className="text-sm font-semibold text-blue-900">{roadmap.pilot_program.duration_weeks} weeks</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Departments</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {roadmap.pilot_program.ideal_departments?.join(', ') || 'TBD'}
                  </div>
                </div>
              </div>

              {roadmap.pilot_program.resource_allocation && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Resource Allocation
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Team Size: </span>
                      <span className="font-medium text-slate-900">{roadmap.pilot_program.resource_allocation.team_size}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Budget: </span>
                      <span className="font-medium text-slate-900">{roadmap.pilot_program.resource_allocation.budget_estimate}</span>
                    </div>
                  </div>
                  {roadmap.pilot_program.resource_allocation.infrastructure_needs && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-600 mb-1">Infrastructure Needs:</div>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.pilot_program.resource_allocation.infrastructure_needs.map((need, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {roadmap.pilot_program.success_criteria && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">Success Criteria</h5>
                  <ul className="space-y-1">
                    {roadmap.pilot_program.success_criteria.map((criteria, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Phases with Bottlenecks & Resources */}
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
                      <div>
                        <h4 className="font-semibold text-purple-900">{phase.phase_name}</h4>
                        {phase.start_week !== undefined && (
                          <div className="text-xs text-purple-600 mt-1">
                            Week {phase.start_week} - {phase.start_week + phase.duration_weeks}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {phase.duration_weeks} weeks
                      </Badge>
                    </div>

                    {/* Resource Requirements */}
                    {phase.resource_requirements && (
                      <div className="mb-4 p-3 bg-white border border-purple-200 rounded">
                        <h5 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          RESOURCE REQUIREMENTS
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-purple-600">Team: </span>
                            <span className="font-medium">{phase.resource_requirements.team_size}</span>
                          </div>
                          <div>
                            <span className="text-purple-600">Budget: </span>
                            <span className="font-medium">{phase.resource_requirements.estimated_budget}</span>
                          </div>
                        </div>
                        {phase.resource_requirements.key_roles && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {phase.resource_requirements.key_roles.map((role, ridx) => (
                              <Badge key={ridx} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compliance Actions */}
                    {phase.compliance_actions && phase.compliance_actions.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          COMPLIANCE ACTIONS
                        </h5>
                        {phase.compliance_actions.map((action, aidx) => (
                          <div key={aidx} className="bg-white border border-purple-200 rounded p-2 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-purple-900">{action.requirement}</span>
                              <Badge variant="outline" className="text-xs">
                                +{action.time_buffer_weeks}w buffer
                              </Badge>
                            </div>
                            <p className="text-xs text-purple-700">{action.action}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Potential Bottlenecks */}
                    {phase.potential_bottlenecks && phase.potential_bottlenecks.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          POTENTIAL BOTTLENECKS
                        </h5>
                        {phase.potential_bottlenecks.map((bottleneck, bidx) => (
                          <div key={bidx} className={`p-2 border rounded mb-2 ${getSeverityColor(bottleneck.severity)}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{bottleneck.bottleneck}</span>
                              <Badge className={getSeverityColor(bottleneck.severity)}>
                                {bottleneck.severity}
                              </Badge>
                            </div>
                            <p className="text-xs"><strong>Mitigation:</strong> {bottleneck.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Objectives, Activities, Success Metrics */}
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Roadmap */}
      {roadmap.compliance_roadmap && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Shield className="h-5 w-5" />
              Compliance Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.compliance_roadmap.critical_milestones?.map((milestone, idx) => (
                <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-green-900">{milestone.requirement}</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Week {milestone.target_week}
                      </Badge>
                      <Badge className={getSeverityColor(milestone.risk_level)}>
                        {milestone.risk_level} risk
                      </Badge>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {milestone.actions_required?.map((action, aidx) => (
                      <li key={aidx} className="text-sm text-green-800 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {roadmap.compliance_roadmap.certification_timeline && (
                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
                  <p className="text-sm text-green-900">
                    <strong>Certification Timeline:</strong> {roadmap.compliance_roadmap.certification_timeline}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training, Change Management, Success Metrics remain similar to original */}
      {/* ... (keeping rest of the component structure) */}

      <InlineFeedback 
        assessmentId={assessmentId}
        contentType="implementation"
        contentId="enhanced-roadmap"
      />
    </div>
  );
}