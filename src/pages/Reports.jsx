import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Loader2, Sparkles, Settings } from 'lucide-react';
import { toast } from 'sonner';
import ReportPreview from '../components/reports/ReportPreview';
import { 
  generateExecutiveReport, 
  generateTechnicalReport, 
  generateFinancialReport 
} from '../components/reports/ReportGenerator';

export default function Reports() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [reportType, setReportType] = useState('executive');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      return await base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50);
    }
  });

  const handleGenerateReport = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    setGenerating(true);
    setGeneratedReport(null);

    try {
      let report;
      switch (reportType) {
        case 'executive':
          report = await generateExecutiveReport(selectedAssessment);
          break;
        case 'technical':
          report = await generateTechnicalReport(selectedAssessment);
          break;
        case 'financial':
          report = await generateFinancialReport(selectedAssessment);
          break;
        default:
          report = await generateExecutiveReport(selectedAssessment);
      }

      setGeneratedReport(report);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const content = JSON.stringify(generatedReport, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${selectedAssessment.organization_name}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('Report downloaded!');
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>AI Report Generator</h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Generate comprehensive reports with AI-powered insights
          </p>
        </div>

        {/* Configuration */}
        <Card className="mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-text)' }}>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Select Assessment
              </label>
              <Select
                value={selectedAssessment?.id}
                onValueChange={(value) => {
                  const assessment = assessments?.find(a => a.id === value);
                  setSelectedAssessment(assessment);
                  setGeneratedReport(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assessment..." />
                </SelectTrigger>
                <SelectContent>
                  {assessments?.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.organization_name} - {new Date(assessment.assessment_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Report Type
              </label>
              <Tabs value={reportType} onValueChange={setReportType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="executive">Executive</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {reportType === 'executive' && 'High-level summary for C-suite executives with strategic recommendations'}
                  {reportType === 'technical' && 'Detailed technical specifications and implementation guide for IT teams'}
                  {reportType === 'financial' && 'Comprehensive financial analysis and ROI comparison for CFO/Finance'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedAssessment || generating}
                className="text-white flex-1"
                style={{ 
                  background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-teal-600))',
                  border: 'none'
                }}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              {generatedReport && (
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        {generating && (
          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
              <p style={{ color: 'var(--color-text)' }}>AI is generating your {reportType} report...</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                This may take 15-30 seconds
              </p>
            </CardContent>
          </Card>
        )}

        {generatedReport && !generating && (
          <ReportPreview report={generatedReport} reportType={reportType} />
        )}

        {!selectedAssessment && !generating && (
          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Select an assessment and report type to generate a comprehensive AI-powered report
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}