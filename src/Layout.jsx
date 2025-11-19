import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Home, FileText, LayoutDashboard, Star } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navigation = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Executive', icon: LayoutDashboard, page: 'ExecutiveDashboard' },
    { name: 'Assessment', icon: FileText, page: 'Assessment' },
    { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { name: 'Feedback', icon: Star, page: 'FeedbackDashboard' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Enterprise AI Assessment</h1>
                <p className="text-xs text-slate-500">Platform Comparison Tool</p>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
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
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-500">
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