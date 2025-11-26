import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, BarChart3, FileText, Sparkles, GraduationCap,
  DollarSign, Shield, TrendingUp, ArrowRight, Clock
} from 'lucide-react';

export default function RoleBasedWidgets({ userRole, assessments, strategies }) {
  // Define widgets per role
  const roleWidgets = {
    admin: [
      {
        title: 'Team Overview',
        icon: Users,
        color: '#6B5B7A',
        content: () => (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Users</span>
              <Badge variant="outline">View in Settings</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Active Sessions</span>
              <span className="font-semibold">—</span>
            </div>
            <Link to={createPageUrl('Settings')}>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Manage Users <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )
      },
      {
        title: 'System Health',
        icon: Shield,
        color: '#22C55E',
        content: () => (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">All systems operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">Database: Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">AI Services: Online</span>
            </div>
          </div>
        )
      }
    ],
    user: [
      {
        title: 'Quick Actions',
        icon: Sparkles,
        color: '#E88A1D',
        content: () => (
          <div className="grid grid-cols-2 gap-2">
            <Link to={createPageUrl('Assessment')}>
              <Button variant="outline" size="sm" className="w-full h-auto py-3 flex-col">
                <FileText className="h-5 w-5 mb-1 text-orange-500" />
                <span className="text-xs">New Assessment</span>
              </Button>
            </Link>
            <Link to={createPageUrl('StrategyAutomation')}>
              <Button variant="outline" size="sm" className="w-full h-auto py-3 flex-col">
                <Sparkles className="h-5 w-5 mb-1 text-purple-500" />
                <span className="text-xs">Create Strategy</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Training')}>
              <Button variant="outline" size="sm" className="w-full h-auto py-3 flex-col">
                <GraduationCap className="h-5 w-5 mb-1 text-blue-500" />
                <span className="text-xs">Training</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Reports')}>
              <Button variant="outline" size="sm" className="w-full h-auto py-3 flex-col">
                <BarChart3 className="h-5 w-5 mb-1 text-green-500" />
                <span className="text-xs">Reports</span>
              </Button>
            </Link>
          </div>
        )
      },
      {
        title: 'Recent Activity',
        icon: Clock,
        color: '#3B82F6',
        content: () => {
          const recentItems = [...assessments, ...strategies]
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 4);
          
          return (
            <div className="space-y-2">
              {recentItems.length > 0 ? recentItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  {item.organization_name ? (
                    <FileText className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-slate-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {item.organization_name || item.platform}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
              )}
            </div>
          );
        }
      }
    ]
  };

  // Get widgets for current role (fallback to user)
  const widgets = roleWidgets[userRole] || roleWidgets.user;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-white mb-4" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
        {userRole === 'admin' ? 'Admin Tools' : 'Your Workspace'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget, idx) => {
          const Icon = widget.icon;
          return (
            <Card key={idx} className="bg-white/90 backdrop-blur-sm border border-white/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5" style={{ color: widget.color }} />
                  {widget.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {widget.content()}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}