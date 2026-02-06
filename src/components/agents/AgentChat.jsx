import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Send, X, Loader2, Share2, FileText, Target,
  Paperclip, Bot, User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import InlineAIFeedback from '../ai/InlineAIFeedback';

export default function AgentChat({ 
  agent, 
  conversation, 
  sharedContext, 
  onClose, 
  onShareContext,
  assessments,
  strategies
}) {
  const [messages, setMessages] = useState(conversation?.messages || []);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedContext, setAttachedContext] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversation?.id) return;
    
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe?.();
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-inject shared context
  useEffect(() => {
    if (sharedContext && messages.length === 0) {
      setAttachedContext(sharedContext);
    }
  }, [sharedContext]);

  const handleSend = async () => {
    if (!input.trim() && !attachedContext) return;

    setSending(true);
    try {
      let messageContent = input;
      
      if (attachedContext) {
        messageContent = `[Context: ${attachedContext.type} - ${attachedContext.name}]\n\n${input}`;
      }

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: messageContent
      });
      
      setInput('');
      setAttachedContext(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleShareToContext = (message) => {
    onShareContext({
      type: 'agent_response',
      name: `${agent.name} insight`,
      content: message.content,
      from: agent.id,
      timestamp: new Date().toISOString()
    });
  };

  const handleAttachAssessment = (assessment) => {
    setAttachedContext({
      type: 'assessment',
      id: assessment.id,
      name: assessment.organization_name,
      data: {
        organization: assessment.organization_name,
        platforms: assessment.recommended_platforms?.slice(0, 2),
        maturity: assessment.ai_assessment_score?.maturity_level,
        risks: assessment.ai_assessment_score?.key_risks?.slice(0, 3)
      }
    });
  };

  const handleAttachStrategy = (strategy) => {
    setAttachedContext({
      type: 'strategy',
      id: strategy.id,
      name: strategy.organization_name,
      data: {
        organization: strategy.organization_name,
        platform: strategy.platform,
        progress: strategy.progress_tracking?.overall_progress,
        phase: strategy.progress_tracking?.current_phase,
        risks: strategy.risk_analysis?.identified_risks?.slice(0, 3)
      }
    });
  };

  const Icon = agent.icon;

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-white/30 mt-6">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: `${agent.color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color: agent.color }} />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-slate-500">Active conversation</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Bot className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Start the conversation</p>
              <p className="text-sm">Ask {agent.name} anything about {agent.capabilities[0].toLowerCase()}</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div 
                  className="p-2 rounded-lg h-fit"
                  style={{ background: `${agent.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: agent.color }} />
                </div>
              )}
              <div 
                className={`max-w-[75%] rounded-xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
                {msg.role !== 'user' && (
                  <div className="mt-2 space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => handleShareToContext(msg)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share to Context
                    </Button>
                    <InlineAIFeedback
                      agentName={agent.id}
                      prompt={messages[idx - 1]?.content || ''}
                      response={msg.content}
                      conversationId={conversation?.id}
                      interactionType="chat"
                      compact={true}
                    />
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="p-2 rounded-lg bg-slate-200 h-fit">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached Context */}
        {attachedContext && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  {attachedContext.type === 'assessment' ? <FileText className="h-3 w-3 mr-1" /> : <Target className="h-3 w-3 mr-1" />}
                  {attachedContext.name}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAttachedContext(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2 mb-2">
            <Select onValueChange={(id) => {
              const assessment = assessments.find(a => a.id === id);
              if (assessment) handleAttachAssessment(assessment);
            }}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Attach Assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.organization_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(id) => {
              const strategy = strategies.find(s => s.id === id);
              if (strategy) handleAttachStrategy(strategy);
            }}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Attach Strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.organization_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${agent.name}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={sending}
            />
            <Button 
              onClick={handleSend}
              disabled={sending || (!input.trim() && !attachedContext)}
              style={{ background: agent.color }}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}