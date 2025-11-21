import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Sparkles, Loader2, BarChart3, Globe } from 'lucide-react';
import { BrandCard, BrandCardContent } from '../components/ui/BrandCard';
import { analyzeTrends } from '../components/trends/AITrendAnalyzer';
import { ReadinessTrendChart, ComplianceTrendChart, MaturityDistributionChart } from '../components/trends/TrendCharts';
import { fetchMarketTrends, analyzeMarketImpact } from '../components/analytics/MarketTrendsEngine';
import MarketTrendsPanel from '../components/trends/MarketTrendsPanel';
import { toast } from 'sonner';

export default function Trends() {
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [marketTrends, setMarketTrends] = useState(null);
  const [marketImpact, setMarketImpact] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['assessments-trends'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-assessment_date', 100)
  });

  const handleAnalyzeTrends = async () => {
    if (assessments.length === 0) return;
    
    setLoading(true);
    try {
      const analysis = await analyzeTrends(assessments);
      setTrendAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMarketTrends = async () => {
    setLoadingMarket(true);
    try {
      const trends = await fetchMarketTrends();
      setMarketTrends(trends);
      toast.success('Market trends updated with real-time data!');
      
      // If assessment selected, analyze market impact
      if (selectedAssessmentId) {
        const assessment = assessments.find(a => a.id === selectedAssessmentId);
        if (assessment) {
          const impact = await analyzeMarketImpact(assessment, trends);
          setMarketImpact(impact);
        }
      }
    } catch (error) {
      console.error('Failed to fetch market trends:', error);
      toast.error('Failed to fetch market trends');
    } finally {
      setLoadingMarket(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
        <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            AI Adoption Trends & Market Intelligence
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Analyze historical trends and real-time market data across {assessments.length} assessments
          </p>
        </div>

        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analysis">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3 className="h-4 w-4 mr-2" />
              Data Visualizations
            </TabsTrigger>
            <TabsTrigger value="market" onClick={!marketTrends ? handleFetchMarketTrends : undefined}>
              <Globe className="h-4 w-4 mr-2" />
              Market Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            {!trendAnalysis ? (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  {loading ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                      <p style={{ color: 'var(--color-text)' }}>Analyzing trends...</p>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
                      <p className="mb-4" style={{ color: 'var(--color-text)' }}>
                        Generate AI-powered trend analysis
                      </p>
                      <Button
                        onClick={handleAnalyzeTrends}
                        disabled={assessments.length === 0}
                        className="text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Trends
                      </Button>
                    </>
                  )}
                </BrandCardContent>
              </BrandCard>
            ) : (
              <div className="prose max-w-none" style={{ color: 'var(--color-text)' }}>
                <pre className="bg-slate-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(trendAnalysis, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReadinessTrendChart assessments={assessments} />
                <ComplianceTrendChart assessments={assessments} />
              </div>
              <MaturityDistributionChart assessments={assessments} />
            </div>
          </TabsContent>

          <TabsContent value="market">
            {loadingMarket ? (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                  <p style={{ color: 'var(--color-text)' }}>Fetching real-time market intelligence...</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Analyzing AI model releases, adoption trends, and regulatory changes
                  </p>
                </BrandCardContent>
              </BrandCard>
            ) : marketTrends ? (
              <>
                {assessments.length > 0 && !selectedAssessmentId && (
                  <BrandCard className="mb-6">
                    <BrandCardContent className="pt-6">
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text)' }}>
                        Select an assessment to see personalized market impact analysis:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {assessments.slice(0, 5).map(a => (
                          <Button
                            key={a.id}
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setSelectedAssessmentId(a.id);
                              const impact = await analyzeMarketImpact(a, marketTrends);
                              setMarketImpact(impact);
                            }}
                          >
                            {a.organization_name}
                          </Button>
                        ))}
                      </div>
                    </BrandCardContent>
                  </BrandCard>
                )}
                <MarketTrendsPanel trends={marketTrends} marketImpact={marketImpact} />
              </>
            ) : (
              <BrandCard>
                <BrandCardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
                  <p className="mb-4" style={{ color: 'var(--color-text)' }}>
                    Fetch real-time market intelligence to enhance forecast accuracy
                  </p>
                  <Button
                    onClick={handleFetchMarketTrends}
                    className="text-white"
                    style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Fetch Market Trends
                  </Button>
                </BrandCardContent>
              </BrandCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}