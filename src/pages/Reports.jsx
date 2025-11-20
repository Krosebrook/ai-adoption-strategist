import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Loader2, Sparkles, Settings, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ReportPreview from '../components/reports/ReportPreview';
import { 
  generateExecutiveReport, 
  generateTechnicalReport, 
  generateFinancialReport 
} from '../components/reports/ReportGenerator';
import { generateCustomReport } from '../components/reports/CustomReportGenerator';
import EnhancedReportGenerator from '../components/reports/EnhancedReportGenerator';
import ScheduleReportModal from '../components/reports/ScheduleReportModal';
import ScheduledReportsList from '../components/reports/ScheduledReportsList';

export default function Reports() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [reportType, setReportType] = useState('ai-generated');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      return await base44.entities.Assessment.filter({ status: 'completed' }, '-created_date', 50);
    }
  });

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: () => base44.entities.ReportTemplate.list('-created_date'),
    initialData: []
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
      
      if (reportType === 'custom' && selectedTemplate) {
        const template = customTemplates.find(t => t.id === selectedTemplate);
        if (!template) throw new Error('Template not found');
        report = await generateCustomReport(template, selectedAssessment);
      } else {
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

  const handleReportGenerated = (report, type) => {
    setGeneratedReport(report);
    setReportType(type);
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>AI Report Generator</h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Generate and schedule comprehensive reports with AI-powered insights
            </p>
          </div>
          <Link to={createPageUrl('TemplateBuilder')}>
            <Button variant="outline" style={{ borderColor: 'var(--color-border)' }}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
          </Link>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Reports
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Clock className="h-4 w-4 mr-2" />
              Scheduled Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
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
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ai-generated">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </TabsTrigger>
                  <TabsTrigger value="executive">Executive</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="ai-generated" className="mt-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>AI-Powered Report Generation</strong> - Select your preferred format and let AI generate comprehensive reports with narratives, charts, and actionable recommendations.
                    </p>
                    <ul className="text-xs space-y-1 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>Executive summaries with strategic insights</li>
                      <li>Technical deep-dives with implementation details</li>
                      <li>Financial analyses with ROI projections</li>
                      <li>Comprehensive reports combining all perspectives</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="executive" className="mt-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      High-level summary for C-suite executives with strategic recommendations
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="technical" className="mt-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Detailed technical specifications and implementation guide for IT teams
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="mt-3">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Comprehensive financial analysis and ROI comparison for CFO/Finance
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="mt-3">
                  <div className="space-y-3">
                    {customTemplates.length > 0 ? (
                      <>
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Generate reports using your custom templates with AI-enhanced sections
                          </p>
                        </div>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {customTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.sections?.length || 0} sections)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                          No custom templates available. Create one to get started!
                        </p>
                        <Link to={createPageUrl('TemplateBuilder')}>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-2" />
                            Create Template
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-3">
              {reportType === 'ai-generated' ? null : (
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedAssessment || generating || (reportType === 'custom' && !selectedTemplate)}
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
              )}
              {generatedReport && (
                <>
                  <Button
                    onClick={() => setScheduleModalOpen(true)}
                    variant="outline"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Report Section */}
        {reportType === 'ai-generated' && selectedAssessment && (
          <EnhancedReportGenerator 
            assessment={selectedAssessment}
            onReportGenerated={handleReportGenerated}
          />
        )}

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
          <ReportPreview 
            report={generatedReport} 
            reportType={reportType}
            assessmentId={selectedAssessment?.id}
          />
        )}

        {!selectedAssessment && !generating && reportType !== 'ai-generated' && (
          <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-text)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Select an assessment and report type to generate a comprehensive AI-powered report
              </p>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledReportsList />
          </TabsContent>
        </Tabs>

        {/* Schedule Modal */}
        {selectedAssessment && (
          <ScheduleReportModal
            isOpen={scheduleModalOpen}
            onClose={() => setScheduleModalOpen(false)}
            assessment={selectedAssessment}
            reportType={reportType}
          />
        )}
      </div>
    </div>
  );
}