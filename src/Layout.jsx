import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Brain, Home, FileText, LayoutDashboard, Star, Settings, TrendingUp, Sparkles, GraduationCap, Shield, Activity } from 'lucide-react';
import OnboardingBanner from './components/onboarding/OnboardingBanner';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import ContextualGuidancePanel from './components/guidance/ContextualGuidancePanel';
import NotificationCenter from './components/notifications/NotificationCenter';
import CommandPalette from './components/command/CommandPalette';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(userData => setUser(userData))
      .catch(() => setUser({ role: 'user' }));
  }, []);

  const allNavigation = [
        { name: 'Home', icon: Home, page: 'Home', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
        { name: 'Dashboard', icon: LayoutDashboard, page: 'CustomDashboard', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
        { name: 'Executive', icon: LayoutDashboard, page: 'ExecutiveDashboard', roles: ['admin', 'executive'] },
        { name: 'Analytics', icon: TrendingUp, page: 'Analytics', roles: ['admin', 'executive', 'analyst'] },
        { name: 'Assessment', icon: FileText, page: 'Assessment', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
        { name: 'Strategy', icon: Sparkles, page: 'StrategyAutomation', roles: ['admin', 'executive', 'product_manager'] },
        { name: 'AI Agents', icon: Brain, page: 'AIAgentHub', roles: ['admin', 'product_manager', 'user'] },
        { name: 'Risk Monitor', icon: Shield, page: 'RiskMonitoring', roles: ['admin', 'executive', 'product_manager'] },
        { name: 'Training', icon: GraduationCap, page: 'Training', roles: ['admin', 'product_manager', 'analyst', 'user'] },
        { name: 'Governance', icon: Shield, page: 'AIGovernance', roles: ['admin', 'executive'] },
        { name: 'AI Performance', icon: Activity, page: 'AIPerformanceMonitor', roles: ['admin', 'executive'] },
        { name: 'Reports', icon: FileText, page: 'Reports', roles: ['admin', 'executive', 'analyst'] },
        { name: 'Admin Panel', icon: Shield, page: 'AdminPanel', roles: ['admin'] },
        { name: 'Settings', icon: Settings, page: 'Settings', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] }
      ];

  const navigation = allNavigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'user')
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Onboarding Banner */}
      <OnboardingBanner />
      
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ 
        background: 'var(--color-surface)', 
        borderBottom: '2px solid var(--color-border)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, #E88A1D, #D07612)' 
              }}>
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  INT Inc. AI Platform
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Strategic Assessment & Implementation
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide" style={{ maxWidth: 'calc(100vw - 400px)' }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className="flex items-center gap-2 px-4 py-2 font-medium transition-all whitespace-nowrap flex-shrink-0"
                    style={{
                      borderRadius: 'var(--radius-base)',
                      background: isActive ? 'linear-gradient(135deg, #E88A1D, #D07612)' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <NotificationCenter />
          </div>
        </div>
      </header>
      
      {/* Command Palette */}
      <CommandPalette />

      {/* Main Content */}
      <main>{children}</main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* AI Contextual Guidance */}
      <ContextualGuidancePanel currentPage={currentPageName} minimized={true} />

      {/* Footer */}
      <footer className="mt-16" style={{ 
        background: 'var(--color-surface)', 
        borderTop: '1px solid var(--color-border)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p className="mb-2">
              Enterprise AI Adoption Assessment & Implementation Planning Tool
            </p>
            <p>
              Vendor-agnostic comparison of Google Gemini, Microsoft Copilot, Anthropic Claude, and OpenAI ChatGPT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}