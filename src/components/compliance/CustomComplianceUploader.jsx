import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, Shield, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeCustomComplianceDocument, compareComplianceDocuments } from './CustomComplianceAnalyzer';

export default function CustomComplianceUploader({ platforms = ['Google Gemini', 'Microsoft Copilot', 'Anthropic Claude', 'OpenAI ChatGPT'] }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return { name: file.name, url: file_url };
        })
      );
      setUploadedFiles([...uploadedFiles, ...uploadedUrls]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;

    setAnalyzing(true);
    try {
      let result;
      if (uploadedFiles.length === 1) {
        result = await analyzeCustomComplianceDocument(uploadedFiles[0].url, platforms);
      } else {
        result = await compareComplianceDocuments(
          uploadedFiles.map(f => f.url),
          platforms
        );
      }
      setAnalysisResult(result);
      toast.success('Compliance analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze documents');
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status) => ({
    compliant: 'bg-green-600',
    partially_compliant: 'bg-yellow-600',
    non_compliant: 'bg-red-600',
    needs_review: 'bg-blue-600'
  }[status] || 'bg-slate-600');

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Custom Compliance Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="compliance-upload"
              disabled={uploading}
            />
            <label htmlFor="compliance-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">
                Drop compliance documents here or click to upload
              </p>
              <p className="text-sm text-slate-500">
                Supports PDF, DOC, DOCX, TXT (Multiple files supported)
              </p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Uploaded Documents:</h4>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-slate-700">{file.name}</span>
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={uploadedFiles.length === 0 || analyzing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Documents...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Analyze Compliance Requirements
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Tabs defaultValue="requirements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="platforms">Platform Assessment</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Adjustments</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Compliance Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult.document_summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Document Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Type:</strong> {analysisResult.document_summary.document_type}</div>
                      <div><strong>Framework:</strong> {analysisResult.document_summary.regulatory_framework}</div>
                      <div><strong>Scope:</strong> {analysisResult.document_summary.scope}</div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {analysisResult.extracted_requirements?.map((req, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{req.requirement_id}</Badge>
                          <Badge>{req.category}</Badge>
                        </div>
                        <Badge className={
                          req.criticality === 'critical' ? 'bg-red-600' :
                          req.criticality === 'high' ? 'bg-orange-600' :
                          req.criticality === 'medium' ? 'bg-yellow-600' :
                          'bg-green-600'
                        }>
                          {req.criticality}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{req.description}</p>
                      {req.specific_controls?.length > 0 && (
                        <div className="text-xs text-slate-600">
                          <strong>Controls:</strong> {req.specific_controls.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.platform_assessments?.map((platform, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{platform.platform}</CardTitle>
                      <Badge className={getStatusColor(platform.status)}>
                        {platform.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {platform.overall_compliance_score}%
                    </div>
                  </CardHeader>
                  <CardContent>
                    {platform.compliant_areas?.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-semibold text-green-700 mb-1">Compliant Areas</h5>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {platform.compliant_areas.map((area, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {platform.gaps?.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-red-700 mb-1">Gaps</h5>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {platform.gaps.map((gap, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5" />
                              <span>{gap.gap_description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configurations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Recommended Platform Configurations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.platform_assessments?.map((platform, idx) => (
                    platform.recommended_configurations?.length > 0 && (
                      <div key={idx} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-3">{platform.platform}</h4>
                        <div className="space-y-2">
                          {platform.recommended_configurations.map((config, i) => (
                            <div key={i} className="bg-slate-50 rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-900">{config.setting}</span>
                                <Badge variant="outline">{config.recommended_value}</Badge>
                              </div>
                              <p className="text-sm text-slate-600">{config.purpose}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Adjustments for Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.strategy_adjustments?.map((adj, idx) => (
                    <div key={idx} className="border-l-4 border-l-purple-600 bg-slate-50 rounded-r-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{adj.area}</h4>
                        <Badge className={
                          adj.priority === 'high' ? 'bg-red-600' :
                          adj.priority === 'medium' ? 'bg-yellow-600' :
                          'bg-green-600'
                        }>
                          {adj.priority} priority
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong className="text-slate-700">Current:</strong>
                          <p className="text-slate-600">{adj.current_approach}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700">Recommended:</strong>
                          <p className="text-slate-600">{adj.recommended_change}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        <strong>Rationale:</strong> {adj.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}