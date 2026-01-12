/**
 * Role-Based Assessment Questions
 * Extracts specific concerns from each stakeholder role
 */

export const ROLE_BASED_QUESTIONS = {
  startup_founder: {
    role: 'Startup Founder / CEO',
    icon: '🚀',
    questions: [
      {
        id: 'speed_to_market',
        question: 'How critical is speed-to-market for your AI adoption?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Not critical', 'Critical'] },
        rationale: 'Founders prioritize rapid deployment and user adoption'
      },
      {
        id: 'hallucination_tolerance',
        question: 'Are you willing to tolerate occasional AI hallucinations for faster iteration?',
        type: 'boolean',
        rationale: 'Founders may accept imperfection for velocity'
      },
      {
        id: 'viral_features',
        question: 'Do you want AI features that encourage viral team collaboration?',
        type: 'boolean',
        rationale: 'Founders value features that create growth loops'
      }
    ]
  },
  engineering_manager: {
    role: 'Engineering Manager',
    icon: '🏗️',
    questions: [
      {
        id: 'maintainability_priority',
        question: 'How important is long-term code maintainability vs. quick prototyping?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Prototype fast', 'Maintainable always'] },
        rationale: 'Engineering Managers care about Day 2 operations'
      },
      {
        id: 'explainability_required',
        question: 'Do your developers need to understand every line of AI-generated code?',
        type: 'boolean',
        rationale: 'Engineers need explainability for maintenance'
      },
      {
        id: 'audit_trail_importance',
        question: 'How critical are audit trails for tracking who changed what?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Not needed', 'Essential'] },
        rationale: 'Managers need accountability in collaborative environments'
      }
    ]
  },
  frontend_developer: {
    role: 'Frontend Developer',
    icon: '🎨',
    questions: [
      {
        id: 'design_system_exists',
        question: 'Do you have an existing design system or component library?',
        type: 'boolean',
        rationale: 'Frontend devs need AI to understand their UI patterns'
      },
      {
        id: 'visual_regression_needed',
        question: 'Do you need automated visual regression testing for UI changes?',
        type: 'boolean',
        rationale: 'Frontend devs worry about AI breaking visual consistency'
      },
      {
        id: 'instant_feedback_critical',
        question: 'How important is instant visual feedback (HMR) for UI changes?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Can wait', 'Must be instant'] },
        rationale: 'Frontend devs need tight feedback loops'
      }
    ]
  },
  backend_developer: {
    role: 'Backend Developer',
    icon: '⚙️',
    questions: [
      {
        id: 'api_schema_complexity',
        question: 'How complex are your API schemas and database migrations?',
        type: 'select',
        options: ['Simple', 'Moderate', 'Complex', 'Very Complex'],
        rationale: 'Backend devs need AI to understand their data models'
      },
      {
        id: 'load_testing_required',
        question: 'Do AI-generated endpoints need automated load testing?',
        type: 'boolean',
        rationale: 'Backend devs worry about unoptimized AI code under load'
      },
      {
        id: 'git_workflow_preference',
        question: 'Do you prefer branch-based development or live collaboration?',
        type: 'select',
        options: ['Asynchronous Git', 'Live multiplayer', 'Hybrid'],
        rationale: 'Backend devs often prefer traditional Git workflows'
      }
    ]
  },
  security_engineer: {
    role: 'Security Engineer',
    icon: '🔒',
    questions: [
      {
        id: 'pii_handling',
        question: 'Does your application handle PII or sensitive customer data?',
        type: 'boolean',
        rationale: 'Security engineers need PII scanning in AI context'
      },
      {
        id: 'security_defaults_critical',
        question: 'Should AI-generated code have security-first defaults (even if less convenient)?',
        type: 'boolean',
        rationale: 'Security engineers prioritize secure defaults over convenience'
      },
      {
        id: 'sast_integration',
        question: 'Do you need Static Application Security Testing (SAST) integrated into AI suggestions?',
        type: 'boolean',
        rationale: 'Security engineers want to catch vulnerabilities early'
      }
    ]
  },
  qa_specialist: {
    role: 'QA Specialist',
    icon: '🧪',
    questions: [
      {
        id: 'test_coverage_requirement',
        question: 'What level of test coverage do you require?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Basic smoke tests', '90%+ coverage'] },
        rationale: 'QA specialists need real testing, not just demos'
      },
      {
        id: 'accessibility_compliance',
        question: 'Do you need WCAG accessibility compliance for UI components?',
        type: 'boolean',
        rationale: 'QA specialists ensure accessibility standards'
      },
      {
        id: 'edge_case_testing',
        question: 'How important is edge case and negative testing?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Happy path only', 'All scenarios'] },
        rationale: 'QA specialists catch what AI might miss'
      }
    ]
  },
  ux_designer: {
    role: 'UX Designer',
    icon: '✨',
    questions: [
      {
        id: 'confidence_visibility',
        question: 'Should users see AI confidence scores for suggestions?',
        type: 'boolean',
        rationale: 'UX designers want transparency over magic'
      },
      {
        id: 'progressive_disclosure',
        question: 'Do you prefer progressive disclosure (show basics first) or full transparency?',
        type: 'select',
        options: ['Progressive', 'Full upfront', 'User choice'],
        rationale: 'UX designers prevent overwhelming users'
      },
      {
        id: 'error_handling_style',
        question: 'How should errors be communicated?',
        type: 'select',
        options: ['Conversational ("Let me help...")', 'Technical (stack traces)', 'Hybrid'],
        rationale: 'UX designers humanize error experiences'
      }
    ]
  },
  documentation_specialist: {
    role: 'Documentation Specialist',
    icon: '📚',
    questions: [
      {
        id: 'auto_documentation',
        question: 'Should AI automatically generate README and getting started guides?',
        type: 'boolean',
        rationale: 'Doc specialists ensure projects are documented'
      },
      {
        id: 'citation_importance',
        question: 'How important are citations/sources for AI-generated code?',
        type: 'scale',
        scale: { min: 1, max: 5, labels: ['Not needed', 'Essential'] },
        rationale: 'Doc specialists need verifiable sources'
      },
      {
        id: 'tutorial_mode',
        question: 'Do you want AI to explain why tests fail (tutorial mode)?',
        type: 'boolean',
        rationale: 'Doc specialists create learning experiences'
      }
    ]
  },
  observability_lead: {
    role: 'Observability Lead',
    icon: '📊',
    questions: [
      {
        id: 'logging_detail',
        question: 'What level of logging detail do you need?',
        type: 'select',
        options: ['Minimal', 'Standard', 'Verbose', 'Full trace'],
        rationale: 'Observability needs visibility into AI operations'
      },
      {
        id: 'performance_monitoring',
        question: 'Do you need real-time performance metrics for AI-generated code?',
        type: 'boolean',
        rationale: 'Observability tracks AI code performance'
      },
      {
        id: 'error_aggregation',
        question: 'Should AI errors be aggregated and analyzed for patterns?',
        type: 'boolean',
        rationale: 'Observability identifies systemic issues'
      }
    ]
  }
};

export function getQuestionsForRoles(selectedRoles) {
  return selectedRoles.map(role => ROLE_BASED_QUESTIONS[role]).filter(Boolean);
}