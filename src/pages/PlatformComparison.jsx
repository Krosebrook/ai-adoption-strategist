import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitCompare, Sparkles, DollarSign } from 'lucide-react';
import { BrandCard, BrandCardContent, BrandCardHeader, BrandCardTitle } from '../components/ui/BrandCard';
import { LoadingPage } from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import SideBySideComparison from '../components/comparison/SideBySideComparison';
import CostEstimationTool from '../components/comparison/CostEstimationTool';
import FavoritePlatforms from '../components/comparison/FavoritePlatforms';

export default function PlatformComparison() {
  const [assessmentId, setAssessmentId] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setAssessmentId(id);
  }, []);

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const assessments = await base44.entities.Assessment.filter({ id: assessmentId });
      return assessments[0];
    },
    enabled: !!assessmentId
  });

  const { data: allAssessments } = useQuery({
    queryKey: ['assessments-completed'],
    queryFn: () => base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50),
    initialData: []
  });

  useEffect(() => {
    if (assessment?.recommended_platforms) {
      // Auto-select top 3 platforms for comparison
      const top3 = assessment.recommended_platforms.slice(0, 3).map(p => p.platform_name);
      setSelectedPlatforms(top3);
    }
  }, [assessment]);

  if (isLoading && assessmentId) {
    return <LoadingPage message="Loading comparison data..." />;
  }

  if (!assessment && assessmentId) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <EmptyState
            icon={GitCompare}
            title="Assessment not found"
            description="Please select a valid assessment to compare platforms"
          />
        </div>
      </div>
    );
  }

  // If no assessment selected, show assessment selector
  if (!assessment) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Platform Comparison
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Select an assessment to compare AI platforms side-by-side
            </p>
          </div>

          <BrandCard>
            <BrandCardHeader>
              <BrandCardTitle>Select Assessment</BrandCardTitle>
            </BrandCardHeader>
            <BrandCardContent>
              {allAssessments.length === 0 ? (
                <EmptyState
                  icon={GitCompare}
                  title="No completed assessments"
                  description="Complete an assessment first to compare platforms"
                />
              ) : (
                <div className="space-y-3">
                  {allAssessments.map(a => (
                    <a
                      key={a.id}
                      href={`?id=${a.id}`}
                      className="block p-4 border rounded-lg hover:shadow-md transition-all"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        {a.organization_name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {a.recommended_platforms?.length || 0} platforms evaluated
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </BrandCardContent>
          </BrandCard>
        </div>
      </div>
    );
  }

  const availablePlatforms = assessment.recommended_platforms?.map(p => p.platform_name) || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Platform Comparison
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {assessment.organization_name} - Comparing {selectedPlatforms.length} platforms
          </p>
        </div>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList>
            <TabsTrigger value="comparison">
              <GitCompare className="h-4 w-4 mr-2" />
              Side-by-Side
            </TabsTrigger>
            <TabsTrigger value="cost">
              <DollarSign className="h-4 w-4 mr-2" />
              Cost Estimator
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Sparkles className="h-4 w-4 mr-2" />
              My Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <SideBySideComparison
              assessment={assessment}
              selectedPlatforms={selectedPlatforms}
              availablePlatforms={availablePlatforms}
              onPlatformSelectionChange={setSelectedPlatforms}
            />
          </TabsContent>

          <TabsContent value="cost">
            <CostEstimationTool
              assessment={assessment}
              platforms={availablePlatforms}
            />
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritePlatforms assessmentId={assessment.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}