import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, TrendingUp, Users, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function QuickAssessmentPanel({ onRecommendationsGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    company_size: '',
    industry: '',
    budget_range: '',
    primary_use_case: '',
    compliance_needs: '',
    technical_maturity: ''
  });
  const [readinessScore, setReadinessScore] = useState(null);

  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Other'];
  const companySizes = ['1-50', '51-200', '201-1000', '1001-5000', '5000+'];
  const budgetRanges = ['<$10K/mo', '$10K-$50K/mo', '$50K-$100K/mo', '$100K-$500K/mo', '$500K+/mo'];
  const useCases = ['Customer Service', 'Content Creation', 'Data Analysis', 'Code Development', 'Research', 'Automation'];
  const complianceNeeds = ['None', 'Basic (SOC2)', 'HIPAA', 'GDPR', 'Multiple'];
  const maturityLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleGenerateRecommendations = async () => {
    if (!formData.company_size || !formData.industry || !formData.primary_use_case) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Based on the following company profile, provide AI readiness assessment and platform recommendations:
      
Company Size: ${formData.company_size} employees
Industry: ${formData.industry}
Budget Range: ${formData.budget_range}
Primary Use Case: ${formData.primary_use_case}
Compliance Needs: ${formData.compliance_needs}
Technical Maturity: ${formData.technical_maturity}

Provide:
1. AI Readiness Score (0-100)
2. Readiness Level (Beginner/Intermediate/Advanced)
3. Top 3 recommended platforms with justification
4. Key considerations for this organization
5. Quick wins they can achieve`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            readiness_score: { type: "number" },
            readiness_level: { type: "string" },
            recommended_platforms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform_name: { type: "string" },
                  justification: { type: "string" },
                  fit_score: { type: "number" }
                }
              }
            },
            key_considerations: {
              type: "array",
              items: { type: "string" }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setReadinessScore(response);
      onRecommendationsGenerated(response);
      toast.success('AI recommendations generated!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Quick AI Assessment
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Readiness Quick Assessment
            </DialogTitle>
            <p className="text-sm text-slate-600">
              Get instant platform recommendations based on your organization's profile
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Size *</Label>
                <Select value={formData.company_size} onValueChange={(value) => setFormData({ ...formData, company_size: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Monthly Budget</Label>
                <Select value={formData.budget_range} onValueChange={(value) => setFormData({ ...formData, budget_range: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Use Case *</Label>
                <Select value={formData.primary_use_case} onValueChange={(value) => setFormData({ ...formData, primary_use_case: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {useCases.map(useCase => (
                      <SelectItem key={useCase} value={useCase}>{useCase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Compliance Requirements</Label>
                <Select value={formData.compliance_needs} onValueChange={(value) => setFormData({ ...formData, compliance_needs: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compliance" />
                  </SelectTrigger>
                  <SelectContent>
                    {complianceNeeds.map(need => (
                      <SelectItem key={need} value={need}>{need}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Technical Maturity</Label>
                <Select value={formData.technical_maturity} onValueChange={(value) => setFormData({ ...formData, technical_maturity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maturity" />
                  </SelectTrigger>
                  <SelectContent>
                    {maturityLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {readinessScore && (
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    Assessment Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">AI Readiness Score</span>
                    <span className={`text-3xl font-bold ${getReadinessColor(readinessScore.readiness_score)}`}>
                      {readinessScore.readiness_score}/100
                    </span>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    {readinessScore.readiness_level}
                  </Badge>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Top Recommendations:</h4>
                    {readinessScore.recommended_platforms?.map((platform, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{platform.platform_name}</span>
                          <Badge variant="outline">{platform.fit_score}/100</Badge>
                        </div>
                        <p className="text-xs text-slate-600">{platform.justification}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Quick Wins:</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {readinessScore.quick_wins?.map((win, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}