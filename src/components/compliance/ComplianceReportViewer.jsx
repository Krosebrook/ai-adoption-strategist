import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, FileText, Download, Shield, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ComplianceReportViewer({ report, regulationName }) {
  const [activeSection, setActiveSection] = useState('summary');

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'met': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partially_met': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'not_met': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleDownloadReport = () => {
    const reportText = `
${report.report_metadata?.report_title || 'Compliance Report'}
Generated: ${report.report_metadata?.report_date || new Date().toISOString()}
Organization: ${report.report_metadata?.organization}
Regulation: ${report.report_metadata?.regulation}

EXECUTIVE SUMMARY
${report.executive_summary}

SCOPE AND METHODOLOGY
${report.scope_and_methodology}

COMPLIANCE STATUS
Overall Assessment: ${report.compliance_status?.overall_assessment}
Compliance Percentage: ${report.compliance_status?.compliance_percentage}%
Certification Status: ${report.compliance_status?.certification_status}

Key Findings:
${report.compliance_status?.key_findings?.map((f, i) => `${i + 1}. ${f}`).join('\n')}

DETAILED REQUIREMENTS
${report.detailed_requirements?.map((req, i) => `
${i + 1}. ${req.requirement_name} (${req.requirement_id})
   Status: ${req.status}
   Evidence: ${req.evidence}
   Notes: ${req.notes}
`).join('\n')}

RISK ANALYSIS
${report.risk_analysis?.summary}

Critical Risks:
${report.risk_analysis?.critical_risks?.map((r, i) => `${i + 1}. ${r}`).join('\n')}

GAP ANALYSIS
${report.gap_analysis?.impact_assessment}

Identified Gaps:
${report.gap_analysis?.identified_gaps?.map((g, i) => `${i + 1}. ${g}`).join('\n')}

REMEDIATION PLAN
${report.remediation_plan?.map((plan, i) => `
${i + 1}. ${plan.gap_addressed}
   Timeline: ${plan.timeline}
   Responsible: ${plan.responsible_party}
   Actions: ${plan.remediation_actions?.join(', ')}
`).join('\n')}

RECOMMENDATIONS
${report.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${regulationName}_Compliance_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                {report.report_metadata?.report_title || 'Compliance Report'}
              </CardTitle>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Regulation:</strong> {report.report_metadata?.regulation}</p>
                <p><strong>Organization:</strong> {report.report_metadata?.organization}</p>
                <p><strong>Report Date:</strong> {report.report_metadata?.report_date}</p>
                <p><strong>Version:</strong> {report.report_metadata?.version}</p>
              </div>
            </div>
            <Button onClick={handleDownloadReport} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Status Overview */}
      {report.compliance_status && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Compliance Level</div>
                <div className="text-3xl font-bold text-blue-900">
                  {report.compliance_status.compliance_percentage}%
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="text-sm text-slate-600 mb-1">Certification Status</div>
                <div className="text-lg font-semibold text-slate-900">
                  {report.compliance_status.certification_status}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Overall Assessment</div>
                <div className="text-sm font-medium text-green-900">
                  {report.compliance_status.overall_assessment}
                </div>
              </div>
            </div>

            {report.compliance_status.key_findings && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Key Findings</h4>
                <ul className="space-y-1">
                  {report.compliance_status.key_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Report Content */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="gaps">Gaps</TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="appendices">Appendices</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
                {report.executive_summary}
              </div>
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-slate-900 mb-3">Scope and Methodology</h4>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                  {report.scope_and_methodology}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Requirements Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.detailed_requirements?.map((req, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <h5 className="font-semibold text-slate-900">{req.requirement_name}</h5>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {req.requirement_id}
                      </Badge>
                    </div>
                    <Badge className={`mb-2 ${
                      req.status === 'met' ? 'bg-green-100 text-green-800' :
                      req.status === 'partially_met' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'not_met' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-slate-700 space-y-2">
                      <p><strong>Evidence:</strong> {req.evidence}</p>
                      {req.notes && <p><strong>Notes:</strong> {req.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-slate-700 mb-6 whitespace-pre-wrap">
                {report.risk_analysis?.summary}
              </div>

              {report.risk_analysis?.critical_risks && report.risk_analysis.critical_risks.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Critical Risks
                  </h4>
                  <div className="space-y-2">
                    {report.risk_analysis.critical_risks.map((risk, idx) => (
                      <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-900">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.risk_analysis?.risk_matrix && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Risk Matrix</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {report.risk_analysis.risk_matrix}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-slate-700 mb-6 whitespace-pre-wrap">
                {report.gap_analysis?.impact_assessment}
              </div>

              {report.gap_analysis?.identified_gaps && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 mb-3">Identified Gaps</h4>
                  {report.gap_analysis.identified_gaps.map((gap, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-3 rounded-r-lg">
                      <p className="text-sm text-slate-700">{gap}</p>
                    </div>
                  ))}
                </div>
              )}

              {report.gap_analysis?.priority_ranking && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Priority Ranking</h4>
                  <ol className="space-y-1 list-decimal list-inside">
                    {report.gap_analysis.priority_ranking.map((priority, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{priority}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remediation">
          <Card>
            <CardHeader>
              <CardTitle>Remediation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.remediation_plan?.map((plan, idx) => (
                  <div key={idx} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h5 className="font-semibold text-blue-900 mb-2">{plan.gap_addressed}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-slate-600">Timeline:</span>
                        <span className="ml-2 font-medium text-slate-900">{plan.timeline}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Responsible:</span>
                        <span className="ml-2 font-medium text-slate-900">{plan.responsible_party}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Resources:</span>
                        <span className="ml-2 font-medium text-slate-900">{plan.resources_required}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Success Criteria:</span>
                        <span className="ml-2 font-medium text-slate-900">{plan.success_criteria}</span>
                      </div>
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold text-blue-800 mb-1">Remediation Actions:</h6>
                      <ul className="space-y-1">
                        {plan.remediation_actions?.map((action, actionIdx) => (
                          <li key={actionIdx} className="text-sm text-slate-700 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {report.implementation_timeline && (
                <div className="space-y-4">
                  {['phase_1', 'phase_2', 'phase_3'].map((phase, idx) => (
                    report.implementation_timeline[phase] && (
                      <div key={phase} className="border-l-4 border-blue-400 bg-slate-50 p-4 rounded-r-lg">
                        <h5 className="font-semibold text-slate-900 mb-2">
                          Phase {idx + 1}
                        </h5>
                        <p className="text-sm text-slate-700">{report.implementation_timeline[phase]}</p>
                      </div>
                    )
                  ))}
                  {report.implementation_timeline.estimated_completion && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-sm text-green-700">Estimated Completion</div>
                          <div className="font-semibold text-green-900">
                            {report.implementation_timeline.estimated_completion}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appendices">
          <Card>
            <CardHeader>
              <CardTitle>Appendices</CardTitle>
            </CardHeader>
            <CardContent>
              {report.appendices?.glossary && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Glossary</h4>
                  <ul className="space-y-1">
                    {report.appendices.glossary.map((term, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.appendices?.references && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">References</h4>
                  <ul className="space-y-1">
                    {report.appendices.references.map((ref, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{ref}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.appendices?.supporting_documentation && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Supporting Documentation</h4>
                  <ul className="space-y-1">
                    {report.appendices.supporting_documentation.map((doc, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-700">{rec}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}