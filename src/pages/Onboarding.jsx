import React from 'react';
import { GraduationCap } from 'lucide-react';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Onboarding Center
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Your personalized AI adoption journey
            </p>
          </div>
        </div>

        <OnboardingWizard />
      </div>
    </div>
  );
}