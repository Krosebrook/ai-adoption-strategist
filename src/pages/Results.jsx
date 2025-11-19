import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Share2, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import RecommendationCard from '../components/results/RecommendationCard';
import ROIChart from '../components/results/ROIChart';
import ComplianceMatrix from '../components/results/ComplianceMatrix';
import IntegrationMatrix from '../components/results/IntegrationMatrix';

export default function Results() {
  const [assessmentId, setAssessmentId] = useState(null);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Assessment not found</p>
        </div>
      </div>
    );
  }

  const roiData = Object.values(assessment.roi_calculations || {});
  const recommendations = assessment.recommended_platforms || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Results</h1>
            <p className="text-slate-600">{assessment.organization_name}</p>
            <p className="text-sm text-slate-500">
              Completed on {new Date(assessment.assessment_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-300">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" className="border-slate-300">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Platform Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.slice(0, 4).map((rec, index) => (
              <RecommendationCard key={rec.platform} recommendation={rec} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
          </TabsList>

          <TabsContent value="executive">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{assessment.executive_summary}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi">
            <div className="space-y-6">
              <ROIChart roiData={roiData} />
              
              {roiData.map((roi) => (
                <Card key={roi.platform} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900 capitalize">
                      {roi.platform.replace(/_/g, ' ')} - ROI Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Total Annual Savings</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ${roi.total_annual_savings.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">1-Year ROI</div>
                        <div className="text-2xl font-bold text-green-900">
                          {roi.one_year_roi.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">3-Year ROI</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {roi.three_year_roi.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Platform Cost</div>
                        <div className="text-2xl font-bold text-slate-900">
                          ${roi.total_cost.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-3 text-slate-700 font-semibold">Department</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Users</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Hours Saved</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Annual Savings</th>
                            <th className="text-right py-2 px-3 text-slate-700 font-semibold">Net Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roi.department_breakdown?.map((dept, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 px-3 text-slate-700 font-medium">{dept.department}</td>
                              <td className="text-right py-2 px-3 text-slate-600">{dept.user_count}</td>
                              <td className="text-right py-2 px-3 text-slate-600">
                                {dept.annual_hours_saved.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-3 text-slate-600">
                                ${dept.annual_savings.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-3 font-medium text-slate-900">
                                ${dept.net_savings.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceMatrix
              complianceData={assessment.compliance_scores}
              requirements={assessment.compliance_requirements}
            />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationMatrix
              integrationData={assessment.integration_scores}
              integrations={assessment.desired_integrations}
            />
          </TabsContent>

          <TabsContent value="details">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Complete Assessment Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-96 text-slate-700">
                  {JSON.stringify(assessment, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}