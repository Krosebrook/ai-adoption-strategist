import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { toast } from 'sonner';
import { predictFutureROI, predictRisksAndCompliance, predictMaturityRoadmap } from '../components/analytics/PredictiveEngine';
import { fetchMarketTrends } from '../components/analytics/MarketTrendsEngine';
import ROIForecastChart from '../components/analytics/ROIForecastChart';
import RiskPredictionPanel from '../components/analytics/RiskPredictionPanel';
import MaturityRoadmapViz from '../components/analytics/MaturityRoadmapViz';

export default function PredictiveAnalytics() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [roiForecast, setRoiForecast] = useState(null);
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [maturityRoadmap, setMaturityRoadmap] = useState(null);
  const [loading, setLoading] = useState({ roi: false, risk: false, maturity: false });
  const [marketTrends, setMarketTrends] = useState(null);

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments-predictive'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-assessment_date', 100)
  });

  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);

  const handlePredictROI = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setLoading({ ...loading, roi: true });
    try {
      // Fetch market trends if not already cached
      let trends = marketTrends;
      if (!trends) {
        toast.info('Fetching real-time market data...');
        trends = await fetchMarketTrends();
        setMarketTrends(trends);
      }
      
      const forecast = await predictFutureROI(selectedAssessment, assessments, trends);
      setRoiForecast(forecast);
      toast.success('ROI forecast generated with market intelligence!');
    } catch (error) {
      console.error('ROI prediction failed:', error);
      toast.error('Failed to generate ROI forecast');
    } finally {
      setLoading({ ...loading, roi: false });
    }
  };

  const handlePredictRisks = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setLoading({ ...loading, risk: true });
    try {
      // Fetch market trends if not already cached
      let trends = marketTrends;
      if (!trends) {
        toast.info('Fetching latest regulatory updates...');
        trends = await fetchMarketTrends();
        setMarketTrends(trends);
      }
      
      const prediction = await predictRisksAndCompliance(selectedAssessment, assessments, trends);
      setRiskPrediction(prediction);
      toast.success('Risk prediction complete with regulatory intelligence!');
    } catch (error) {
      console.error('Risk prediction failed:', error);
      toast.error('Failed to predict risks');
    } finally {
      setLoading({ ...loading, risk: false });
    }
  };

  const handlePredictMaturity = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setLoading({ ...loading, maturity: true });
    try {
      // Fetch market trends if not already cached
      let trends = marketTrends;
      if (!trends) {
        toast.info('Fetching market adoption data...');
        trends = await fetchMarketTrends();
        setMarketTrends(trends);
      }
      
      const roadmap = await predictMaturityRoadmap(selectedAssessment, assessments, trends);
      setMaturityRoadmap(roadmap);
      toast.success('Maturity roadmap generated with market trends!');
    } catch (error) {
      console.error('Maturity prediction failed:', error);
      toast.error('Failed to generate maturity roadmap');
    } finally {
      setLoading({ ...loading, maturity: false });
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Predictive Analytics
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            AI-powered forecasting for ROI, risks, and maturity progression
          </p>
        </div>

        {/* Assessment Selector */}
        <Card className="mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Select Assessment
                </label>
                <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assessment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map(assessment => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.organization_name} - {new Date(assessment.assessment_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="roi" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ROI Forecast
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Prediction
            </TabsTrigger>
            <TabsTrigger value="maturity" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Maturity Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roi">
            {!roiForecast ? (
              <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                <CardContent className="py-12 text-center">
                  {loading.roi ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                      <p style={{ color: 'var(--color-text)' }}>Analyzing historical data and generating forecast...</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        This may take 15-30 seconds
                      </p>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
                      <p className="mb-4" style={{ color: 'var(--color-text)' }}>
                        Generate AI-powered ROI forecast for the next 3 years
                      </p>
                      <Button
                        onClick={handlePredictROI}
                        disabled={!selectedAssessment}
                        className="text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate ROI Forecast
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <ROIForecastChart forecast={roiForecast} />
            )}
          </TabsContent>

          <TabsContent value="risks">
            {!riskPrediction ? (
              <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                <CardContent className="py-12 text-center">
                  {loading.risk ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                      <p style={{ color: 'var(--color-text)' }}>Analyzing risks and compliance landscape...</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        This may take 15-30 seconds
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
                      <p className="mb-4" style={{ color: 'var(--color-text)' }}>
                        Predict future risks and compliance challenges
                      </p>
                      <Button
                        onClick={handlePredictRisks}
                        disabled={!selectedAssessment}
                        className="text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Predict Risks
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <RiskPredictionPanel prediction={riskPrediction} />
            )}
          </TabsContent>

          <TabsContent value="maturity">
            {!maturityRoadmap ? (
              <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
                <CardContent className="py-12 text-center">
                  {loading.maturity ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                      <p style={{ color: 'var(--color-text)' }}>Building maturity progression roadmap...</p>
                      <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        This may take 15-30 seconds
                      </p>
                    </>
                  ) : (
                    <>
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
                      <p className="mb-4" style={{ color: 'var(--color-text)' }}>
                        Generate AI maturity roadmap for the next 3 years
                      </p>
                      <Button
                        onClick={handlePredictMaturity}
                        disabled={!selectedAssessment}
                        className="text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))' }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Maturity Roadmap
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <MaturityRoadmapViz roadmap={maturityRoadmap} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}