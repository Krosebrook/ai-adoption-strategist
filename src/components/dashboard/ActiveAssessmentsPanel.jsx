import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, AlertCircle, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDate } from '../utils/formatters';

export default function ActiveAssessmentsPanel({ assessments, tasks }) {
  const activeAssessments = assessments.filter(a => a.status !== 'completed');
  const completedAssessments = assessments.filter(a => a.status === 'completed');

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft': return <Clock className="h-4 w-4 text-amber-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{activeAssessments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedAssessments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-600">{tasks?.length || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Assessments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Active Assessments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAssessments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No active assessments</p>
              <Link to={createPageUrl('Assessment')}>
                <Button className="mt-4">
                  Start New Assessment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAssessments.slice(0, 5).map(assessment => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(assessment.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{assessment.organization_name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(assessment.created_date)}
                        </span>
                        <Badge variant="outline" className={getStatusColor(assessment.status)}>
                          {assessment.status}
                        </Badge>
                      </div>
                      {assessment.recommended_platforms?.[0] && (
                        <p className="text-xs text-slate-600 mt-1">
                          Top platform: {assessment.recommended_platforms[0].platform_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link to={createPageUrl('Results', { id: assessment.id })}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
              {activeAssessments.length > 5 && (
                <Link to={createPageUrl('Assessment')}>
                  <Button variant="outline" className="w-full">
                    View All {activeAssessments.length} Assessments
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}