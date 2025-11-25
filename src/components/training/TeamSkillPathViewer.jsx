import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, BookOpen, Target, Clock, Award, 
  ChevronRight, Loader2, Sparkles, GraduationCap,
  Briefcase, Lightbulb
} from 'lucide-react';
import { generateTeamSkillPaths, generateRoleCurriculum } from './TeamSkillPathGenerator';
import { toast } from 'sonner';

export default function TeamSkillPathViewer({ assessment, platform }) {
  const [skillPaths, setSkillPaths] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [generatingCurriculum, setGeneratingCurriculum] = useState(false);

  const handleGenerate = async () => {
    if (!assessment?.departments) return;

    setGenerating(true);
    try {
      const paths = await generateTeamSkillPaths(
        assessment,
        assessment.departments,
        platform || 'AI Platform'
      );
      setSkillPaths(paths);
      toast.success('Team skill paths generated!');
    } catch (error) {
      toast.error('Failed to generate skill paths');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCurriculum = async (team, role) => {
    setGeneratingCurriculum(true);
    try {
      const result = await generateRoleCurriculum(
        role || team.team_name,
        team.skill_gaps || [],
        platform
      );
      setCurriculum(result);
      toast.success('Curriculum generated!');
    } catch (error) {
      toast.error('Failed to generate curriculum');
    } finally {
      setGeneratingCurriculum(false);
    }
  };

  if (!skillPaths) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Team Skill Development Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <GraduationCap className="h-16 w-16 text-purple-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">
            Generate personalized learning paths for each team based on skill gaps
          </p>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Teams...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Skill Paths
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-slate-600 mb-1">Organization Readiness</div>
              <div className="text-2xl font-bold text-purple-900">
                {skillPaths.organization_readiness_score}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-slate-600 mb-1">Teams Analyzed</div>
              <div className="text-2xl font-bold text-blue-900">
                {skillPaths.team_paths?.length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="text-sm text-slate-600 mb-1">Total Training Hours</div>
              <div className="text-2xl font-bold text-green-900">
                {skillPaths.resource_requirements?.total_training_hours}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <div className="text-sm text-slate-600 mb-1">Champions Needed</div>
              <div className="text-2xl font-bold text-amber-900">
                {skillPaths.resource_requirements?.internal_champions_needed}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Paths */}
      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Team Paths</TabsTrigger>
          <TabsTrigger value="cross-team">Cross-Team Initiatives</TabsTrigger>
          <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
          {curriculum && <TabsTrigger value="curriculum">Role Curriculum</TabsTrigger>}
        </TabsList>

        <TabsContent value="teams">
          <div className="space-y-4">
            {skillPaths.team_paths?.map((team, idx) => (
              <Card key={idx} className={selectedTeam === idx ? 'ring-2 ring-purple-500' : ''}>
                <CardHeader className="cursor-pointer" onClick={() => setSelectedTeam(selectedTeam === idx ? null : idx)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.team_name}</CardTitle>
                        <p className="text-sm text-slate-600">{team.team_size} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        team.current_skill_level === 'advanced' ? 'bg-green-600' :
                        team.current_skill_level === 'intermediate' ? 'bg-blue-600' :
                        'bg-amber-600'
                      }>
                        {team.current_skill_level}
                      </Badge>
                      <ChevronRight className={`h-5 w-5 transition-transform ${selectedTeam === idx ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Path to: {team.target_skill_level}</span>
                      <span className="text-slate-600">{team.estimated_duration}</span>
                    </div>
                    <Progress value={team.current_skill_level === 'beginner' ? 20 : team.current_skill_level === 'intermediate' ? 50 : 80} className="h-2" />
                  </div>
                </CardHeader>

                {selectedTeam === idx && (
                  <CardContent className="border-t border-slate-200">
                    {/* Skill Gaps */}
                    {team.skill_gaps?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-3">Skill Gaps</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {team.skill_gaps.map((gap, i) => (
                            <div key={i} className="bg-slate-50 rounded p-2 text-center">
                              <div className="text-sm font-medium text-slate-900">{gap.skill}</div>
                              <div className="text-xs text-slate-600">
                                {gap.current_level} → {gap.target_level}
                              </div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {gap.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning Path */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Learning Path</h4>
                      <div className="space-y-4">
                        {team.learning_path?.map((phase, i) => (
                          <div key={i} className="border-l-4 border-l-purple-600 pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-slate-900">{phase.phase}</h5>
                              <Badge variant="outline">{phase.duration}</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              {phase.modules?.map((mod, j) => (
                                <div key={j} className="bg-slate-50 rounded p-2">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium">{mod.title}</span>
                                  </div>
                                  <div className="text-xs text-slate-600 mt-1">
                                    {mod.type} • {mod.estimated_hours}h
                                  </div>
                                </div>
                              ))}
                            </div>
                            {phase.milestone && (
                              <div className="bg-green-50 border border-green-200 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-900">
                                    Milestone: {phase.milestone.name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simulations */}
                    {team.simulations?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-3">Simulations & Exercises</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {team.simulations.map((sim, i) => (
                            <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Lightbulb className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-amber-900">{sim.title}</span>
                              </div>
                              <p className="text-sm text-amber-800">{sim.scenario}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleGenerateCurriculum(team, team.team_name)}
                      disabled={generatingCurriculum}
                      variant="outline"
                      className="w-full"
                    >
                      {generatingCurriculum ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Award className="h-4 w-4 mr-2" />
                      )}
                      Generate Detailed Curriculum
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cross-team">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Team Collaboration Initiatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillPaths.cross_team_initiatives?.map((init, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{init.initiative}</h4>
                    <p className="text-sm text-slate-600 mb-3">{init.objective}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {init.participating_teams?.map((team, i) => (
                          <Badge key={i} variant="outline">{team}</Badge>
                        ))}
                      </div>
                      <Badge>{init.timeline}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillPaths.success_metrics?.map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">{metric.metric}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Baseline:</span>
                        <span className="ml-2 font-medium">{metric.baseline}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Target:</span>
                        <span className="ml-2 font-medium text-green-700">{metric.target}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Measured via: {metric.measurement_method}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {curriculum && (
          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Curriculum: {curriculum.role}</CardTitle>
                <p className="text-sm text-slate-600">
                  {curriculum.total_duration} • {curriculum.weekly_commitment} per week
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {curriculum.curriculum?.map((week, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900">Week {week.week}: {week.theme}</h4>
                      </div>
                      <div className="space-y-2">
                        {week.activities?.map((activity, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <Badge variant="outline">{activity.type}</Badge>
                            <span>{activity.title}</span>
                            <span className="text-slate-500 ml-auto">{activity.duration}</span>
                          </div>
                        ))}
                      </div>
                      {week.deliverables?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <span className="text-xs font-medium text-slate-600">Deliverables:</span>
                          <div className="flex gap-2 mt-1">
                            {week.deliverables.map((d, i) => (
                              <Badge key={i} className="bg-green-100 text-green-800">{d}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}