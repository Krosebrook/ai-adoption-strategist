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
  CheckCircle
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
      color: 'blue',
      link: 'Assessment',
      stats: `${assessments.length} assessments`
    },
    {
      title: 'Strategy Automation',
      description: 'Automated roadmap generation with risk management',
      icon: Sparkles,
      color: 'purple',
      link: 'StrategyAutomation',
      stats: `${strategies.length} active strategies`
    },
    {
      title: 'AI Training',
      description: 'Personalized training modules with progress tracking',
      icon: GraduationCap,
      color: 'green',
      link: 'Training'
    },
    {
      title: 'Financial Optimization',
      description: 'Cost forecasting and budget scenario simulation',
      icon: DollarSign,
      color: 'emerald',
      link: 'StrategyAutomation'
    },
    {
      title: 'Platform Comparison',
      description: 'Side-by-side analysis of AI platforms',
      icon: BarChart3,
      color: 'indigo',
      link: 'PlatformComparison'
    },
    {
      title: 'Predictive Analytics',
      description: 'ROI forecasting and risk prediction',
      icon: TrendingUp,
      color: 'pink',
      link: 'PredictiveAnalytics'
    }
  ];

  const quickActions = [
    { label: 'Start New Assessment', icon: FileText, link: 'Assessment', color: 'blue' },
    { label: 'Generate Strategy', icon: Sparkles, link: 'StrategyAutomation', color: 'purple' },
    { label: 'View Training', icon: GraduationCap, link: 'Training', color: 'green' },
    { label: 'Analyze Trends', icon: TrendingUp, link: 'Trends', color: 'pink' }
  ];

  const getColorClasses = (color) => ({
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600'
  }[color]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Enterprise AI Decision Platform
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            AI-powered assessment, strategy automation, and implementation planning
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={createPageUrl(action.link)}>
                  <Button className={`bg-gradient-to-r ${getColorClasses(action.color)} hover:opacity-90`}>
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Total Assessments</div>
                  <div className="text-2xl font-bold text-slate-900">{assessments.length}</div>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Active Strategies</div>
                  <div className="text-2xl font-bold text-slate-900">{strategies.length}</div>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">AI Platforms</div>
                  <div className="text-2xl font-bold text-slate-900">4</div>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600 mb-1">User</div>
                  <div className="text-lg font-bold text-slate-900 truncate">{user?.full_name}</div>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link key={idx} to={createPageUrl(feature.link)}>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getColorClasses(feature.color)} flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {feature.stats && (
                          <Badge variant="outline">{feature.stats}</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-slate-400" />
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessments.slice(0, 3).map((assessment) => (
                  <Link
                    key={assessment.id}
                    to={createPageUrl('Results') + `?id=${assessment.id}`}
                    className="block"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{assessment.organization_name}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {assessment.recommended_platforms?.[0]?.platform_name}
                          </p>
                        </div>
                        <Badge className={
                          assessment.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                        }>
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {assessments.length > 3 && (
                <Link to={createPageUrl('Dashboard')}>
                  <Button variant="outline" className="w-full mt-4">
                    View All Assessments
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Key Benefits */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-text)' }}>
            Why Use This Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Risk-Aware Planning</h3>
              <p className="text-sm text-slate-600">
                AI identifies potential risks and creates comprehensive mitigation strategies
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Cost Optimization</h3>
              <p className="text-sm text-slate-600">
                Forecast costs, identify savings, and simulate budget scenarios
              </p>
            </div>
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-2">Automated Strategy</h3>
              <p className="text-sm text-slate-600">
                Generate complete implementation roadmaps with real-time progress monitoring
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                Ready to Transform Your AI Adoption?
              </h3>
              <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Start with a comprehensive AI assessment and get personalized recommendations
              </p>
              <Link to={createPageUrl('Assessment')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90">
                  <FileText className="h-5 w-5 mr-2" />
                  Start Assessment Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}