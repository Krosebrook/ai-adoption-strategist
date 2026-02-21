import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Check, X, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ExportManager from '../components/reports/ExportManager';

export default function PlatformComparison() {
  const navigate = useNavigate();
  const [platformIds, setPlatformIds] = useState([]);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ids = urlParams.get('ids');
    if (ids) {
      setPlatformIds(ids.split(','));
    }
  }, []);

  const { data: allPlatforms = [] } = useQuery({
    queryKey: ['aiPlatforms'],
    queryFn: () => base44.entities.AIPlatform.list(),
    initialData: []
  });

  const platforms = allPlatforms.filter(p => platformIds.includes(p.id));

  const comparisonMetrics = [
    { label: 'Category', key: 'category' },
    { label: 'Tier', key: 'tier' },
    { label: 'Ecosystem', key: 'ecosystem' },
    { label: 'Pricing', key: 'pricing' },
    { label: 'Overall Score', key: 'overall_score' },
    { label: 'Market Share', key: 'market_share', suffix: '%' },
    { label: 'Context Window', key: 'context_window' },
    { label: 'Target Users', key: 'target_users' },
    { label: 'API Available', key: 'api_availability', type: 'boolean' },
    { label: 'Custom Training', key: 'custom_model_training', type: 'boolean' },
    { label: 'Support Level', key: 'support_level' }
  ];

  const renderValue = (platform, metric) => {
    const value = platform[metric.key];
    
    if (metric.type === 'boolean') {
      return value ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-500" />;
    }
    
    if (value === undefined || value === null) {
      return <Minus className="h-5 w-5 text-slate-400" />;
    }
    
    return <span>{value}{metric.suffix || ''}</span>;
  };

  const getBestValue = (metric) => {
    if (metric.key === 'overall_score' || metric.key === 'market_share') {
      return Math.max(...platforms.map(p => p[metric.key] || 0));
    }
    return null;
  };

  const isBestValue = (platform, metric) => {
    const best = getBestValue(metric);
    return best !== null && platform[metric.key] === best;
  };

  const exportData = {
    comparison: platforms.map(p => ({
      name: p.name,
      ...comparisonMetrics.reduce((acc, m) => ({
        ...acc,
        [m.label]: p[m.key]
      }), {})
    }))
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl('PlatformCatalog'))}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Platform Comparison
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Side-by-side comparison of {platforms.length} AI platforms
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowExport(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {platforms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">No platforms selected for comparison</p>
              <Button onClick={() => navigate(createPageUrl('PlatformCatalog'))}>
                Go to Catalog
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Platform Headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${platforms.length}, 1fr)` }}>
              <div></div>
              {platforms.map(platform => (
                <Card key={platform.id}>
                  <CardHeader className="text-center pb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white mx-auto mb-2"
                      style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}
                    >
                      {platform.short_name || platform.name.charAt(0)}
                    </div>
                    <CardTitle className="text-lg">{platform.name}</CardTitle>
                    <p className="text-sm text-slate-600">{platform.provider}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Comparison Matrix */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {comparisonMetrics.map((metric, idx) => (
                        <tr 
                          key={metric.key}
                          className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                        >
                          <td className="px-4 py-3 font-semibold text-sm w-48">
                            {metric.label}
                          </td>
                          {platforms.map(platform => (
                            <td 
                              key={platform.id}
                              className={`px-4 py-3 text-sm text-center ${
                                isBestValue(platform, metric) ? 'bg-green-50 font-semibold' : ''
                              }`}
                            >
                              {renderValue(platform, metric)}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Capabilities */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Capabilities
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3 text-sm">
                            <div className="space-y-1">
                              {platform.capabilities?.map((cap, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-xs">
                                  <Check className="h-3 w-3 text-green-600" />
                                  {cap}
                                </div>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Compliance */}
                      <tr className="bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Compliance
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {platform.compliance_certifications?.map((cert, idx) => (
                                <Badge key={idx} className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Strengths */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Strengths
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <ul className="text-xs space-y-1">
                              {platform.strengths?.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-green-600">+</span>
                                  {str}
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>

                      {/* Limitations */}
                      <tr className="bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Limitations
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <ul className="text-xs space-y-1">
                              {platform.limitations?.map((lim, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-red-600">-</span>
                                  {lim}
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>

                      {/* Use Cases */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Use Cases
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <div className="space-y-1">
                              {platform.use_cases?.map((useCase, idx) => (
                                <div key={idx} className="text-xs flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                  {useCase}
                                </div>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Deployment Options */}
                      <tr className="bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Deployment Options
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {platform.deployment_options?.map((option, idx) => (
                                <Badge 
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Integration Options */}
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-semibold text-sm align-top">
                          Integration Options
                        </td>
                        {platforms.map(platform => (
                          <td key={platform.id} className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {platform.integration_options?.slice(0, 6).map((integration, idx) => (
                                <Badge 
                                  key={idx}
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                  variant="outline"
                                >
                                  {integration}
                                </Badge>
                              ))}
                              {platform.integration_options?.length > 6 && (
                                <Badge variant="outline" className="text-xs text-slate-500">
                                  +{platform.integration_options.length - 6}
                                </Badge>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ExportManager 
          data={exportData}
          title="Platform_Comparison"
          open={showExport}
          onOpenChange={setShowExport}
        />
      </div>
    </div>
  );
}