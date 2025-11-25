import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  TrendingUp, 
  Sparkles, 
  GraduationCap, 
  DollarSign, 
  ArrowRight,
  Target,
  Shield,
  BarChart3,
  CheckCircle,
  Users,
  Zap,
  Globe
} from 'lucide-react';

export default function HomePage() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['recentAssessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 5),
    initialData: []
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['activeStrategies'],
    queryFn: () => base44.entities.AdoptionStrategy.filter({ status: 'active' }, '-created_date', 5),
    initialData: []
  });

  const features = [
    {
      title: 'AI Assessment',
      description: 'Get intelligent platform recommendations based on your needs',
      icon: FileText,
      link: 'Assessment',
      stats: `${assessments.length} assessments`
    },
    {
      title: 'Strategy Automation',
      description: 'Automated roadmap generation with risk management',
      icon: Sparkles,
      link: 'StrategyAutomation',
      stats: `${strategies.length} active strategies`
    },
    {
      title: 'AI Training',
      description: 'Personalized training modules with progress tracking',
      icon: GraduationCap,
      link: 'Training'
    },
    {
      title: 'Financial Optimization',
      description: 'Cost forecasting and budget scenario simulation',
      icon: DollarSign,
      link: 'StrategyAutomation'
    },
    {
      title: 'Platform Comparison',
      description: 'Side-by-side analysis of AI platforms',
      icon: BarChart3,
      link: 'PlatformComparison'
    },
    {
      title: 'Collaborative Strategy',
      description: 'Multi-user co-editing with AI-driven decision support',
      icon: Users,
      link: 'StrategyAutomation'
    }
  ];

  const quickActions = [
    { label: 'Start Assessment', icon: FileText, link: 'Assessment' },
    { label: 'Generate Strategy', icon: Sparkles, link: 'StrategyAutomation' },
    { label: 'View Training', icon: GraduationCap, link: 'Training' },
    { label: 'Analyze Trends', icon: TrendingUp, link: 'Trends' }
  ];

  const platforms = [
    { name: 'Google Gemini', provider: 'Google' },
    { name: 'Microsoft Copilot', provider: 'Microsoft' },
    { name: 'Anthropic Claude', provider: 'Anthropic' },
    { name: 'OpenAI ChatGPT', provider: 'OpenAI' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `linear-gradient(
            180deg,
            #7A8B99 0%,
            #9A9A8E 15%,
            #C9B896 30%,
            #E8C078 45%,
            #F5A623 60%,
            #E88A1D 75%,
            #C4A35A 90%,
            #D4B896 100%
          )`
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            INT Inc. Enterprise AI Platform
          </h1>
          <p className="text-xl mb-8 text-white/95" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
            Strategic Assessment & Implementation Planning
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={createPageUrl(action.link)}>
                  <Button 
                    className="bg-white/95 text-slate-900 hover:bg-white border border-orange-300/30 shadow-md hover:shadow-lg transition-all"
                    style={{ borderRadius: '20px' }}
                  >
                    <Icon className="h-4 w-4 mr-2" style={{ color: '#E88A1D' }} />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Assessments', value: assessments.length, icon: FileText, color: '#E88A1D' },
            { label: 'Active Strategies', value: strategies.length, icon: Target, color: '#6B5B7A' },
            { label: 'AI Platforms', value: 4, icon: Globe, color: '#D07612' },
            { label: 'Welcome', value: user?.full_name?.split(' ')[0] || 'User', icon: CheckCircle, color: '#C4A35A' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-white/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
                      <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
                    </div>
                    <Icon className="h-8 w-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
            Supported AI Platforms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform, idx) => (
              <Card key={idx} className="bg-white/80 backdrop-blur-sm border border-white/30 cursor-pointer hover:bg-white/90 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{platform.name}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--color-text-secondary)' }}
                  >
                    {platform.provider}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link key={idx} to={createPageUrl(feature.link)}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/30 h-full hover:bg-white/90 transition-all">
                    <CardHeader>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                        style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg" style={{ color: 'var(--color-text)' }}>{feature.title}</CardTitle>
                      <CardDescription style={{ color: 'var(--color-text-secondary)' }}>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {feature.stats && (
                          <Badge variant="outline" style={{ borderColor: 'rgba(0,0,0,0.2)', color: 'var(--color-text-secondary)' }}>
                            {feature.stats}
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4" style={{ color: 'var(--color-gray-400)' }} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {assessments.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border border-white/30 mb-12">
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text)' }}>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessments.slice(0, 3).map((assessment) => (
                  <Link
                    key={assessment.id}
                    to={createPageUrl('Results') + `?id=${assessment.id}`}
                    className="block"
                  >
                    <div 
                      className="rounded-lg p-4 transition-colors bg-white/50 hover:bg-white/70"
                      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>{assessment.organization_name}</h4>
                          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {assessment.recommended_platforms?.[0]?.platform_name}
                          </p>
                        </div>
                        <Badge style={{ background: assessment.status === 'completed' ? '#E88A1D' : '#6B5B7A', color: 'white' }}>
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {assessments.length > 3 && (
                <Link to={createPageUrl('Dashboard')}>
                  <Button variant="outline" className="w-full mt-4 bg-white/50 hover:bg-white/70" style={{ borderColor: 'rgba(0,0,0,0.2)', color: 'var(--color-text)' }}>
                    View All Assessments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Key Benefits */}
        <div 
          className="rounded-xl p-8 mb-12 backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
            Why Choose INT Inc. Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-3" style={{ color: '#6B5B7A' }} />
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Risk-Aware Planning</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                AI identifies potential risks and creates comprehensive mitigation strategies
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-3" style={{ color: '#E88A1D' }} />
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Cost Optimization</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Forecast costs, identify savings, and simulate budget scenarios
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-3" style={{ color: '#D07612' }} />
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Automated Strategy</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Generate complete implementation roadmaps with real-time progress monitoring
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-white/85 backdrop-blur-sm border-2" style={{ borderColor: '#E88A1D' }}>
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              Ready to Transform Your AI Adoption?
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Start with a comprehensive AI assessment and get personalized recommendations
            </p>
            <Link to={createPageUrl('Assessment')}>
              <Button 
                size="lg" 
                className="text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Assessment Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}