import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from '@/utils';
import { FileText, Plus, Calendar, Building2, Loader2, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list('-created_date', 50),
    initialData: []
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Dashboard</h1>
            <p className="text-slate-600">View and manage all your AI platform assessments</p>
          </div>
          <Link to={createPageUrl('Assessment')}>
            <Button className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Assessments</p>
                  <p className="text-3xl font-bold text-slate-900">{assessments.length}</p>
                </div>
                <FileText className="h-10 w-10 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {assessments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Draft</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {assessments.filter(a => a.status === 'draft').length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Assessments</CardTitle>
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
      </div>
    </div>
  );
}