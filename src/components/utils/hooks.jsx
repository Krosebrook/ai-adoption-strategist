import { useState, useCallback, useMemo } from 'react';
import { generatePlatformInsights, generateImplementationRoadmap } from '../assessment/AIEnhancer';
import { toast } from 'sonner';

// AI Insights Hook
export function useAIInsights() {
  const [insights, setInsights] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInsights = useCallback(async (platform, assessment, roiData, complianceScores, integrationScores) => {
    if (!platform || loading || insights) return;

    setLoading(true);
    setError(null);

    try {
      const [platformInsights, implementationRoadmap] = await Promise.all([
        generatePlatformInsights(platform, assessment, roiData, complianceScores, integrationScores),
        generateImplementationRoadmap(platform, assessment)
      ]);

      setInsights(platformInsights);
      setRoadmap(implementationRoadmap);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError(err.message);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoading(false);
    }
  }, [loading, insights]);

  const reset = useCallback(() => {
    setInsights(null);
    setRoadmap(null);
    setError(null);
    setLoading(false);
  }, []);

  return { insights, roadmap, loading, error, loadInsights, reset };
}

// Assessment Filters Hook
export function useAssessmentFilters(assessments) {
  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    status: 'all',
    timeRange: 'all'
  });

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      if (filters.search && !assessment.organization_name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.platform !== 'all' && assessment.recommended_platforms?.[0]?.platform_name !== filters.platform) {
        return false;
      }
      if (filters.status !== 'all' && assessment.status !== filters.status) {
        return false;
      }
      if (filters.timeRange !== 'all') {
        const date = new Date(assessment.assessment_date || assessment.created_date);
        const now = new Date();
        const daysAgo = parseInt(filters.timeRange);
        const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
        if (date < cutoff) return false;
      }
      return true;
    });
  }, [assessments, filters]);

  return { filters, setFilters, filteredAssessments };
}