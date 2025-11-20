import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Home, FileText, LayoutDashboard, Star, Settings, TrendingUp, Sparkles } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navigation = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Executive', icon: LayoutDashboard, page: 'ExecutiveDashboard' },
    { name: 'Assessment', icon: FileText, page: 'Assessment' },
    { name: 'Compare', icon: Star, page: 'PlatformComparison' },
    { name: 'Trends', icon: TrendingUp, page: 'Trends' },
    { name: 'Predictive', icon: Sparkles, page: 'PredictiveAnalytics' },
    { name: 'Reports', icon: FileText, page: 'Reports' },
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Settings', icon: Settings, page: 'Settings' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ 
        background: 'var(--color-surface)', 
        borderBottom: '2px solid var(--color-border)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' 
              }}>
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Enterprise AI Assessment
                </h1>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Platform Comparison Tool
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className="flex items-center gap-2 px-4 py-2 font-medium transition-all"
                    style={{
                      borderRadius: 'var(--radius-base)',
                      background: isActive ? 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' : 'transparent',
                      color: isActive ? 'white' : 'var(--color-text-secondary)'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

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