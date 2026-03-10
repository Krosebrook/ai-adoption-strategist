import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Brain, Home, FileText, LayoutDashboard, Star, Settings, TrendingUp, Sparkles, GraduationCap, Shield, Activity, Menu, X } from 'lucide-react';
import OnboardingBanner from './components/onboarding/OnboardingBanner';
import InteractiveOnboardingGuide from './components/onboarding/InteractiveOnboardingGuide';
import PersonalizedOnboardingFlow from './components/onboarding/PersonalizedOnboardingFlow';
import PWAInstallPrompt from './components/pwa/PWAInstallPrompt';
import ContextualGuidancePanel from './components/guidance/ContextualGuidancePanel';
import NotificationCenter from './components/notifications/NotificationCenter';
import CommandPalette from './components/command/CommandPalette';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false
  });

  const navigation = React.useMemo(() => {
    const all = [
      { name: 'Home', icon: Home, page: 'Home', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
      { name: 'Dashboard', icon: LayoutDashboard, page: 'CustomDashboard', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
      { name: 'Platforms', icon: Star, page: 'PlatformCatalog', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
      { name: 'Executive', icon: LayoutDashboard, page: 'ExecutiveDashboard', roles: ['admin', 'executive'] },
      { name: 'ROI Simulator', icon: TrendingUp, page: 'ROISimulation', roles: ['admin', 'executive', 'product_manager', 'analyst', 'user'] },
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
    return all.filter(item => !item.roles || item.roles.includes(user?.role || 'user'));
  }, [user?.role]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Personalized Onboarding Flow */}
      <PersonalizedOnboardingFlow />

      {/* Onboarding Banner */}
      <OnboardingBanner />

      {/* Interactive Onboarding Guide */}
      <InteractiveOnboardingGuide />
      
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

            <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 mx-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    aria-current={isActive ? 'page' : undefined}
                    className="flex items-center gap-2 px-3 py-2 font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm"
                    style={{
                      borderRadius: 'var(--radius-base)',
                      background: isActive ? 'linear-gradient(135deg, #E88A1D, #D07612)' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <NotificationCenter />
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg ml-2"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <nav className="flex flex-col px-4 py-2 max-h-[70vh] overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 font-medium transition-all rounded-lg my-0.5"
                    style={{
                      background: isActive ? 'linear-gradient(135deg, #E88A1D, #D07612)' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
      
      {/* Command Palette */}
      <CommandPalette />

      {/* Main Content */}
      <main role="main">{children}</main>
      
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
              Comprehensive AI platform comparison: Claude, ChatGPT, Gemini, Copilot, Mistral, and 70+ providers across all ecosystems
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}