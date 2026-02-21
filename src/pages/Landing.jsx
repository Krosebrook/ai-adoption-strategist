import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, TrendingUp, Shield, GraduationCap, Sparkles, CheckCircle, ArrowRight, BarChart3, Users, Zap, Lock, Globe, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const features = [
    {
      icon: Brain,
      title: "AI Platform Assessment",
      description: "Compare 75+ platforms including Claude, ChatGPT, Gemini, Copilot, Mistral, Perplexity, and more with vendor-agnostic analysis"
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
    { value: "75+", label: "AI Platforms" },
    { value: "20+", label: "Compliance Standards" },
    { value: "100+", label: "Training Modules" },
    { value: "24/7", label: "Risk Monitoring" }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #7A8B99 0%, #9A9A8E 10%, #C9B896 25%, #E8C078 40%, #F5A623 55%, #E88A1D 70%, #C4A35A 85%, #D4B896 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.15) 0px, transparent 50%),
            radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%),
            radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.1) 0px, transparent 50%),
            radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.15) 0px, transparent 50%),
            radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.1) 0px, transparent 50%),
            radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.1) 0px, transparent 50%),
            radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.1) 0px, transparent 50%)
          `,
          opacity: 0.5,
          animation: 'gradientShift 15s ease infinite'
        }} />

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, rgba(255,255,255,${0.05 + i * 0.02}) 0%, transparent 70%)`,
                filter: 'blur(40px)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
          transform: `translateY(${scrollY * 0.5}px)`
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            >
              <div className="relative group">
                <div className="absolute inset-0 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" style={{ 
                  background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.6), rgba(232, 138, 29, 0.8))',
                }} />
                <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center" style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}>
                  <Brain className="h-14 w-14 text-white drop-shadow-lg" />
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-6xl lg:text-8xl font-black mb-8" 
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 20%, #FFE5B4 40%, #F5D6AB 60%, #F5A623 80%, #E88A1D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
                lineHeight: '1.1',
                filter: 'drop-shadow(0 4px 24px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 80px rgba(245, 166, 35, 0.3))',
                textShadow: '0 0 40px rgba(255, 255, 255, 0.5)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Enterprise AI Adoption
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #FFE5B4 0%, #F5A623 50%, #E88A1D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Made Strategic
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto font-medium"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.1)',
                lineHeight: '1.6'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Compare 75+ AI platforms across Foundation, Enterprise, Developer, and Specialized categories. Make data-driven decisions with automated planning and compliance analysis.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link to={createPageUrl('Assessment')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="text-lg px-10 py-7 text-white font-semibold relative overflow-hidden group" style={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#E88A1D',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '16px'
                  }}>
                    <span className="relative z-10">Start Assessment</span>
                    <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('Home')}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="text-lg px-10 py-7 border-2 text-white font-semibold backdrop-blur-md" style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    borderRadius: '16px'
                  }}>
                    View Dashboard
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center p-8 rounded-2xl backdrop-blur-md relative group overflow-hidden" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    background: 'rgba(255, 255, 255, 0.15)'
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-5xl font-black text-white mb-3 relative" style={{
                    textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)'
                  }}>{stat.value}</div>
                  <div className="text-sm font-medium relative" style={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    letterSpacing: '0.05em'
                  }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 p-8 relative overflow-hidden group" style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 24px rgba(232, 138, 29, 0.08)',
                    borderRadius: '24px',
                    border: '1px solid rgba(232, 138, 29, 0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <CardContent className="p-0 relative z-10">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative" 
                        style={{ 
                          background: 'linear-gradient(135deg, #F5A623, #E88A1D)',
                          boxShadow: '0 8px 24px rgba(232, 138, 29, 0.25)'
                        }}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                        {feature.title}
                      </h3>
                      <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
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
                  <motion.div 
                    key={index} 
                    className="p-8 rounded-2xl text-center relative overflow-hidden group" 
                    style={{ 
                      background: 'white',
                      border: '1px solid rgba(232, 138, 29, 0.2)',
                      boxShadow: '0 4px 20px rgba(232, 138, 29, 0.08)',
                    }}
                    whileHover={{ 
                      y: -8, 
                      boxShadow: '0 20px 40px rgba(232, 138, 29, 0.15)',
                      borderColor: 'rgba(232, 138, 29, 0.4)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div 
                      className="w-14 h-14 rounded-xl mx-auto mb-5 flex items-center justify-center relative" 
                      style={{ 
                        background: 'linear-gradient(135deg, #F5A623, #E88A1D)',
                        boxShadow: '0 8px 20px rgba(232, 138, 29, 0.3)'
                      }}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h4 className="font-bold text-lg mb-2 relative" style={{ color: 'var(--color-text)' }}>{item.title}</h4>
                    <p className="text-sm relative" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                  </motion.div>
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