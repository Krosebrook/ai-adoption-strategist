import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GitCompare, Check, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PlatformCatalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [ecosystemFilter, setEcosystemFilter] = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

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
    navigate(createPageUrl(`PlatformComparison?ids=${ids}`));
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            AI Platform Catalog
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Explore and compare {platforms.length} AI platforms across categories, tiers, and ecosystems
          </p>
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

                  <Button 
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    className="w-full"
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