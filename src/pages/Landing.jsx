import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, TrendingUp, Shield, GraduationCap, Sparkles, CheckCircle, ArrowRight, BarChart3, Users, Zap, Lock, Globe, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI Platform Assessment",
      description: "Compare Google Gemini, Microsoft Copilot, Anthropic Claude, and OpenAI ChatGPT with vendor-agnostic analysis"
    },
    {
      icon: Sparkles,
      title: "Automated Strategy",
      description: "Generate comprehensive adoption strategies tailored to your organization's unique needs"
    },
    {
      icon: Shield,
      title: "Risk Monitoring",
      description: "Real-time bias detection, compliance tracking, and proactive risk alerts"
    },
    {
      icon: GraduationCap,
      title: "Personalized Training",
      description: "AI-powered learning paths with role-based modules and skill gap analysis"
    },
    {
      icon: TrendingUp,
      title: "ROI Analytics",
      description: "Predictive financial forecasting and detailed cost-benefit analysis"
    },
    {
      icon: BarChart3,
      title: "Executive Dashboard",
      description: "Real-time insights, KPIs, and customizable reporting for stakeholders"
    }
  ];

  const benefits = [
    "Vendor-agnostic AI platform comparison",
    "Compliance-first approach (GDPR, HIPAA, SOC 2)",
    "Role-based access and permissions",
    "AI governance and bias monitoring",
    "Automated implementation planning",
    "Team collaboration tools"
  ];

  const stats = [
    { value: "4", label: "AI Platforms" },
    { value: "15+", label: "Compliance Standards" },
    { value: "50+", label: "Training Modules" },
    { value: "24/7", label: "Risk Monitoring" }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden sunrise-gradient">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 32px rgba(232, 138, 29, 0.3)'
              }}>
                <Brain className="h-12 w-12" style={{ color: 'var(--color-orange-500)' }} />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Enterprise AI Adoption
              <br />
              <span style={{ color: 'var(--color-cream-50)' }}>Made Strategic</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-10 max-w-3xl mx-auto text-white/90 drop-shadow">
              Compare, assess, and implement the right AI platform for your organization with data-driven insights and automated planning
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to={createPageUrl('Assessment')}>
                <Button size="lg" className="text-lg px-8 py-6 text-white shadow-xl" style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: 'var(--color-orange-600)'
                }}>
                  Start Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('Home')}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 text-white hover:bg-white/10" style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.8)'
                }}>
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-xl backdrop-blur-sm" style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Everything You Need for AI Adoption
            </h2>
            <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
              Comprehensive tools for assessment, planning, and implementation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="sunrise-card border-0 p-6 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ 
                      background: 'linear-gradient(135deg, var(--color-orange-400), var(--color-orange-600))'
                    }}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20" style={{ background: 'var(--color-cream-50)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
                Why Choose INT Inc. AI Platform?
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Our platform provides unbiased, comprehensive analysis to help you make informed decisions about AI adoption across your enterprise.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1" style={{ 
                      background: 'var(--color-orange-500)'
                    }}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg" style={{ color: 'var(--color-text)' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Lock, title: "Secure", desc: "Enterprise-grade security" },
                { icon: Globe, title: "Global", desc: "Multi-region compliance" },
                { icon: Zap, title: "Fast", desc: "Instant assessments" },
                { icon: Award, title: "Proven", desc: "Industry-leading accuracy" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="p-6 rounded-xl text-center" style={{ 
                    background: 'white',
                    border: '2px solid var(--color-orange-200)',
                    transition: 'all 0.3s'
                  }}>
                    <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ 
                      background: 'linear-gradient(135deg, var(--color-orange-300), var(--color-orange-500))'
                    }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            Ready to Transform Your AI Strategy?
          </h2>
          <p className="text-xl mb-10" style={{ color: 'var(--color-text-secondary)' }}>
            Start your comprehensive AI assessment today and get personalized recommendations in minutes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Assessment')}>
              <Button size="lg" className="text-lg px-8 py-6 text-white shadow-xl" style={{ 
                background: 'linear-gradient(135deg, var(--color-orange-500), var(--color-orange-600))'
              }}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Documentation')}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" style={{ 
                borderColor: 'var(--color-orange-500)',
                color: 'var(--color-orange-600)'
              }}>
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: 'var(--color-charcoal-700)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, var(--color-orange-500), var(--color-orange-600))'
              }}>
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">INT Inc. AI Platform</div>
                <div className="text-sm text-white/60">Strategic AI Adoption</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-white/60">
              © 2026 INT Inc. All rights reserved.
            </div>
            
            <div className="flex gap-6">
              <Link to={createPageUrl('Documentation')} className="text-white/60 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to={createPageUrl('Settings')} className="text-white/60 hover:text-white transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}