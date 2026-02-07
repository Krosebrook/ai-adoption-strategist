import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Loader2, Download, Globe } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function GroundedReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState('executive');
  const [includeExternalData, setIncludeExternalData] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.AdoptionStrategy.list()
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.Assessment.list()
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateGroundedReport', {
        reportType,
        strategyId: selectedStrategy || undefined,
        assessmentId: selectedAssessment || undefined,
        includeExternalData
      });
      
      if (response.data?.success) {
        setReport(response.data.report);
        toast.success('Report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      toast.error('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            AI-Grounded Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="executive">Executive Summary</option>
                <option value="compliance">Compliance Report</option>
                <option value="risk">Risk Analysis</option>
                <option value="performance">Performance Report</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Strategy (Optional)</label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Strategies</option>
                {strategies.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.organization_name} - {s.platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assessment (Optional)</label>
              <select
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Assessments</option>
                {assessments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.organization_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={includeExternalData}
                onCheckedChange={setIncludeExternalData}
                id="external-data"
              />
              <label htmlFor="external-data" className="text-sm flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4 text-blue-600" />
                Include Current Best Practices & Market Data
              </label>
            </div>
          </div>

          <Button onClick={generateReport} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{report.title}</CardTitle>
              <Badge className="bg-green-100 text-green-800">
                {includeExternalData ? 'Grounded with External Data' : 'Internal Data Only'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
              <ReactMarkdown className="prose prose-sm max-w-none">
                {report.executive_summary}
              </ReactMarkdown>
            </div>

            {report.key_findings && report.key_findings.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Key Findings</h3>
                <div className="space-y-3">
                  {report.key_findings.map((finding, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium">{finding.finding}</span>
                        <Badge variant="outline">{finding.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{finding.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.recommendations && report.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
                <div className="space-y-3">
                  {report.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="font-medium mb-1">{rec.recommendation}</div>
                      <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                      <div className="text-xs text-gray-500">Timeline: {rec.timeline}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}