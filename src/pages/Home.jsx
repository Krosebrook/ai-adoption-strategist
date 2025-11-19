import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from '@/utils';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Plug, 
  Target, 
  FileText,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: 'ROI Analysis',
      description: 'Calculate projected savings and multi-year ROI for each platform'
    },
    {
      icon: Shield,
      title: 'Compliance Scoring',
      description: 'Evaluate platforms against your required standards'
    },
    {
      icon: Plug,
      title: 'Integration Check',
      description: 'Assess compatibility with your existing tech stack'
    },
    {
      icon: Target,
      title: 'Pain Point Mapping',
      description: 'Match your challenges with AI-powered solutions'
    }
  ];

  const platforms = [
    { name: 'Google Gemini', color: '#4285F4' },
    { name: 'Microsoft Copilot', color: '#00A4EF' },
    { name: 'Anthropic Claude', color: '#D97757' },
    { name: 'OpenAI ChatGPT', color: '#10A37F' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ 
            background: 'rgba(33, 128, 141, 0.08)' 
          }}>
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Enterprise AI Assessment Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Choose the Right AI Platform
            <br />
            <span style={{ color: 'var(--color-text-secondary)' }}>for Your Enterprise</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Make data-driven decisions with comprehensive ROI analysis, compliance evaluation, 
            and integration assessment across leading AI platforms
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to={createPageUrl('Assessment')}>
              <Button 
                size="lg" 
                className="text-white px-8 py-6 text-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                  border: 'none'
                }}
              >
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Dashboard')}>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Results
              </Button>
            </Link>
          </div>
        </div>

        {/* Platform Logos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-16">
          <p className="text-center text-sm font-medium text-slate-500 mb-6 uppercase tracking-wide">
            Comparing Top AI Platforms
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <div key={index} className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }} />
                <span className="font-semibold text-slate-700">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="rounded-2xl p-8 md:p-12 text-white" style={{ 
          background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-teal-700))' 
        }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Four simple steps to your AI platform recommendation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Organization Details', desc: 'Provide basic information about your company' },
              { step: 2, title: 'Department Setup', desc: 'Configure departments, users, and costs' },
              { step: 3, title: 'Requirements', desc: 'Select compliance and integration needs' },
              { step: 4, title: 'Get Results', desc: 'Receive detailed recommendations and reports' }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-2xl font-bold" style={{ 
                  color: 'var(--color-teal-600)' 
                }}>
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold">{item.title}</h4>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'Vendor-Agnostic', desc: 'Unbiased comparison based on your specific needs' },
            { icon: FileText, title: 'Comprehensive Reports', desc: 'Executive summaries and detailed analytics' },
            { icon: CheckCircle2, title: 'Data-Driven', desc: 'Real benchmark data from enterprise deployments' }
          ].map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center space-y-3 p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                  <Icon className="h-6 w-6 text-slate-700" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900">{benefit.title}</h4>
                <p className="text-sm text-slate-600">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}