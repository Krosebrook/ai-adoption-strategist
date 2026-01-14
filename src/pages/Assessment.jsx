import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import WizardStep1 from '../components/assessment/WizardStep1';
import WizardStep2 from '../components/assessment/WizardStep2';
import WizardStep3 from '../components/assessment/WizardStep3';
import WizardStep4 from '../components/assessment/WizardStep4';
import WizardStep5 from '../components/assessment/WizardStep5';

import {
  calculateAllROI,
  assessCompliance,
  assessIntegrations,
  assessPainPoints,
  generateRecommendations,
  generateExecutiveSummary
} from '../components/assessment/CalculationEngine';
import { analyzeUnstructuredInput, analyzeFeedbackTrends, refineScoringWithFeedback } from '../components/assessment/AIEnhancer';

export default function Assessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    organization_name: '',
    assessment_date: new Date().toISOString().split('T')[0],
    departments: [],
    compliance_requirements: [],
    desired_integrations: [],
    pain_points: [],
    business_goals: [],
    technical_constraints: {},
    budget_constraints: {}
  });

  const totalSteps = 5;

  const createAssessmentMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Assessment.create(data);
    },
    onSuccess: (result) => {
      toast.success('Assessment completed successfully!');
      navigate(createPageUrl('Results') + `?id=${result.id}`);
    },
    onError: () => {
      toast.error('Failed to save assessment');
    }
  });

  const handleNext = () => {
    if (currentStep === 1 && !formData.organization_name) {
      toast.error('Please enter organization name');
      return;
    }
    if (currentStep === 2 && formData.departments.length === 0) {
      toast.error('Please add at least one department');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Analyze unstructured input if provided
    let aiInsights = null;
    let customWeights = null;
    
    if (formData.additional_context && formData.additional_context.trim()) {
      toast.info('Analyzing your input with AI...');
      aiInsights = await analyzeUnstructuredInput(formData.additional_context, 'assessment');
      
      // Get feedback trends and refine scoring
      const feedbackAnalysis = await analyzeFeedbackTrends();
      if (feedbackAnalysis && aiInsights) {
        customWeights = await refineScoringWithFeedback(formData, feedbackAnalysis);
      }
    }

    // Perform all calculations
    const roiData = calculateAllROI(formData.departments);
    const complianceData = assessCompliance(formData.compliance_requirements);
    const integrationData = assessIntegrations(formData.desired_integrations);
    
    // Enhance pain points with AI analysis if available
    let enhancedPainPoints = formData.pain_points;
    if (aiInsights?.pain_points) {
      enhancedPainPoints = [...new Set([...formData.pain_points, ...aiInsights.pain_points])];
    }
    
    const painPointData = assessPainPoints(enhancedPainPoints);
    
    // Generate recommendations with custom weights if available
    const recommendations = generateRecommendations(
      roiData, 
      complianceData, 
      integrationData, 
      painPointData,
      customWeights,
      null,
      formData
    );

    const assessmentData = {
      ...formData,
      pain_points: enhancedPainPoints,
      roi_calculations: roiData.reduce((acc, roi) => {
        acc[roi.platform] = roi;
        return acc;
      }, {}),
      compliance_scores: complianceData,
      integration_scores: integrationData,
      pain_point_mappings: painPointData.pain_point_mappings,
      recommended_platforms: recommendations,
      ai_insights: aiInsights,
      custom_weights: customWeights,
      status: 'completed'
    };

    assessmentData.executive_summary = generateExecutiveSummary(assessmentData, recommendations);

    createAssessmentMutation.mutate(assessmentData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStep1 formData={formData} setFormData={setFormData} />;
      case 2:
        return <WizardStep2 formData={formData} setFormData={setFormData} />;
      case 3:
        return <WizardStep3 formData={formData} setFormData={setFormData} />;
      case 4:
        return <WizardStep4 formData={formData} setFormData={setFormData} />;
      case 5:
        return <WizardStep5 formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>AI Platform Assessment</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Complete the assessment to get your personalized recommendation</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {progress.toFixed(0)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-3">
            {['Organization', 'Departments', 'Requirements', 'Pain Points', 'Goals & Budget'].map((label, index) => (
              <div
                key={index}
                className={`text-xs ${
                  index + 1 === currentStep
                    ? 'text-slate-900 font-semibold'
                    : index + 1 < currentStep
                    ? 'text-green-600 font-medium'
                    : 'text-slate-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps && (
              <Button onClick={handleNext} style={{ background: 'var(--color-primary)', color: 'white' }} className="hover:opacity-90">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === totalSteps && (
              <Button
                onClick={handleComplete}
                disabled={createAssessmentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createAssessmentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Complete Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}