import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

export default function ReportPreview({ report, reportType }) {
  if (!report) return null;

  const renderExecutiveReport = () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Executive Summary</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{report.executive_summary}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Strategic Recommendation</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{report.strategic_recommendation}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Financial Impact</h2>
        <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>{report.financial_impact?.summary}</p>
        <ul className="space-y-2">
          {report.financial_impact?.key_metrics?.map((metric, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-teal-500">•</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{metric}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Key Risk Factors</h2>
        <ul className="space-y-2">
          {report.risk_factors?.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-red-500">⚠</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{risk}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Implementation Overview</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>{report.implementation_overview}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Next Steps</h2>
        <ol className="space-y-2">
          {report.next_steps?.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{idx + 1}.</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );

  const renderTechnicalReport = () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Architecture Overview</h2>
        <ReactMarkdown className="prose prose-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {report.architecture_overview}
        </ReactMarkdown>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Integration Specifications</h2>
        <div className="space-y-3">
          {report.integration_specifications?.map((spec, idx) => (
            <Card key={idx} style={{ background: 'rgba(33, 128, 141, 0.05)', border: '1px solid var(--color-border)' }}>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{spec.system}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Method:</strong> {spec.integration_method}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{spec.requirements}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Security Configuration</h2>
        <ReactMarkdown className="prose prose-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {report.security_config}
        </ReactMarkdown>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Testing Plan</h2>
        <div className="space-y-3">
          {report.testing_plan?.map((phase, idx) => (
            <div key={idx}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{phase.phase}</h3>
              <ul className="space-y-1">
                {phase.tests?.map((test, testIdx) => (
                  <li key={testIdx} className="text-sm flex items-start gap-2">
                    <span style={{ color: 'var(--color-primary)' }}>→</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{test}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>TCO Analysis</h2>
        <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>{report.tco_analysis?.summary}</p>
        <div className="grid grid-cols-2 gap-4">
          <Card style={{ background: 'rgba(33, 128, 141, 0.05)', border: '1px solid var(--color-border)' }}>
            <CardContent className="pt-4">
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Year 1 TCO</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                ${report.tco_analysis?.year_one?.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card style={{ background: 'rgba(33, 128, 141, 0.05)', border: '1px solid var(--color-border)' }}>
            <CardContent className="pt-4">
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Year 3 TCO</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                ${report.tco_analysis?.year_three?.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Platform Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="text-left py-2" style={{ color: 'var(--color-text)' }}>Platform</th>
                <th className="text-right py-2" style={{ color: 'var(--color-text)' }}>Total Cost</th>
                <th className="text-right py-2" style={{ color: 'var(--color-text)' }}>Net Savings</th>
                <th className="text-right py-2" style={{ color: 'var(--color-text)' }}>ROI %</th>
              </tr>
            </thead>
            <tbody>
              {report.platform_comparison?.map((platform, idx) => (
                <tr key={idx} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="py-2" style={{ color: 'var(--color-text)' }}>{platform.platform}</td>
                  <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                    ${platform.total_cost?.toLocaleString()}
                  </td>
                  <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                    ${platform.net_savings?.toLocaleString()}
                  </td>
                  <td className="text-right font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {platform.roi_percent?.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Budget Requirements</h2>
        <div className="space-y-2">
          {report.budget_requirements?.map((req, idx) => (
            <div key={idx} className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(33, 128, 141, 0.05)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{req.category}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{req.timing}</p>
              </div>
              <p className="font-bold" style={{ color: 'var(--color-primary)' }}>
                ${req.amount?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--color-text)' }}>Report Preview</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        {reportType === 'executive' && renderExecutiveReport()}
        {reportType === 'technical' && renderTechnicalReport()}
        {reportType === 'financial' && renderFinancialReport()}
      </CardContent>
    </Card>
  );
}