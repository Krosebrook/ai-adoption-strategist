import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertCircle, CheckCircle, FileText, Loader2, Sparkles, Download } from 'lucide-react';
import { analyzeCompliance, generateComplianceReport } from './ComplianceAnalysisEngine';
import ComplianceReportViewer from './ComplianceReportViewer';
import { toast } from 'sonner';

export default function ComplianceAnalysisPanel({ assessment }) {
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const regulations = assessment.compliance_requirements || [];

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analyzeCompliance(assessment);
      setAnalysis(result);
      toast.success('Compliance analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze compliance');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedRegulation || !analysis) return;
    
    setLoadingReport(true);
    try {
      const result = await generateComplianceReport(assessment, analysis, selectedRegulation);
      setReport(result);
      toast.success(`${selectedRegulation} report generated!`);
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoadingReport(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  if (report) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setReport(null)}>
            ← Back to Analysis
          </Button>
        </div>
        <ComplianceReportViewer report={report} regulationName={selectedRegulation} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                <Shield className="h-6 w-6 text-blue-600" />
                AI Compliance Analysis
              </CardTitle>
              <p className="text-sm text-slate-600">
                Automated compliance checking for {regulations.length} regulation{regulations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loadingAnalysis || regulations.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingAnalysis ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loadingAnalysis && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-700 mb-2">Analyzing compliance requirements...</p>
            <p className="text-sm text-slate-500">Cross-referencing with {regulations.join(', ')}</p>
          </CardContent>
        </Card>
      )}

      {analysis && !loadingAnalysis && (
        <>
          {/* Overall Status */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Overall Score</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {analysis.overall_compliance_score}/100
                  </div>
                </div>
                <div className={`border rounded-lg p-4 ${
                  analysis.compliance_status === 'compliant' ? 'bg-green-50 border-green-200' :
                  analysis.compliance_status === 'partially_compliant' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="text-sm mb-1" style={{
                    color: analysis.compliance_status === 'compliant' ? 'rgb(22 101 52)' :
                           analysis.compliance_status === 'partially_compliant' ? 'rgb(133 77 14)' :
                           'rgb(153 27 27)'
                  }}>
                    Status
                  </div>
                  <div className="text-lg font-semibold" style={{
                    color: analysis.compliance_status === 'compliant' ? 'rgb(20 83 45)' :
                           analysis.compliance_status === 'partially_compliant' ? 'rgb(120 53 15)' :
                           'rgb(127 29 29)'
                  }}>
                    {analysis.compliance_status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className={`border rounded-lg p-4 ${
                  analysis.audit_readiness?.current_readiness === 'ready' ? 'bg-green-50 border-green-200' :
                  analysis.audit_readiness?.current_readiness === 'partially_ready' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="text-sm text-slate-600 mb-1">Audit Readiness</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {analysis.audit_readiness?.current_readiness?.replace(/_/g, ' ') || 'Unknown'}
                  </div>
                  {analysis.audit_readiness?.estimated_time_to_ready && (
                    <div className="text-xs text-slate-600 mt-1">
                      {analysis.audit_readiness.estimated_time_to_ready}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="regulations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="regulations">Regulations</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="gaps">Gaps</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="regulations">
              <div className="space-y-4">
                {analysis.regulation_analysis?.map((reg, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{reg.regulation}</CardTitle>
                        <Badge className={
                          reg.compliance_level === 'full' ? 'bg-green-600 text-white' :
                          reg.compliance_level === 'partial' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }>
                          {reg.compliance_level} compliance
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Coverage</span>
                          <span className="text-sm font-bold">{reg.coverage_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              reg.coverage_percentage >= 80 ? 'bg-green-600' :
                              reg.coverage_percentage >= 50 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${reg.coverage_percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Met Requirements
                          </h5>
                          <ul className="space-y-1">
                            {reg.met_requirements?.slice(0, 5).map((req, i) => (
                              <li key={i} className="text-sm text-slate-700">• {req}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Unmet Requirements
                          </h5>
                          <ul className="space-y-1">
                            {reg.unmet_requirements?.slice(0, 5).map((req, i) => (
                              <li key={i} className="text-sm text-slate-700">• {req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risks">
              <div className="space-y-3">
                {analysis.identified_risks?.map((risk, idx) => (
                  <Card key={idx} className={`border-l-4 ${
                    risk.severity === 'critical' ? 'border-l-red-600' :
                    risk.severity === 'high' ? 'border-l-orange-600' :
                    risk.severity === 'medium' ? 'border-l-yellow-600' :
                    'border-l-blue-600'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-slate-900">{risk.risk_type}</h5>
                          <p className="text-sm text-slate-600">{risk.regulation}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                          <Badge variant="outline">{risk.likelihood} likelihood</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{risk.description}</p>
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 mb-3">
                        <p className="text-sm text-slate-700">
                          <strong>Impact:</strong> {risk.potential_impact}
                        </p>
                      </div>
                      <div>
                        <h6 className="text-sm font-semibold text-slate-900 mb-2">Mitigation Steps:</h6>
                        <ol className="space-y-2">
                          {risk.mitigation_steps?.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-sm bg-white border border-slate-200 rounded p-2">
                              <div className="flex items-start justify-between">
                                <span className="text-slate-700">{step.step}</span>
                                <div className="flex gap-1">
                                  <Badge variant="outline" className="text-xs">{step.priority}</Badge>
                                  <Badge variant="outline" className="text-xs">{step.effort}</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Timeline: {step.timeline}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaps">
              <div className="space-y-3">
                {analysis.compliance_gaps?.map((gap, idx) => (
                  <Card key={idx} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{gap.gap_area}</h5>
                        <Badge className={getSeverityColor(gap.priority)}>
                          {gap.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{gap.regulation}</p>
                      <p className="text-sm text-slate-700 mb-3">{gap.description}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <h6 className="text-sm font-semibold text-blue-900 mb-1">Remediation Plan</h6>
                        <p className="text-sm text-blue-800">{gap.remediation_plan}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-blue-700">
                          <div>Effort: {gap.estimated_effort}</div>
                          {gap.dependencies && gap.dependencies.length > 0 && (
                            <div>Dependencies: {gap.dependencies.length}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="platforms">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.platform_compliance_ratings?.map((platform, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{platform.platform}</CardTitle>
                        <Badge className="bg-blue-600 text-white">
                          {platform.overall_rating}/10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {platform.certifications && platform.certifications.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-sm font-semibold text-slate-900 mb-2">Certifications</h6>
                          <div className="flex flex-wrap gap-1">
                            {platform.certifications.map((cert, certIdx) => (
                              <Badge key={certIdx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <h6 className="font-semibold text-green-900 mb-1">Strengths</h6>
                          <ul className="space-y-1">
                            {platform.strengths?.slice(0, 3).map((s, sIdx) => (
                              <li key={sIdx} className="text-slate-700 text-xs">• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-orange-900 mb-1">Weaknesses</h6>
                          <ul className="space-y-1">
                            {platform.weaknesses?.slice(0, 3).map((w, wIdx) => (
                              <li key={wIdx} className="text-slate-700 text-xs">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Immediate Actions Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.immediate_actions?.map((action, idx) => (
                      <div key={idx} className={`border-l-4 rounded-r-lg p-3 ${
                        action.urgency === 'immediate' ? 'border-l-red-600 bg-red-50' :
                        action.urgency === 'within_30_days' ? 'border-l-orange-600 bg-orange-50' :
                        'border-l-yellow-600 bg-yellow-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-semibold text-slate-900">{action.action}</h6>
                          <Badge className={
                            action.urgency === 'immediate' ? 'bg-red-600 text-white' :
                            action.urgency === 'within_30_days' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {action.urgency.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-700 space-y-1">
                          <p><strong>Responsible:</strong> {action.responsible_party}</p>
                          <p><strong>Success Criteria:</strong> {action.success_criteria}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {analysis.long_term_recommendations && analysis.long_term_recommendations.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h5 className="font-semibold text-slate-900 mb-3">Long-term Recommendations</h5>
                      <ul className="space-y-2">
                        {analysis.long_term_recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Compliance Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Generate formal compliance reports tailored for specific regulatory bodies
                  </p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select regulation" />
                      </SelectTrigger>
                      <SelectContent>
                        {regulations.map(reg => (
                          <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={handleGenerateReport}
                      disabled={!selectedRegulation || loadingReport}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loadingReport ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h6 className="text-sm font-semibold text-blue-900 mb-2">Available Report Types:</h6>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {regulations.map(reg => (
                        <li key={reg}>• {reg} Compliance Assessment Report</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}