import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Zap } from 'lucide-react';

export default function AgentCard({ agent, onStartChat, isSelected, onToggleSelect, selectMode }) {
  const Icon = agent.icon;

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border-2 transition-all ${
      isSelected ? 'border-orange-400 shadow-lg' : 'border-white/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {selectMode && (
              <Checkbox 
                checked={isSelected}
                onCheckedChange={onToggleSelect}
              />
            )}
            <div 
              className="p-3 rounded-xl"
              style={{ background: `${agent.color}15` }}
            >
              <Icon className="h-6 w-6" style={{ color: agent.color }} />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">{agent.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Capabilities</p>
          <div className="flex flex-wrap gap-1">
            {agent.capabilities.map((cap, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
        </div>

        {agent.collaboratesWith?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Collaborates With</p>
            <div className="flex flex-wrap gap-1">
              {agent.collaboratesWith.map((name, idx) => (
                <Badge key={idx} className="text-xs bg-purple-100 text-purple-800">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={onStartChat}
          className="w-full"
          style={{ background: agent.color }}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}