import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from '@/utils';
import { FileText, Plus, Calendar, Building2, Loader2, TrendingUp } from 'lucide-react';
import TrendAnalysis from '../components/dashboard/TrendAnalysis';
import InsightsSummary from '../components/dashboard/InsightsSummary';
import InteractiveFilters from '../components/dashboard/InteractiveFilters';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    status: 'all',
    timeRange: 'all'
  });

  const { data: allAssessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 100),
    initialData: []
  });

  const assessments = useMemo(() => {
    return allAssessments.filter(assessment => {
      // Search filter
      if (filters.search && !assessment.organization_name?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Platform filter
      if (filters.platform !== 'all' && assessment.recommended_platforms?.[0]?.platform_name !== filters.platform) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && assessment.status !== filters.status) {
        return false;
      }

      // Time range filter
      if (filters.timeRange !== 'all') {
        const date = new Date(assessment.assessment_date || assessment.created_date);
        const now = new Date();
        const daysAgo = parseInt(filters.timeRange);
        const cutoff = new Date(now.setDate(now.getDate() - daysAgo));
        if (date < cutoff) return false;
      }

      return true;
    });
  }, [allAssessments, filters]);

  const completedAssessments = allAssessments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Assessment Dashboard</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>View, analyze, and manage all assessments</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('Reports')}>
              <Button variant="outline" style={{ borderColor: 'var(--color-border)' }}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </Link>
            <Link to={createPageUrl('Assessment')}>
              <Button 
                className="text-white"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                  border: 'none'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Assessments</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>{allAssessments.length}</p>
                </div>
                <FileText className="h-10 w-10 opacity-20" style={{ color: 'var(--color-text)' }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Completed</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {allAssessments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10" style={{ color: 'var(--color-teal-500)', opacity: 0.5 }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Draft</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {allAssessments.filter(a => a.status === 'draft').length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-20" style={{ color: 'var(--color-text)' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <InteractiveFilters 
              filters={filters} 
              onFilterChange={setFilters}
              assessments={allAssessments}
            />

            {/* Assessments List */}
            <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--color-text)' }}>
                  Assessments ({assessments.length})
                </CardTitle>
              </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Loading assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No assessments yet</p>
                <Link to={createPageUrl('Assessment')}>
                  <Button className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Assessment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {assessment.organization_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(assessment.assessment_date || assessment.created_date).toLocaleDateString()}
                          </span>
                          <span>
                            {assessment.departments?.length || 0} departments
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={
                          assessment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {assessment.status === 'completed' ? 'Completed' : 'Draft'}
                      </Badge>
                      
                      {assessment.status === 'completed' && (
                        <Link to={createPageUrl('Results') + `?id=${assessment.id}`}>
                          <Button variant="outline" size="sm" className="border-slate-300">
                            View Results
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <TrendAnalysis assessments={completedAssessments} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsSummary assessments={completedAssessments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}