import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, Sparkles, Loader2, ArrowRight, Target, Shield,
  FileText, GraduationCap, CheckCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CollaborativeTask({ agents, assessments, strategies, sharedContext, onUpdateContext }) {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [synthesizedResult, setSynthesizedResult] = useState(null);

  const taskTemplates = [
    {
      name: 'Strategy + Compliance Review',
      agents: ['StrategyAdvisor', 'ComplianceAnalyst'],
      description: 'Review the selected strategy for compliance risks and provide joint recommendations for mitigation while maintaining strategic objectives.'
    },
    {
      name: 'Comprehensive Assessment Report',
      agents: ['StrategyAdvisor', 'ReportGenerator'],
      description: 'Generate a comprehensive executive report based on the assessment, including strategic recommendations and implementation roadmap.'
    },
    {
      name: 'Training Gap Analysis',
      agents: ['TrainingCoach', 'StrategyAdvisor'],
      description: 'Analyze skill gaps based on the strategy requirements and create a personalized training plan to support successful adoption.'
    },
    {
      name: 'Full Scenario Impact Analysis',
      agents: ['StrategyAdvisor', 'ComplianceAnalyst', 'ReportGenerator'],
      description: 'Conduct a complete impact analysis of the scenario including strategic implications, compliance considerations, and generate a detailed report.'
    }
  ];

  const handleToggleAgent = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleApplyTemplate = (template) => {
    setSelectedAgents(template.agents);
    setTaskDescription(template.description);
  };

  const handleExecuteCollaboration = async () => {
    if (selectedAgents.length < 2 || !taskDescription) return;

    setProcessing(true);
    setResults([]);
    setSynthesizedResult(null);

    try {
      // Build context
      const context = {
        task: taskDescription,
        assessment: selectedAssessment ? assessments.find(a => a.id === selectedAssessment) : null,
        strategy: selectedStrategy ? strategies.find(s => s.id === selectedStrategy) : null,
        sharedContext
      };

      // Get response from each agent
      const agentResults = [];
      
      for (const agentId of selectedAgents) {
        const agent = agents.find(a => a.id === agentId);
        
        const prompt = `You are the ${agent.name}. ${agent.description}

COLLABORATIVE TASK: ${taskDescription}

CONTEXT:
${context.assessment ? `Assessment: ${context.assessment.organization_name}
- Recommended Platform: ${context.assessment.recommended_platforms?.[0]?.platform_name}
- Maturity Level: ${context.assessment.ai_assessment_score?.maturity_level}
- Key Risks: ${context.assessment.ai_assessment_score?.key_risks?.map(r => r.description).join(', ')}` : ''}

${context.strategy ? `Strategy: ${context.strategy.organization_name}
- Platform: ${context.strategy.platform}
- Current Phase: ${context.strategy.progress_tracking?.current_phase}
- Progress: ${context.strategy.progress_tracking?.overall_progress}%
- Active Risks: ${context.strategy.risk_analysis?.identified_risks?.filter(r => r.status !== 'resolved').length}` : ''}

${context.sharedContext ? `Shared Context: ${JSON.stringify(context.sharedContext)}` : ''}

Provide your expert analysis and recommendations for this collaborative task. Be specific and actionable.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              analysis: { type: 'string' },
              key_findings: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } },
              risks_identified: { type: 'array', items: { type: 'string' } },
              collaboration_notes: { type: 'string' }
            }
          }
        });

        agentResults.push({
          agent,
          response
        });
        
        setResults(prev => [...prev, { agent, response }]);
      }

      // Synthesize results
      const synthesisPrompt = `You are a senior consultant synthesizing insights from multiple AI specialists.

ORIGINAL TASK: ${taskDescription}

AGENT ANALYSES:
${agentResults.map(r => `
=== ${r.agent.name} ===
Analysis: ${r.response.analysis}
Key Findings: ${r.response.key_findings?.join(', ')}
Recommendations: ${r.response.recommendations?.join(', ')}
`).join('\n')}

Create a unified synthesis that:
1. Combines the key insights from all agents
2. Resolves any conflicting recommendations
3. Provides a prioritized action plan
4. Highlights areas of consensus and divergence`;

      const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: synthesisPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string' },
            unified_recommendations: { type: 'array', items: { type: 'string' } },
            priority_actions: { type: 'array', items: { type: 'object', properties: { action: { type: 'string' }, priority: { type: 'string' }, owner: { type: 'string' } } } },
            consensus_areas: { type: 'array', items: { type: 'string' } },
            areas_for_further_review: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setSynthesizedResult(synthesis);

      // Update shared context
      onUpdateContext({
        type: 'collaboration_result',
        name: 'Multi-Agent Analysis',
        content: synthesis.executive_summary,
        agents: selectedAgents,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Collaboration failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getAgentIcon = (agentId) => {
    const icons = {
      StrategyAdvisor: Target,
      TrainingCoach: GraduationCap,
      ComplianceAnalyst: Shield,
      ReportGenerator: FileText
    };
    return icons[agentId] || Sparkles;
  };

  return (
    <div className="space-y-6">
      {/* Task Templates */}
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Collaboration Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {taskTemplates.map((template, idx) => (
              <div 
                key={idx}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300 transition-colors"
                onClick={() => handleApplyTemplate(template)}
              >
                <h4 className="font-medium text-slate-900 mb-2">{template.name}</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.agents.map(agentId => {
                    const agent = agents.find(a => a.id === agentId);
                    const Icon = getAgentIcon(agentId);
                    return (
                      <Badge key={agentId} variant="outline" className="text-xs">
                        <Icon className="h-3 w-3 mr-1" />
                        {agent?.name}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Configure Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agent Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Agents (min 2)</label>
            <div className="flex flex-wrap gap-3">
              {agents.map(agent => {
                const Icon = agent.icon;
                return (
                  <div 
                    key={agent.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAgents.includes(agent.id) 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleToggleAgent(agent.id)}
                  >
                    <Checkbox checked={selectedAgents.includes(agent.id)} />
                    <Icon className="h-4 w-4" style={{ color: agent.color }} />
                    <span className="text-sm font-medium">{agent.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Assessment Context</label>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment..." />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.organization_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Strategy Context</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy..." />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.organization_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Task Description</label>
            <Textarea 
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe what you want the agents to collaborate on..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleExecuteCollaboration}
            disabled={selectedAgents.length < 2 || !taskDescription || processing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {processing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Users className="h-4 w-4 mr-2" /> Execute Collaboration</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            Agent Responses
          </h3>
          {results.map((result, idx) => {
            const Icon = result.agent.icon;
            return (
              <Card key={idx} className="bg-white/90 backdrop-blur-sm border border-white/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-5 w-5" style={{ color: result.agent.color }} />
                    {result.agent.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">{result.response.analysis}</p>
                  
                  {result.response.key_findings?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Key Findings</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {result.response.key_findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Synthesized Result */}
      {synthesizedResult && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Synthesized Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/80 rounded-lg">
              <p className="text-sm text-slate-700">{synthesizedResult.executive_summary}</p>
            </div>

            {synthesizedResult.priority_actions?.length > 0 && (
              <div>
                <p className="font-semibold text-purple-900 mb-2">Priority Actions</p>
                <div className="space-y-2">
                  {synthesizedResult.priority_actions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <Badge className={
                        action.priority === 'high' ? 'bg-red-100 text-red-800' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {action.priority}
                      </Badge>
                      <span className="text-sm text-slate-700 flex-1">{action.action}</span>
                      {action.owner && (
                        <Badge variant="outline">{action.owner}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {synthesizedResult.consensus_areas?.length > 0 && (
              <div>
                <p className="font-semibold text-purple-900 mb-2">Areas of Consensus</p>
                <ul className="space-y-1">
                  {synthesizedResult.consensus_areas.map((area, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}