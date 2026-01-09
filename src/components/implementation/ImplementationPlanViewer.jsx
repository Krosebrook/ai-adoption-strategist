import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, AlertTriangle, Clock, Users, DollarSign, 
  Target, TrendingUp, Shield, Zap, Calendar, Award,
  FileText, Download, Share2
} from 'lucide-react';
import { generateTimelineData, calculateProjectHealthScore } from './ImplementationPlanEngine';

export default function ImplementationPlanViewer({ plan, assessment, platform }) {
  const [selectedPhase, setSelectedPhase] = useState(0);
  
  if (!plan) return null;

  const timelineData = generateTimelineData(plan);
  const healthScore = calculateProjectHealthScore(plan, assessment);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Implementation Plan: {platform?.platform_name}
              </h2>
              <p className="text-blue-100">
                {plan.overview?.executive_summary}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm text-blue-100">Duration</span>
              </div>
              <p className="text-xl font-bold">{plan.overview?.estimated_duration}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm text-blue-100">Investment</span>
              </div>
              <p className="text-xl font-bold">{plan.overview?.total_investment_required}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm text-blue-100">Complexity</span>
              </div>
              <p className="text-xl font-bold capitalize">{plan.overview?.complexity_level}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm text-blue-100">Health Score</span>
              </div>
              <p className="text-xl font-bold">{healthScore}/100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Implementation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timelineData.map((phase, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center gap-3">
                  <Badge className={idx === selectedPhase ? 'bg-blue-600' : 'bg-slate-400'}>
                    Phase {idx + 1}
                  </Badge>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{phase.phase}</span>
                      <span className="text-sm text-slate-600">
                        Week {phase.startWeek + 1}-{phase.endWeek}
                      </span>
                    </div>
                    <Progress 
                      value={((phase.duration / timelineData[timelineData.length - 1].endWeek) * 100)} 
                      className="h-2"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPhase(idx)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="phases">
            <FileText className="h-4 w-4 mr-2" />
            Phases
          </TabsTrigger>
          <TabsTrigger value="roadblocks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Roadblocks ({plan.potential_roadblocks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="quick-wins">
            <Award className="h-4 w-4 mr-2" />
            Quick Wins ({plan.quick_wins?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="success-factors">
            <Target className="h-4 w-4 mr-2" />
            Success Factors
          </TabsTrigger>
        </TabsList>

        {/* Phases Tab */}
        <TabsContent value="phases" className="space-y-4">
          {plan.phases?.map((phase, idx) => (
            <Card key={idx} className={idx === selectedPhase ? 'border-2 border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Badge className="bg-blue-600">Phase {idx + 1}</Badge>
                    {phase.phase_name}
                  </CardTitle>
                  <Badge variant="outline">{phase.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Objectives
                  </h4>
                  <ul className="space-y-1">
                    {phase.objectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Activities */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    Key Activities
                  </h4>
                  <div className="space-y-2">
                    {phase.key_activities?.map((activity, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-slate-900">{activity.activity}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.effort_estimate}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600">
                          Owner: {activity.owner}
                        </div>
                        {activity.dependencies?.length > 0 && (
                          <div className="text-xs text-slate-500 mt-1">
                            Dependencies: {activity.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Requirements */}
                {phase.resource_requirements && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      Resource Requirements
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-green-600 mb-1">Team Size</div>
                        <div className="font-medium text-green-900">
                          {phase.resource_requirements.team_size}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-blue-600 mb-1">Budget</div>
                        <div className="font-medium text-blue-900">
                          {phase.resource_requirements.budget_estimate}
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-purple-600 mb-1">Skills</div>
                        <div className="font-medium text-purple-900">
                          {phase.resource_requirements.skills_needed?.length || 0} skills
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Criteria */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Success Criteria
                  </h4>
                  <ul className="space-y-1">
                    {phase.success_criteria?.map((criteria, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Roadblocks Tab */}
        <TabsContent value="roadblocks" className="space-y-3">
          {plan.potential_roadblocks?.map((roadblock, idx) => (
            <Card key={idx} className={`border-2 ${getSeverityColor(roadblock.severity)}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{roadblock.roadblock}</h4>
                      <p className="text-sm text-slate-600 mt-1">{roadblock.impact}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(roadblock.severity)}>
                      {roadblock.severity}
                    </Badge>
                    <Badge variant="outline">
                      {roadblock.probability} probability
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-xs font-semibold text-blue-900 mb-1">Mitigation Strategy</h5>
                    <p className="text-sm text-blue-800">{roadblock.mitigation_strategy}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h5 className="text-xs font-semibold text-purple-900 mb-1">Contingency Plan</h5>
                    <p className="text-sm text-purple-800">{roadblock.contingency_plan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Quick Wins Tab */}
        <TabsContent value="quick-wins" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.quick_wins?.map((win, idx) => (
              <Card key={idx} className="border-2 border-green-200 bg-green-50/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{win.win}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getEffortColor(win.effort)}>
                            {win.effort} effort
                          </Badge>
                          <Badge className={getEffortColor(win.impact)}>
                            {win.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {win.timeline}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-xs font-semibold text-slate-700 mb-2">Implementation Steps:</h5>
                    <ul className="space-y-1">
                      {win.implementation_steps?.map((step, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-green-600 font-bold">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-3">
          {plan.recommended_team?.map((member, idx) => (
            <Card key={idx}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {member.role}
                    </h4>
                    <Badge variant="outline" className="mt-1">
                      {member.time_commitment}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 mb-2">Responsibilities:</h5>
                    <ul className="space-y-1">
                      {member.responsibilities?.map((resp, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-semibold text-slate-700 mb-2">Required Skills:</h5>
                    <div className="flex flex-wrap gap-2">
                      {member.skills_required?.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-blue-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Success Factors Tab */}
        <TabsContent value="success-factors" className="space-y-3">
          {plan.critical_success_factors?.map((factor, idx) => (
            <Card key={idx} className="border-l-4 border-l-green-500">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{factor.factor}</h4>
                    <p className="text-sm text-slate-600 mt-1">{factor.description}</p>
                    <div className="mt-2 p-2 bg-slate-50 rounded">
                      <span className="text-xs font-semibold text-slate-700">Measurement: </span>
                      <span className="text-xs text-slate-600">{factor.measurement}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}