import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GitCompare, Check, ExternalLink, Filter, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QuickAssessmentPanel from '../components/catalog/QuickAssessmentPanel';
import ROISimulator from '../components/catalog/ROISimulator';
import SemanticSearch from '../components/catalog/SemanticSearch';

export default function PlatformCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [ecosystemFilter, setEcosystemFilter] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [semanticResults, setSemanticResults] = useState(null);
  const [semanticAnalysis, setSemanticAnalysis] = useState(null);

  const { data: platforms = [], isLoading } = useQuery({
    queryKey: ['aiPlatforms'],
    queryFn: () => base44.entities.AIPlatform.list('-overall_score', 100),
    initialData: []
  });

  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = !searchTerm || 
      platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platform.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || platform.category === categoryFilter;
    const matchesTier = tierFilter === 'All' || platform.tier === tierFilter;
    const matchesEcosystem = ecosystemFilter === 'All' || platform.ecosystem === ecosystemFilter;

    return matchesSearch && matchesCategory && matchesTier && matchesEcosystem;
  });

  const togglePlatformSelection = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : prev.length < 4 
          ? [...prev, platformId] 
          : (toast.error('Maximum 4 platforms for comparison'), prev)
    );
  };

  const handleCompare = () => {
    if (selectedPlatforms.length < 2) {
      toast.error('Select at least 2 platforms to compare');
      return;
    }
    const ids = selectedPlatforms.join(',');
    navigate(`${createPageUrl('PlatformComparison')}?ids=${ids}`);
  };

  const getComplianceBadgeColor = (cert) => {
    const colors = {
      'SOC2': 'bg-blue-100 text-blue-800',
      'HIPAA': 'bg-purple-100 text-purple-800',
      'GDPR': 'bg-green-100 text-green-800',
      'FedRAMP': 'bg-red-100 text-red-800'
    };
    return colors[cert] || 'bg-slate-100 text-slate-800';
  };

  const categories = ['All', 'Foundation', 'Specialized', 'Enterprise', 'Developer', 'Productivity', 'Automation'];
  const tiers = ['All', 'Tier 1', 'Tier 2', 'Tier 3'];
  const ecosystems = ['All', 'Anthropic', 'OpenAI', 'Microsoft', 'Google', 'Automation', 'LangChain', 'Open Source', 'Independent'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                AI Platform Catalog
              </h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Explore and compare {platforms.length} AI platforms across categories, tiers, and ecosystems
              </p>
            </div>
            <QuickAssessmentPanel onRecommendationsGenerated={setAiRecommendations} />
          </div>
          
          {/* AI Recommendations Banner */}
          {aiRecommendations && (
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      AI-Powered Recommendations for You
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiRecommendations.recommended_platforms?.slice(0, 3).map((rec, idx) => (
                        <Badge key={idx} className="bg-purple-600 text-white">
                          {rec.platform_name} ({rec.fit_score}% match)
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiRecommendations(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-5 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ecosystemFilter} onValueChange={setEcosystemFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ecosystem" />
                </SelectTrigger>
                <SelectContent>
                  {ecosystems.map(eco => (
                    <SelectItem key={eco} value={eco}>{eco}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredPlatforms.length} of {platforms.length} platforms
              </p>
              {selectedPlatforms.length > 0 && (
                <Button onClick={handleCompare} className="bg-purple-600 hover:bg-purple-700">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare ({selectedPlatforms.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading platforms...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlatforms.map(platform => (
              <Card 
                key={platform.id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedPlatforms.includes(platform.id) ? 'ring-2 ring-purple-600' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}
                      >
                        {platform.short_name || platform.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{platform.name}</CardTitle>
                        <p className="text-xs text-slate-500">{platform.pricing}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {platform.overall_score}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{platform.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge className="text-xs">{platform.category}</Badge>
                    <Badge className="text-xs">{platform.tier}</Badge>
                    <Badge variant="outline" className="text-xs">{platform.ecosystem}</Badge>
                  </div>

                  <div className="space-y-1">
                    {platform.capabilities?.slice(0, 3).map((cap, idx) => (
                      <div key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-600" />
                        {cap}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                    <div>
                      <span className="text-slate-500">Market Share</span>
                      <div className="font-semibold">{platform.market_share}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Context</span>
                      <div className="font-semibold">{platform.context_window}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>Target:</strong> {platform.target_users}
                  </div>

                  {platform.use_cases?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-700">Top Use Cases:</div>
                      {platform.use_cases.slice(0, 3).map((useCase, idx) => (
                        <div key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-orange-500" />
                          {useCase}
                        </div>
                      ))}
                    </div>
                  )}

                  {platform.deployment_options?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Deployment:</div>
                      <div className="flex flex-wrap gap-1">
                        {platform.deployment_options.map((option, idx) => (
                          <Badge 
                            key={idx}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {platform.integration_options?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Integrations:</div>
                      <div className="flex flex-wrap gap-1">
                        {platform.integration_options.slice(0, 4).map((integration, idx) => (
                          <Badge 
                            key={idx}
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                            variant="outline"
                          >
                            {integration}
                          </Badge>
                        ))}
                        {platform.integration_options.length > 4 && (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            +{platform.integration_options.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {platform.compliance_certifications?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {platform.compliance_certifications.map((cert, idx) => (
                        <Badge 
                          key={idx}
                          className={`text-xs ${getComplianceBadgeColor(cert)}`}
                        >
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Semantic Match Score */}
                    {platform.semanticScore && (
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded">
                        <span className="text-xs font-semibold text-purple-900">AI Match Score</span>
                        <Badge className="bg-purple-600">
                          {platform.semanticScore}%
                        </Badge>
                      </div>
                    )}
                    
                    {/* Match Reasons */}
                    {platform.matchReasons?.length > 0 && (
                      <div className="px-3 py-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-semibold text-green-900 mb-1">Why it matches:</p>
                        <ul className="text-xs text-green-800 space-y-0.5">
                          {platform.matchReasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Concerns */}
                    {platform.concerns?.length > 0 && (
                      <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">Considerations:</p>
                        <ul className="text-xs text-yellow-800 space-y-0.5">
                          {platform.concerns.slice(0, 2).map((concern, idx) => (
                            <li key={idx}>• {concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => togglePlatformSelection(platform.id)}
                      >
                        {selectedPlatforms.includes(platform.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Add to Compare'
                        )}
                      </Button>
                      <ROISimulator platform={platform} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPlatforms.length === 0 && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600">No platforms match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}