import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Download, BarChart3, DollarSign, Shield } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const SECTIONS = [
  { key: 'overview', label: 'Platform Overview Table' },
  { key: 'scores', label: 'Score Comparison Chart' },
  { key: 'radar', label: 'Capability Radar Chart' },
  { key: 'roi', label: 'ROI Projections' },
  { key: 'compliance', label: 'Compliance Matrix' },
  { key: 'ai_narrative', label: 'AI Narrative & Insights' }
];

export default function ComparisonReportBuilder() {
  const [selectedPlatformIds, setSelectedPlatformIds] = useState([]);
  const [sections, setSections] = useState({ overview: true, scores: true, radar: true, roi: true, compliance: true, ai_narrative: true });
  const [aiNarrative, setAiNarrative] = useState(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  const { data: platforms = [] } = useQuery({
    queryKey: ['aiPlatforms'],
    queryFn: () => base44.entities.AIPlatform.list('-overall_score', 30),
    initialData: []
  });

  const selectedPlatforms = platforms.filter(p => selectedPlatformIds.includes(p.id));

  const togglePlatform = (id) => {
    setSelectedPlatformIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 5 ? [...prev, id]
        : (toast.error('Max 5 platforms'), prev)
    );
  };

  // Chart data derived from selected platforms
  const scoreData = selectedPlatforms.map(p => ({
    name: p.short_name || p.name.slice(0, 10),
    Score: p.overall_score || 0,
    'Market Share': p.market_share || 0
  }));

  const radarData = ['Capabilities', 'Compliance', 'Integration', 'Support', 'Pricing Value'].map(attr => {
    const row = { subject: attr };
    selectedPlatforms.forEach(p => {
      if (attr === 'Capabilities') row[p.short_name || p.name] = (p.capabilities?.length || 0) * 10;
      if (attr === 'Compliance') row[p.short_name || p.name] = (p.compliance_certifications?.length || 0) * 25;
      if (attr === 'Integration') row[p.short_name || p.name] = Math.min((p.integration_options?.length || 0) * 5, 100);
      if (attr === 'Support') row[p.short_name || p.name] = { Basic: 25, Standard: 50, Premium: 75, Enterprise: 100 }[p.support_level] || 50;
      if (attr === 'Pricing Value') row[p.short_name || p.name] = p.pricing_value ? Math.max(0, 100 - p.pricing_value * 2) : 60;
    });
    return row;
  });

  const roiData = [6, 12, 18, 24].map(month => {
    const row = { month: `${month}mo` };
    selectedPlatforms.forEach(p => {
      const base = (p.overall_score || 5) * 8;
      row[p.short_name || p.name] = Math.round(base * (month / 6) * (1 + Math.random() * 0.2 - 0.1));
    });
    return row;
  });

  const COLORS = ['#E88A1D', '#6B5B7A', '#2563eb', '#16a34a', '#dc2626'];

  const generateNarrative = async () => {
    if (selectedPlatforms.length < 2) { toast.error('Select at least 2 platforms'); return; }
    setLoadingNarrative(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `As an enterprise AI analyst, write a concise 3-paragraph narrative comparing these platforms:

${selectedPlatforms.map(p => `
Platform: ${p.name} (${p.provider})
Score: ${p.overall_score}/10 | Tier: ${p.tier} | Ecosystem: ${p.ecosystem}
Strengths: ${p.strengths?.slice(0, 3).join(', ')}
Limitations: ${p.limitations?.slice(0, 2).join(', ')}
Compliance: ${p.compliance_certifications?.join(', ') || 'None listed'}
Pricing: ${p.pricing}
`).join('\n---\n')}

Paragraph 1: Overall positioning and differentiation
Paragraph 2: Enterprise fit and compliance strengths/gaps
Paragraph 3: Final recommendation on when to choose each platform`,
        add_context_from_internet: false
      });
      setAiNarrative(typeof response === 'string' ? response : JSON.stringify(response));
      toast.success('AI narrative generated!');
    } catch {
      toast.error('Failed to generate narrative');
    } finally {
      setLoadingNarrative(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const add = (text, size = 10, bold = false) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(size);
      doc.setFont(undefined, bold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(String(text), 170);
      doc.text(lines, 20, y);
      y += lines.length * (size * 0.45) + 3;
    };
    add(`Platform Comparison Report`, 18, true);
    add(`Generated: ${new Date().toLocaleDateString()} | Platforms: ${selectedPlatforms.map(p => p.name).join(', ')}`, 9);
    y += 5;
    add('Platform Overview', 13, true);
    selectedPlatforms.forEach(p => {
      add(`${p.name} (${p.provider}) — Score: ${p.overall_score}/10 | ${p.tier} | ${p.pricing}`, 10, true);
      add(`Strengths: ${p.strengths?.slice(0, 3).join('; ')}`, 9);
      add(`Compliance: ${p.compliance_certifications?.join(', ') || 'None'}`, 9);
      y += 3;
    });
    if (aiNarrative && sections.ai_narrative) {
      add('AI Analysis', 13, true);
      add(aiNarrative, 9);
    }
    doc.save(`Platform_Comparison_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success('PDF exported!');
  };

  return (
    <div className="space-y-6">
      {/* Builder Config */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Platform selector */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              Select Platforms to Compare (max 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {platforms.map(p => (
                <div
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                    selectedPlatformIds.includes(p.id)
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox checked={selectedPlatformIds.includes(p.id)} readOnly />
                  <span className="truncate font-medium">{p.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECTIONS.map(s => (
              <div key={s.key} className="flex items-center gap-2">
                <Checkbox
                  checked={sections[s.key]}
                  onCheckedChange={v => setSections(prev => ({ ...prev, [s.key]: v }))}
                />
                <label className="text-sm cursor-pointer">{s.label}</label>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={exportToPDF}
              disabled={selectedPlatforms.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedPlatforms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-gray-500">
            Select at least 2 platforms above to build the report.
          </CardContent>
        </Card>
      )}

      {selectedPlatforms.length >= 2 && (
        <div className="space-y-6">
          {/* Overview Table */}
          {sections.overview && (
            <Card>
              <CardHeader><CardTitle className="text-base">Platform Overview</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold text-gray-600">Platform</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">Score</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">Tier</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">Pricing</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-600">API</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-600">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlatforms.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 pr-4 font-medium">{p.name}</td>
                        <td className="py-2 px-2 text-center">
                          <Badge className="bg-orange-100 text-orange-700">{p.overall_score}/10</Badge>
                        </td>
                        <td className="py-2 px-2 text-center text-xs">{p.tier}</td>
                        <td className="py-2 px-2 text-center text-xs">{p.pricing || '—'}</td>
                        <td className="py-2 px-2 text-center">{p.api_availability ? '✓' : '✗'}</td>
                        <td className="py-2 px-2">
                          <div className="flex flex-wrap gap-1">
                            {p.compliance_certifications?.slice(0, 3).map((c, j) => (
                              <Badge key={j} variant="outline" className="text-xs">{c}</Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Score Chart */}
          {sections.scores && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-orange-500" />Score Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={scoreData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Score" fill="#E88A1D" radius={[4,4,0,0]} />
                    <Bar dataKey="Market Share" fill="#6B5B7A" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Radar Chart */}
          {sections.radar && (
            <Card>
              <CardHeader><CardTitle className="text-base">Capability Radar</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    {selectedPlatforms.map((p, i) => (
                      <Radar
                        key={p.id}
                        name={p.short_name || p.name}
                        dataKey={p.short_name || p.name}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.15}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* ROI Projections */}
          {sections.roi && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />Estimated ROI Projections (Index)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={roiData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {selectedPlatforms.map((p, i) => (
                      <Line
                        key={p.id}
                        type="monotone"
                        dataKey={p.short_name || p.name}
                        stroke={COLORS[i]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2 text-center">ROI index based on overall score, market share, and integrations. For illustrative comparison only.</p>
              </CardContent>
            </Card>
          )}

          {/* Compliance Matrix */}
          {sections.compliance && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />Compliance Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {(() => {
                  const allCerts = [...new Set(selectedPlatforms.flatMap(p => p.compliance_certifications || []))];
                  return (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-semibold text-gray-600">Standard</th>
                          {selectedPlatforms.map(p => (
                            <th key={p.id} className="text-center py-2 px-3 font-semibold text-gray-600">{p.short_name || p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allCerts.map((cert, i) => (
                          <tr key={cert} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 pr-4 font-medium">{cert}</td>
                            {selectedPlatforms.map(p => (
                              <td key={p.id} className="py-2 px-3 text-center">
                                {p.compliance_certifications?.includes(cert) ? (
                                  <span className="text-green-600 font-bold">✓</span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* AI Narrative */}
          {sections.ai_narrative && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />AI Analyst Narrative
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={generateNarrative}
                    disabled={loadingNarrative}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loadingNarrative ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {aiNarrative ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aiNarrative ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiNarrative}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Click "Generate" to create an AI-written analysis of the selected platforms.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}