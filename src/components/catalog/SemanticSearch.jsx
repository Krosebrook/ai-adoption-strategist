import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Loader2, X, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SemanticSearch({ platforms = [], onFilterResults }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);

  const exampleQueries = [
    "Find platforms good for customer service in healthcare with GDPR compliance",
    "Show me affordable AI tools for small marketing teams",
    "Which platforms support on-premise deployment with SOC2 certification",
    "Enterprise-ready solutions with Microsoft ecosystem integration"
  ];

  const scoreAndFilterPlatforms = useCallback((platforms, searchResponse) => {
    if (!platforms?.length || !searchResponse) return [];

    const scoredPlatforms = platforms.map(platform => {
      const aiScore = searchResponse.platform_scores?.find(
        ps => ps.platform_name?.toLowerCase().includes(platform.name?.toLowerCase()) ||
              platform.name?.toLowerCase().includes(ps.platform_name?.toLowerCase())
      );

      let score = 0;
      const matchReasons = [];

      // Category match (30 points)
      if (searchResponse.extracted_criteria?.categories?.some(cat => 
        platform.category?.toLowerCase().includes(cat.toLowerCase())
      )) {
        score += 30;
        matchReasons.push('Category match');
      }

      // Compliance match (25 points)
      if (searchResponse.extracted_criteria?.compliance_requirements?.some(comp =>
        platform.compliance_certifications?.some(cert => 
          cert.toLowerCase().includes(comp.toLowerCase())
        )
      )) {
        score += 25;
        matchReasons.push('Compliance certified');
      }

      // Use case match (20 points)
      if (searchResponse.extracted_criteria?.use_cases?.some(uc =>
        platform.use_cases?.some(puc => 
          puc.toLowerCase().includes(uc.toLowerCase())
        ) ||
        platform.description?.toLowerCase().includes(uc.toLowerCase())
      )) {
        score += 20;
        matchReasons.push('Use case alignment');
      }

      // Integration match (15 points)
      if (searchResponse.extracted_criteria?.integrations_needed?.some(integ =>
        platform.integration_options?.some(pi => 
          pi.toLowerCase().includes(integ.toLowerCase())
        )
      )) {
        score += 15;
        matchReasons.push('Integration support');
      }

      // Deployment match (10 points)
      if (searchResponse.extracted_criteria?.deployment_preference &&
          platform.deployment_options?.some(dep =>
            dep.toLowerCase().includes(searchResponse.extracted_criteria.deployment_preference.toLowerCase())
          )) {
        score += 10;
        matchReasons.push('Deployment option available');
      }

      // Use AI score if available and higher
      if (aiScore?.score) {
        score = Math.max(score, aiScore.score);
      }

      return {
        ...platform,
        semanticScore: score,
        matchReasons: aiScore?.match_reasons || matchReasons,
        concerns: aiScore?.concerns || []
      };
    });

    return scoredPlatforms
      .filter(p => p.semanticScore > 30)
      .sort((a, b) => b.semanticScore - a.semanticScore);
  }, []);

  const handleSemanticSearch = useCallback(async () => {
    if (!query?.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (!platforms?.length) {
      toast.error('No platforms available to search');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const prompt = `You are an AI platform recommendation expert. Analyze this natural language query and extract structured search criteria.

User Query: "${query}"

Available platforms context:
- Categories: Foundation, Specialized, Enterprise, Developer, Productivity, Automation
- Tiers: Tier 1, Tier 2, Tier 3
- Ecosystems: Anthropic, OpenAI, Microsoft, Google, Automation, LangChain, Open Source, Independent
- Common compliance: HIPAA, GDPR, SOC2, ISO27001
- Common integrations: Slack, Microsoft Teams, Salesforce, Google Workspace, Zapier

Based on the query, identify:
1. Which categories might be relevant
2. Industry or use case mentioned
3. Compliance requirements
4. Budget indicators (enterprise, affordable, small team, etc.)
5. Deployment preferences
6. Integration needs
7. Specific features or capabilities

Then, score each platform (1-100) based on how well it matches the query criteria. Consider:
- Direct feature matches (highest weight)
- Compliance alignment
- Use case fit
- Ecosystem compatibility
- Pricing tier appropriateness

Return a scoring rationale and top matching platforms.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            understanding: { type: "string" },
            extracted_criteria: {
              type: "object",
              properties: {
                categories: { type: "array", items: { type: "string" } },
                use_cases: { type: "array", items: { type: "string" } },
                compliance_requirements: { type: "array", items: { type: "string" } },
                integrations_needed: { type: "array", items: { type: "string" } },
                deployment_preference: { type: "string" },
                budget_level: { type: "string" },
                key_features: { type: "array", items: { type: "string" } }
              }
            },
            platform_scores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform_name: { type: "string" },
                  score: { type: "number" },
                  match_reasons: { type: "array", items: { type: "string" } },
                  concerns: { type: "array", items: { type: "string" } }
                }
              }
            },
            recommendations_summary: { type: "string" }
          }
        }
      });

      if (!response) {
        throw new Error('No response from AI');
      }

      setLastQuery(query);
      setSearchResults(response);

      const filteredPlatforms = scoreAndFilterPlatforms(platforms, response);

      if (onFilterResults) {
        onFilterResults(filteredPlatforms, response);
      }
      
      toast.success(`Found ${filteredPlatforms.length} matching platforms`);
    } catch (error) {
      console.error('Semantic search error:', error);
      const errorMessage = error.message || 'Search failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset to show all platforms on error
      if (onFilterResults) {
        onFilterResults(platforms, null);
      }
    } finally {
      setIsSearching(false);
    }
  }, [query, platforms, scoreAndFilterPlatforms, onFilterResults]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setLastQuery(null);
    setSearchResults(null);
    setError(null);
    if (onFilterResults) {
      onFilterResults(platforms, null);
    }
  }, [platforms, onFilterResults]);

  const exampleQueriesMemo = useMemo(() => exampleQueries, []);

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-lg">AI-Powered Search</h3>
          </div>

          <p className="text-sm text-slate-600 mb-3">
            Ask in plain English to find the perfect AI platform
          </p>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder='e.g., "Find platforms for customer service with GDPR compliance"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSemanticSearch()}
                className="pl-10 pr-10"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSemanticSearch}
              disabled={isSearching || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Example Queries */}
          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Search Error</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {!lastQuery && !error && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueriesMemo.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(example)}
                    className="text-xs px-3 py-1.5 bg-white border border-purple-200 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Summary */}
          {searchResults && (
            <div className="space-y-3 pt-3 border-t border-purple-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-purple-900">
                  Search Results for: "{lastQuery}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                >
                  Clear
                </Button>
              </div>

              <div className="bg-white rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-slate-700 mb-2">
                  <strong>AI Understanding:</strong> {searchResults.understanding}
                </p>
                {searchResults.recommendations_summary && (
                  <p className="text-sm text-slate-600">
                    {searchResults.recommendations_summary}
                  </p>
                )}
              </div>

              {searchResults.extracted_criteria && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Extracted Criteria:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchResults.extracted_criteria.categories?.map((cat, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800">
                        {cat}
                      </Badge>
                    ))}
                    {searchResults.extracted_criteria.compliance_requirements?.map((comp, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800">
                        {comp}
                      </Badge>
                    ))}
                    {searchResults.extracted_criteria.use_cases?.map((uc, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-800">
                        {uc}
                      </Badge>
                    ))}
                    {searchResults.extracted_criteria.budget_level && (
                      <Badge className="bg-orange-100 text-orange-800">
                        {searchResults.extracted_criteria.budget_level}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}