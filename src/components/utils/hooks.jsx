import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { generatePlatformInsights, generateImplementationRoadmap } from '../assessment/AIEnhancer';
import { generateEnhancedRoadmap } from '../assessment/EnhancedRoadmapGenerator';
import { fetchMarketTrends } from '../analytics/MarketTrendsEngine';
import { toast } from 'sonner';

/**
 * Loads AI-generated platform insights and an implementation roadmap
 * for a given platform + assessment combination.
 *
 * Guards against duplicate in-flight calls via the `loading` flag.
 */
export function useAIInsights() {
  const [insights, setInsights] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInsights = useCallback(async (
    platform,
    assessment,
    roiData,
    complianceScores,
    integrationScores,
    useEnhanced = true
  ) => {
    if (!platform || loading || insights) return;

    setLoading(true);
    setError(null);

    try {
      let marketTrends = null;
      if (useEnhanced) {
        try {
          toast.info('Fetching market intelligence for optimized roadmap...');
          marketTrends = await fetchMarketTrends();
        } catch {
          console.warn('Market trends unavailable — falling back to basic roadmap.');
        }
      }

      const [platformInsights, implementationRoadmap] = await Promise.all([
        generatePlatformInsights(platform, assessment, roiData, complianceScores, integrationScores),
        useEnhanced && marketTrends
          ? generateEnhancedRoadmap(platform, assessment, marketTrends)
          : generateImplementationRoadmap(platform, assessment)
      ]);

      setInsights(platformInsights);
      setRoadmap(implementationRoadmap);

      if (useEnhanced && marketTrends) {
        toast.success('Enhanced roadmap generated with market intelligence!');
      }
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

/**
 * Client-side filtering for a list of assessments.
 * Supports free-text search, platform filter, status filter, and time range.
 */
export function useAssessmentFilters(assessments) {
  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    status: 'all',
    timeRange: 'all'
  });

  const filteredAssessments = useMemo(() => {
    return (assessments || []).filter(assessment => {
      // Free-text search on org name
      if (
        filters.search &&
        !assessment.organization_name?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Top-recommended platform filter
      if (
        filters.platform !== 'all' &&
        assessment.recommended_platforms?.[0]?.platform_name !== filters.platform
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && assessment.status !== filters.status) {
        return false;
      }

      // Time-range filter (value is days, e.g. '30', '90', '180', '365')
      if (filters.timeRange !== 'all') {
        const days = parseInt(filters.timeRange, 10);
        if (!isNaN(days)) {
          const date = new Date(assessment.assessment_date || assessment.created_date);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          if (date < cutoff) return false;
        }
      }

      return true;
    });
  }, [assessments, filters]);

  return { filters, setFilters, filteredAssessments };
}

/**
 * Fetches assessments from the database with optional status filter.
 * Uses TanStack Query for caching and background refetching.
 *
 * @param {string|null} status - Filter by status ('draft' | 'completed' | null for all)
 * @param {number} limit - Maximum records to return
 */
export function useAssessments(status = null, limit = 100) {
  return useQuery({
    queryKey: ['assessments', status, limit],
    queryFn: () =>
      status
        ? base44.entities.Assessment.filter({ status }, '-created_date', limit)
        : base44.entities.Assessment.list('-created_date', limit),
    staleTime: 2 * 60 * 1000,
    initialData: []
  });
}

/**
 * Fetches the current user and their persisted UserSettings record.
 * Keeps the query key stable by resolving the user email inside queryFn.
 */
export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      const results = await base44.entities.UserSettings.filter({ user_email: currentUser.email });
      return { user: currentUser, settings: results[0] || null };
    },
    staleTime: 5 * 60 * 1000
  });
}