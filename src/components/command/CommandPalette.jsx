import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Sparkles, ArrowRight, TrendingUp, FileText, 
  BarChart3, Shield, Award, Users, Settings 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Keyboard shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Static actions based on role
  const getStaticActions = () => {
    const commonActions = [
      { id: 'home', label: 'Go to Home', page: 'Home', icon: TrendingUp, category: 'Navigation' },
      { id: 'dashboard', label: 'View Dashboard', page: 'CustomDashboard', icon: BarChart3, category: 'Navigation' },
      { id: 'training', label: 'Training Modules', page: 'Training', icon: Award, category: 'Navigation' },
      { id: 'assessment', label: 'New Assessment', page: 'Assessment', icon: FileText, category: 'Navigation' },
      { id: 'settings', label: 'Settings', page: 'Settings', icon: Settings, category: 'Navigation' }
    ];

    const roleActions = {
      admin: [
        { id: 'admin-panel', label: 'Admin Panel', page: 'AdminPanel', icon: Shield, category: 'Admin' },
        { id: 'governance', label: 'AI Governance', page: 'AIGovernance', icon: Shield, category: 'Admin' }
      ],
      executive: [
        { id: 'exec-dashboard', label: 'Executive Dashboard', page: 'ExecutiveDashboard', icon: BarChart3, category: 'Executive' },
        { id: 'reports', label: 'Reports', page: 'Reports', icon: FileText, category: 'Executive' }
      ]
    };

    const actions = [...commonActions];
    if (user?.role && roleActions[user.role]) {
      actions.push(...roleActions[user.role]);
    }
    return actions;
  };

  // Generate AI suggestions
  const generateSuggestions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant for an enterprise AI adoption platform. 
        
User Context:
- Role: ${user.role}
- Email: ${user.email}
- Current Search: "${search}"

Based on the user's role and current search query, suggest 3-5 relevant actions they might want to take.

Consider actions like:
- Viewing specific dashboards or reports
- Creating assessments or strategies
- Reviewing training modules
- Checking risk alerts
- Managing team members (for admin/exec)
- Generating AI insights
- Reviewing progress metrics

Make suggestions specific, actionable, and relevant to their role.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  relevance: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && search.length > 2) {
      const timer = setTimeout(generateSuggestions, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [search, open]);

  const staticActions = getStaticActions();
  const filteredActions = search 
    ? staticActions.filter(a => 
        a.label.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
      )
    : staticActions;

  const executeAction = (action) => {
    if (action.page) {
      navigate(createPageUrl(action.page));
      setOpen(false);
      setSearch('');
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      TrendingUp, FileText, BarChart3, Shield, Award, Users, Settings
    };
    return icons[iconName] || ArrowRight;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type a command..."
              className="pl-10"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 rounded border">⌘K</kbd>
            <span>to open</span>
            <span className="mx-2">•</span>
            <Sparkles className="h-3 w-3" />
            <span>AI-powered suggestions</span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* AI Suggestions */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <Sparkles className="h-5 w-5 animate-pulse mx-auto mb-2" />
              Generating AI suggestions...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                AI Suggestions
              </div>
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => toast.info(suggestion.description)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{suggestion.label}</span>
                    <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Static Actions */}
          {filteredActions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500">Quick Actions</div>
              {filteredActions.map((action) => {
                const Icon = getIcon(action.icon.name);
                return (
                  <div
                    key={action.id}
                    className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer flex items-center justify-between"
                    onClick={() => executeAction(action)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span>{action.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{action.category}</Badge>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && suggestions.length === 0 && filteredActions.length === 0 && search && (
            <div className="p-8 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}