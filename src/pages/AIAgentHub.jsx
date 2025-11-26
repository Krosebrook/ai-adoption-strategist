import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, MessageSquare, Users, Sparkles, GraduationCap, 
  Shield, FileText, Send, Plus, ArrowRight, Loader2,
  Brain, Target, Zap, Share2
} from 'lucide-react';
import AgentCard from '../components/agents/AgentCard';
import AgentChat from '../components/agents/AgentChat';
import CollaborativeTask from '../components/agents/CollaborativeTask';
import SharedContextPanel from '../components/agents/SharedContextPanel';

export default function AIAgentHub() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [sharedContext, setSharedContext] = useState(null);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['agentConversations'],
    queryFn: async () => {
      const allConvos = [];
      for (const agent of agents) {
        try {
          const convos = await base44.agents.listConversations({ agent_name: agent.id });
          allConvos.push(...convos.map(c => ({ ...c, agentId: agent.id })));
        } catch (e) {
          // Agent may not exist yet
        }
      }
      return allConvos.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 10)
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list('-created_date', 10)
  });

  const agents = [
    {
      id: 'StrategyAdvisor',
      name: 'Strategy Advisor',
      description: 'Expert guidance on AI adoption strategies, roadmaps, and implementation planning',
      icon: Target,
      color: '#E88A1D',
      capabilities: ['Strategy planning', 'Risk assessment', 'Roadmap optimization', 'Best practices'],
      collaboratesWith: ['ComplianceAnalyst', 'ReportGenerator']
    },
    {
      id: 'TrainingCoach',
      name: 'Training Coach',
      description: 'Personalized AI training paths, skill development, and learning recommendations',
      icon: GraduationCap,
      color: '#3B82F6',
      capabilities: ['Skill assessment', 'Learning paths', 'Progress tracking', 'Adaptive content'],
      collaboratesWith: ['StrategyAdvisor']
    },
    {
      id: 'ComplianceAnalyst',
      name: 'Compliance Analyst',
      description: 'Regulatory compliance analysis, risk identification, and policy recommendations',
      icon: Shield,
      color: '#22C55E',
      capabilities: ['Compliance audit', 'Gap analysis', 'Policy review', 'Risk mitigation'],
      collaboratesWith: ['StrategyAdvisor', 'ReportGenerator']
    },
    {
      id: 'ReportGenerator',
      name: 'Report Generator',
      description: 'Automated report creation, data synthesis, and executive summaries',
      icon: FileText,
      color: '#6B5B7A',
      capabilities: ['Report creation', 'Data visualization', 'Executive summaries', 'Trend analysis'],
      collaboratesWith: ['StrategyAdvisor', 'ComplianceAnalyst']
    }
  ];

  const handleStartConversation = async (agent) => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: agent.id,
        metadata: {
          name: `Chat with ${agent.name}`,
          started_at: new Date().toISOString(),
          user_role: user?.role
        }
      });
      setActiveConversation({ ...conversation, agentId: agent.id });
      setSelectedAgent(agent);
      queryClient.invalidateQueries(['agentConversations']);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleStartCollaboration = () => {
    setCollaborativeMode(true);
    setSelectedAgents([]);
  };

  const handleToggleAgentSelection = (agent) => {
    setSelectedAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) {
        return prev.filter(a => a.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  const handleShareContext = (context) => {
    setSharedContext(context);
  };

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(180deg, #7A8B99 0%, #9A9A8E 15%, #C9B896 30%, #E8C078 45%, #F5A623 60%, #E88A1D 75%, #C4A35A 90%, #D4B896 100%)`
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              AI Agent Hub
            </h1>
            <p className="text-white/80 mt-1">
              Collaborate with specialized AI agents for strategic guidance
            </p>
          </div>
          <Button 
            onClick={handleStartCollaboration}
            className="bg-white/90 text-slate-900 hover:bg-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Multi-Agent Collaboration
          </Button>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="agents">
              <Bot className="h-4 w-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="conversations">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
            </TabsTrigger>
            <TabsTrigger value="collaborate">
              <Users className="h-4 w-4 mr-2" />
              Collaborate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  onStartChat={() => handleStartConversation(agent)}
                  isSelected={selectedAgents.some(a => a.id === agent.id)}
                  onToggleSelect={() => handleToggleAgentSelection(agent)}
                  selectMode={collaborativeMode}
                />
              ))}
            </div>

            {selectedAgent && activeConversation && (
              <AgentChat 
                agent={selectedAgent}
                conversation={activeConversation}
                sharedContext={sharedContext}
                onClose={() => {
                  setSelectedAgent(null);
                  setActiveConversation(null);
                }}
                onShareContext={handleShareContext}
                assessments={assessments}
                strategies={strategies}
              />
            )}
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.length > 0 ? (
                  <div className="space-y-3">
                    {conversations.slice(0, 10).map((convo) => {
                      const agent = agents.find(a => a.id === convo.agentId);
                      const Icon = agent?.icon || Bot;
                      return (
                        <div 
                          key={convo.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                          onClick={() => {
                            setActiveConversation(convo);
                            setSelectedAgent(agent);
                          }}
                        >
                          <div 
                            className="p-2 rounded-lg"
                            style={{ background: `${agent?.color}20` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: agent?.color }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{convo.metadata?.name || 'Conversation'}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(convo.created_date).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting with an agent above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborate" className="space-y-6">
            <CollaborativeTask 
              agents={agents}
              assessments={assessments}
              strategies={strategies}
              sharedContext={sharedContext}
              onUpdateContext={handleShareContext}
            />
          </TabsContent>
        </Tabs>

        {/* Shared Context Panel */}
        {sharedContext && (
          <SharedContextPanel 
            context={sharedContext}
            onClear={() => setSharedContext(null)}
          />
        )}
      </div>
    </div>
  );
}