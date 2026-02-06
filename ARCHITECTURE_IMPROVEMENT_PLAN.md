# Architecture Improvement Plan

**Date**: 2026-02-06  
**Status**: Pending Approval  
**Priority**: High  

## Executive Summary

This document outlines a comprehensive plan to improve the AI Adoption Strategist codebase by increasing modularity, reducing code duplication, and enhancing testability. The analysis identified **critical architectural issues** across 271 source files that impact maintainability, scalability, and code quality.

### Key Findings

- **51 direct LLM API calls** scattered across components without abstraction
- **30+ component directories** with poor organization and unclear boundaries
- **10 report generators** with 60-80% overlapping functionality
- **6 scenario engines** performing similar analysis with duplicated logic
- **779-line Results.jsx** page with mixed business/presentation logic
- **Zero test coverage** - no testing infrastructure exists
- **Hardcoded platform lists** repeated in 15+ files
- **Magic numbers** throughout (pricing, benchmarks, calculations)

### Impact Assessment

**Current State**: The codebase is becoming difficult to maintain and extend
- Adding new features requires changes in 5-10+ places
- High risk of bugs due to code duplication
- Impossible to unit test without major refactoring
- New developers face steep learning curve

**Improved State**: Modular, testable, maintainable architecture
- Single source of truth for business logic
- Easy to add new features and platforms
- Comprehensive test coverage
- Clear separation of concerns

---

## Problem Analysis

### 1. Code Duplication (Critical)

#### 1.1 Report Generation (10 files, ~2,500 lines)

**Current Files**:
```
src/components/reports/
├── ReportGenerator.jsx               (450 lines)
├── EnhancedReportGenerator.jsx       (520 lines) - 70% overlap with above
├── AutomatedReportGenerator.jsx      (380 lines) - 60% overlap
├── CustomReportGenerator.jsx         (310 lines)
├── AutomatedReportEngine.jsx         (290 lines) - similar to AutomatedReportGenerator
├── AutomatedReportDashboard.jsx      (200 lines)
├── ReportScheduler.jsx               (150 lines)
├── ScheduleReportModal.jsx           (100 lines)
├── ScheduledReportsList.jsx          (80 lines)
└── ReportPreview.jsx                 (120 lines)
```

**Issues**:
- 4 different "main" report generators with overlapping PDF/export logic
- Duplicate LLM calls for report content generation
- Inconsistent data formatting across generators
- No shared templates or factory pattern

**Impact**: 
- Bugs fixed in one generator don't propagate to others
- Feature additions require 4x the work
- ~1,500 lines of unnecessary code

#### 1.2 Scenario Analysis (6 files, ~1,800 lines)

**Current Files**:
```
src/components/scenarios/
├── CombinedScenarioEngine.jsx        (420 lines)
├── CombinedScenarioModeler.jsx       (380 lines) - 75% overlap with above
├── AdvancedScenarioEngine.jsx        (360 lines)
├── AdvancedScenarioModeler.jsx       (320 lines) - 70% overlap with above
├── ScenarioSimulationEngine.jsx      (250 lines)
└── PredictiveScenarioAnalytics.jsx   (180 lines)
```

**Issues**:
- "Engine" vs "Modeler" files do nearly identical work
- Duplicate scenario calculation logic
- Different interfaces for same operations
- No clear composition or inheritance

**Impact**:
- Confusion over which component to use
- Inconsistent scenario results
- ~900 lines of duplicate code

#### 1.3 Strategy Generation (7 files, ~1,400 lines)

**Files Include**:
- `StrategyAutomationEngine.jsx` (240 lines)
- `AutomatedStrategyGenerator.jsx` (220 lines) - similar to above
- `ScenarioPlanningEngine.jsx` (193 lines)
- Plus 4 more with overlapping functionality

**Issues**: Similar to scenario analysis - multiple implementations of strategy generation

#### 1.4 ROI Calculation (5+ locations)

**Files Containing `calculateROI` or similar**:
1. `src/components/assessment/CalculationEngine.jsx` ✓ (canonical)
2. `src/pages/Assessment.jsx` - inline calculations
3. `src/components/comparison/CostEstimationTool.jsx` - partial duplication
4. `src/components/results/ScenarioPlanner.jsx` - ROI in scenarios
5. `src/components/results/ScenarioComparison.jsx` - comparison ROI

**Issues**:
- Same calculation logic in multiple places
- Hardcoded values (50 weeks, $20 default pricing) repeated
- Different rounding/formatting approaches

### 2. Poor Component Organization (High Priority)

#### 2.1 Flat Component Structure

**Current**: 30 top-level component directories
```
src/components/
├── ai/                    (5 files)
├── assessment/            (15 files)
├── dashboard/             (18 files)
├── feedback/              (4 files)
├── results/               (12 files)
├── scenarios/             (6 files - should consolidate)
├── reports/               (10 files - should consolidate)
├── strategy/              (7 files - should consolidate)
├── comparison/            (6 files)
├── compliance/            (5 files)
├── implementation/        (6 files)
├── training/              (8 files)
├── ... (18 more directories)
```

**Issues**:
- No clear feature grouping
- Hard to find related components
- Unclear dependencies between directories

**Proposed**: Feature-based organization with shared UI library
```
src/
├── features/
│   ├── assessment/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── reports/
│   │   ├── components/
│   │   ├── services/
│   │   └── engines/
│   └── scenarios/
├── shared/
│   ├── components/ui/
│   ├── hooks/
│   └── utils/
└── services/
    ├── api/
    ├── llm/
    └── calculations/
```

#### 2.2 Oversized Page Components

**Current Issues**:
- `Results.jsx`: 779 lines with 11+ useState calls, API mutations, business logic
- `Assessment.jsx`: 244 lines with inline calculations
- `Dashboard.jsx`: 340 lines with direct entity queries

**Example from Results.jsx**:
```jsx
export default function Results() {
  const [assessmentId, setAssessmentId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [generatingScore, setGeneratingScore] = useState(false);
  const [implementationPlan, setImplementationPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showPlanInputs, setShowPlanInputs] = useState(false);
  const [selectedPlatformForFeedback, setSelectedPlatformForFeedback] = useState(null);
  const [reinforcementLearning, setReinforcementLearning] = useState(null);
  // ... 700+ more lines of mixed concerns
}
```

**Impact**: 
- Impossible to test individual features
- Hard to understand component responsibility
- Difficult to reuse logic

### 3. Hardcoded Values & Configuration (Medium Priority)

#### 3.1 Platform Lists

**Repeated in 15+ files**:
```javascript
const platforms = ['google_gemini', 'microsoft_copilot', 'anthropic_claude', 'openai_chatgpt'];
```

**Files**:
- `CalculationEngine.jsx` (lines 45, 50)
- `AssessmentData.jsx` 
- Multiple comparison components
- Report generators
- Scenario engines

**Risk**: 
- Adding/removing platforms requires 15+ file changes
- Inconsistent platform handling
- Typos causing bugs

#### 3.2 Magic Numbers

**Examples**:
```javascript
// CalculationEngine.jsx
const weeksPerYear = 50;  // line 10
const platformCost = (PLATFORM_PRICING[platform] || 20) * 12;  // line 14

// Assessment.jsx  
// Hardcoded 5-step wizard
const steps = 5;

// Results.jsx
const params = new URLSearchParams(window.location.search);  // line 55
```

**Issues**:
- Business rules embedded in code
- No central configuration
- Hard to adjust for different use cases

#### 3.3 Missing Configuration File

**Should have**:
```javascript
// src/config/constants.js
export const AI_PLATFORMS = [
  { id: 'google_gemini', name: 'Google Gemini', ... },
  { id: 'microsoft_copilot', name: 'Microsoft Copilot', ... },
  // ...
];

export const CALCULATION_CONSTANTS = {
  WEEKS_PER_YEAR: 50,
  DEFAULT_PRICING: 20,
  // ...
};
```

### 4. Business Logic in Presentation Layer (High Priority)

#### 4.1 Assessment.jsx

**Lines 77-115**: Complex calculation orchestration
```jsx
function Assessment() {
  // ... state setup
  
  const handleSubmit = async () => {
    // Calculation logic that should be in a service
    const roiData = calculateAllROI(formData.departments);
    const complianceData = assessCompliance(formData.compliance);
    const integrationData = assessIntegrations(formData.integrations);
    
    // API call logic
    const assessment = await base44.entities.Assessment.create({
      // ... data transformation that should be elsewhere
    });
  };
}
```

**Issues**:
- Calculation logic in event handler
- Data transformation in component
- No separation between UI and business logic

#### 4.2 Results.jsx

**Lines 54-95**: Mixed concerns
```jsx
// URL parsing in component
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// Direct API calls
const { data: assessment } = useQuery({
  queryKey: ['assessment', assessmentId],
  queryFn: async () => {
    const assessments = await base44.entities.Assessment.filter({ id: assessmentId });
    return assessments[0];
  },
  enabled: !!assessmentId
});

// Mutation logic inline
const exportPDFMutation = useMutation({
  mutationFn: async () => {
    const response = await base44.functions.invoke('exportPDF', { 
      assessmentId: assessmentId 
    });
    return response.data;
  },
  onSuccess: (data) => {
    // File handling logic in component
    const blob = new Blob([data], { type: 'application/pdf' });
    // ...
  }
});
```

**Should be**:
```jsx
function Results() {
  const { assessmentId } = useAssessmentFromRoute();
  const { assessment, isLoading } = useAssessment(assessmentId);
  const { exportPDF, isExporting } = useAssessmentExport();
  
  // Pure presentation logic only
}
```

### 5. No Abstraction for External Services (Critical)

#### 5.1 Direct LLM Calls

**51 occurrences of `InvokeLLM` across codebase**:
```javascript
// Repeated in 51 files:
const response = await base44.integrations.Core.InvokeLLM({
  provider: 'openai',
  prompt: '...',
  // ...
});
```

**Issues**:
- No error handling abstraction
- No retry logic
- No rate limiting
- Hard to mock for testing
- Impossible to switch providers globally

**Should have**:
```javascript
// src/services/llm/llmService.js
export class LLMService {
  async generateText(prompt, options = {}) {
    // Error handling, retries, rate limiting
    // Provider abstraction
    // Logging and monitoring
  }
  
  async analyzeData(data, analysis) {
    // Specialized method with proper error handling
  }
}

// In components:
import { llmService } from '@/services/llm';
const result = await llmService.generateText(prompt);
```

#### 5.2 Direct Base44 API Calls

**No API abstraction layer**:
```jsx
// Scattered throughout components:
await base44.entities.Assessment.create({ ... });
await base44.entities.Assessment.filter({ id: assessmentId });
await base44.functions.invoke('exportPDF', { ... });
```

**Should be**:
```javascript
// src/services/api/assessmentService.js
export const assessmentService = {
  async create(data) {
    // Validation, transformation, error handling
    return base44.entities.Assessment.create(data);
  },
  
  async getById(id) {
    // Caching, error handling
    const results = await base44.entities.Assessment.filter({ id });
    return results[0];
  }
};
```

### 6. Utility Organization (Medium Priority)

#### 6.1 Current Utils Structure

```
src/components/utils/
├── hooks.jsx              (Custom hooks)
├── formatters.jsx         (Date/number formatting)
├── FormatROI.jsx          (ROI-specific formatting)
├── constants.jsx          (Mixed constants)
├── dataTransformers.jsx   (Data transformation)
├── promptBuilder.jsx      (LLM prompt building)
└── aiOptimization.jsx     (AI optimization logic)

src/hooks/
├── useAssessmentFilters.js
├── useAIInsights.js
└── use-mobile.js
```

**Issues**:
- Unclear separation between utils and hooks
- Business logic (aiOptimization) mixed with utilities
- No clear categorization

#### 6.2 Proposed Structure

```
src/
├── hooks/                 (All custom hooks)
│   ├── useAssessment.js
│   ├── useAIInsights.js
│   └── use-mobile.js
├── utils/                 (Pure utility functions)
│   ├── formatters.js
│   ├── validators.js
│   └── transformers.js
├── services/              (Business logic)
│   ├── api/
│   ├── llm/
│   ├── calculations/
│   └── reports/
└── config/                (Configuration)
    ├── constants.js
    ├── platforms.js
    └── pricing.js
```

### 7. No Testing Infrastructure (Critical)

**Current State**: Zero test files found
```bash
$ find . -name "*.test.js" -o -name "*.spec.js"
# No results
```

**Consequences**:
- No confidence in refactoring
- Bugs caught only in production
- No documentation through tests
- Hard to onboard new developers

**Required**:
- Test framework setup (Vitest recommended for Vite projects)
- Unit tests for business logic (calculations, transformations)
- Integration tests for API services
- Component tests for critical UI flows
- E2E tests for key user journeys

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐           │
│  │   Pages    │─▶│ Components │─▶│   UI Lib    │           │
│  │ (Routing)  │  │  (Logic)   │  │  (shadcn)   │           │
│  └────────────┘  └────────────┘  └─────────────┘           │
│         │               │                                     │
└─────────┼───────────────┼─────────────────────────────────────┘
          │               │
          ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hook Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Custom     │  │   Data       │  │   UI State   │      │
│  │   Hooks      │  │   Hooks      │  │   Hooks      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                                  │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer (NEW)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API        │  │   LLM        │  │   Business   │      │
│  │   Service    │  │   Service    │  │   Logic      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                 │                │
└─────────┼──────────────────┼─────────────────┼────────────────┘
          │                  │                 │
          ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Base44     │  │   External   │  │    Config    │      │
│  │     SDK      │  │     APIs     │  │  (Constants) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

**Pages** (Routing only):
- Route parameters
- Page-level layouts
- Composed from features

**Components** (Presentation):
- UI rendering
- User interactions
- Call hooks for data/logic

**Hooks** (State Management):
- React Query integration
- Local state management
- Side effects orchestration

**Services** (Business Logic):
- API abstractions
- Calculations
- Data transformations
- External integrations

**Utils** (Pure Functions):
- Formatting
- Validation
- Type guards

**Config** (Constants):
- Platform definitions
- Business constants
- Environment config

---

## Implementation Plan

### Phase 1: Foundation - Configuration & Constants
**Priority**: P0 (Critical)  
**Effort**: 2-4 hours  
**Risk**: Low

#### Tasks
1. **Create configuration structure**
   ```
   src/config/
   ├── constants.js
   ├── platforms.js
   ├── pricing.js
   ├── benchmarks.js
   └── index.js
   ```

2. **Extract hardcoded values**
   - Move platform lists to `platforms.js`
   - Move pricing data to `pricing.js`
   - Move ROI benchmarks to `benchmarks.js`
   - Move magic numbers to `constants.js`

3. **Update imports**
   - Replace hardcoded arrays with config imports
   - Update 15+ files that reference platforms
   - Update calculation files with magic numbers

**Benefits**:
- Single source of truth for configuration
- Easy to add/modify platforms
- Foundation for other improvements

**Files to Create**:
- `/src/config/constants.js`
- `/src/config/platforms.js`
- `/src/config/pricing.js`
- `/src/config/benchmarks.js`

**Files to Modify** (~15 files):
- `/src/components/assessment/CalculationEngine.jsx`
- `/src/components/assessment/AssessmentData.jsx`
- All report generators
- All scenario engines
- Comparison components

### Phase 2: Service Layer - Core Abstractions
**Priority**: P0 (Critical)  
**Effort**: 6-8 hours  
**Risk**: Medium

#### 2.1 LLM Service Abstraction

**Create**: `/src/services/llm/llmService.js`
```javascript
export class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || 'openai';
    this.maxRetries = config.maxRetries || 3;
  }

  async generateText(prompt, options = {}) {
    let lastError;
    
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          provider: this.provider,
          prompt,
          ...options
        });
        return response;
      } catch (error) {
        lastError = error;
        if (i < this.maxRetries - 1) {
          await this.delay(Math.pow(2, i) * 1000);
        }
      }
    }
    
    throw lastError;
  }

  async generateReport(assessmentData, format = 'detailed') {
    // Specialized method with proper error handling
  }

  async analyzeScenario(scenarioData) {
    // Specialized scenario analysis
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const llmService = new LLMService();
```

**Impact**: 
- Reduce from 51 direct calls to single service
- Add error handling and retries
- Enable testing with mocks
- Centralize LLM configuration

**Files to Modify** (~51 files):
- All files with `InvokeLLM` calls
- Replace with `llmService.generateText()`

#### 2.2 API Service Layer

**Create**: `/src/services/api/`
```
api/
├── assessmentService.js
├── reportService.js
├── userService.js
└── index.js
```

**Example**: `/src/services/api/assessmentService.js`
```javascript
import { base44 } from '@/api/base44Client';

export const assessmentService = {
  async create(data) {
    // Validation
    if (!data.organization_id) {
      throw new Error('Organization ID is required');
    }
    
    // Transformation
    const normalized = {
      ...data,
      created_at: new Date().toISOString()
    };
    
    // API call with error handling
    try {
      return await base44.entities.Assessment.create(normalized);
    } catch (error) {
      console.error('Failed to create assessment:', error);
      throw new Error('Unable to create assessment. Please try again.');
    }
  },

  async getById(id) {
    const results = await base44.entities.Assessment.filter({ id });
    if (!results || results.length === 0) {
      throw new Error('Assessment not found');
    }
    return results[0];
  },

  async list(filters = {}) {
    return base44.entities.Assessment.filter(filters);
  },

  async update(id, data) {
    return base44.entities.Assessment.update(id, data);
  },

  async delete(id) {
    return base44.entities.Assessment.delete(id);
  }
};
```

**Benefits**:
- Consistent error handling
- Easier to test
- Can add caching layer
- Validation in one place

#### 2.3 Calculation Service

**Create**: `/src/services/calculations/roiCalculator.js`
```javascript
import { PLATFORMS, CALCULATION_CONSTANTS, ROI_BENCHMARKS, PLATFORM_PRICING } from '@/config';

export class ROICalculator {
  calculateROI(departments, platformId) {
    const { WEEKS_PER_YEAR } = CALCULATION_CONSTANTS;
    let totalAnnualSavings = 0;
    let totalCost = 0;
    const departmentBreakdown = [];

    departments.forEach(dept => {
      const hoursPerWeek = ROI_BENCHMARKS[dept.name]?.[platformId] || 0;
      const annualHoursSaved = hoursPerWeek * WEEKS_PER_YEAR * dept.user_count;
      const annualSavings = annualHoursSaved * dept.hourly_rate;
      
      const platformCost = this.getPlatformCost(platformId, dept.user_count);
      totalCost += platformCost;
      totalAnnualSavings += annualSavings;

      departmentBreakdown.push({
        department: dept.name,
        user_count: dept.user_count,
        hours_saved_per_user_per_week: hoursPerWeek,
        annual_hours_saved: annualHoursSaved,
        annual_savings: annualSavings,
        platform_cost: platformCost,
        net_savings: annualSavings - platformCost
      });
    });

    return {
      platform: platformId,
      total_annual_savings: totalAnnualSavings,
      total_cost: totalCost,
      net_annual_savings: totalAnnualSavings - totalCost,
      one_year_roi: this.calculateROIPercentage(totalAnnualSavings, totalCost, 1),
      three_year_roi: this.calculateROIPercentage(totalAnnualSavings, totalCost, 3),
      department_breakdown: departmentBreakdown
    };
  }

  calculateAllPlatforms(departments) {
    return PLATFORMS.map(platform => this.calculateROI(departments, platform.id));
  }

  getPlatformCost(platformId, userCount) {
    const { DEFAULT_PRICING, MONTHS_PER_YEAR } = CALCULATION_CONSTANTS;
    const monthlyPrice = PLATFORM_PRICING[platformId] || DEFAULT_PRICING;
    return monthlyPrice * MONTHS_PER_YEAR * userCount;
  }

  calculateROIPercentage(savings, cost, years) {
    if (cost === 0) return 0;
    return ((savings * years - cost) / cost) * 100;
  }
}

export const roiCalculator = new ROICalculator();
```

**Impact**:
- Single implementation of ROI calculation
- Easily testable with unit tests
- Can extend with new calculation methods
- Clear business logic separation

### Phase 3: Consolidate Duplicates
**Priority**: P1 (High)  
**Effort**: 8-12 hours  
**Risk**: Medium-High

#### 3.1 Report Engine Consolidation

**Create**: `/src/services/reports/ReportEngine.js`
```javascript
import { llmService } from '../llm/llmService';
import { reportTemplates } from './templates';

export class ReportEngine {
  constructor() {
    this.generators = {
      pdf: new PDFGenerator(),
      powerpoint: new PowerPointGenerator(),
      csv: new CSVGenerator()
    };
  }

  async generate(assessment, options = {}) {
    const {
      format = 'pdf',
      template = 'standard',
      includeAI = true,
      sections = ['all']
    } = options;

    // Collect data
    const reportData = await this.collectReportData(assessment, sections);
    
    // Generate AI insights if requested
    if (includeAI) {
      reportData.aiInsights = await this.generateAIInsights(assessment);
    }

    // Apply template
    const formattedData = reportTemplates[template](reportData);

    // Generate report in requested format
    const generator = this.generators[format];
    return generator.generate(formattedData);
  }

  async collectReportData(assessment, sections) {
    // Single implementation of data collection
  }

  async generateAIInsights(assessment) {
    return llmService.generateReport(assessment);
  }
}

export const reportEngine = new ReportEngine();
```

**Replace**:
- ReportGenerator.jsx → Use ReportEngine
- EnhancedReportGenerator.jsx → Delete (merge features)
- AutomatedReportGenerator.jsx → Delete (merge features)
- CustomReportGenerator.jsx → Delete (merge features)
- AutomatedReportEngine.jsx → Delete (duplicate)

**Create UI Component**: `/src/features/reports/components/ReportGenerator.jsx`
```jsx
import { reportEngine } from '@/services/reports/ReportEngine';

export function ReportGenerator({ assessment }) {
  const [options, setOptions] = useState({
    format: 'pdf',
    template: 'standard',
    includeAI: true
  });

  const { mutate: generateReport, isLoading } = useMutation({
    mutationFn: () => reportEngine.generate(assessment, options),
    onSuccess: (report) => {
      downloadReport(report, options.format);
    }
  });

  return (
    // UI for selecting options and triggering generation
  );
}
```

**Impact**:
- Reduce 10 files to 3-4
- Eliminate ~1,500 lines of duplicate code
- Single place to fix bugs
- Easier to add new formats

#### 3.2 Scenario Engine Consolidation

**Create**: `/src/services/scenarios/ScenarioEngine.js`
```javascript
export class ScenarioEngine {
  async analyze(baseScenario, options = {}) {
    const {
      method = 'combined', // 'basic', 'advanced', 'combined', 'predictive'
      depth = 'standard',
      includeSimulation = false
    } = options;

    // Route to appropriate analysis method
    const analyzer = this.getAnalyzer(method);
    let results = await analyzer.analyze(baseScenario);

    if (includeSimulation) {
      results.simulation = await this.simulate(results);
    }

    return results;
  }

  getAnalyzer(method) {
    const analyzers = {
      basic: new BasicAnalyzer(),
      advanced: new AdvancedAnalyzer(),
      combined: new CombinedAnalyzer(),
      predictive: new PredictiveAnalyzer()
    };
    return analyzers[method];
  }

  async simulate(scenario) {
    // Simulation logic consolidated here
  }
}
```

**Replace**:
- CombinedScenarioEngine.jsx → Use ScenarioEngine with method='combined'
- CombinedScenarioModeler.jsx → Delete (UI only, use unified component)
- AdvancedScenarioEngine.jsx → Becomes AdvancedAnalyzer class
- AdvancedScenarioModeler.jsx → Delete (duplicate UI)
- ScenarioSimulationEngine.jsx → Integrate into ScenarioEngine
- PredictiveScenarioAnalytics.jsx → Becomes PredictiveAnalyzer class

**Impact**:
- Reduce 6 files to 2
- Eliminate ~900 lines of duplicate code
- Consistent scenario analysis
- Easier to add new analysis methods

#### 3.3 Strategy Engine Consolidation

Similar approach to scenario engine - consolidate 7 files into 1 service with multiple strategy generation methods.

### Phase 4: Component Restructuring
**Priority**: P2 (Medium)  
**Effort**: 10-15 hours  
**Risk**: Medium

#### 4.1 Feature-Based Organization

**Migrate to**:
```
src/
├── features/
│   ├── assessment/
│   │   ├── components/
│   │   │   ├── AssessmentWizard.jsx
│   │   │   ├── AssessmentCard.jsx
│   │   │   └── QuestionForm.jsx
│   │   ├── hooks/
│   │   │   ├── useAssessment.js
│   │   │   └── useAssessmentForm.js
│   │   ├── services/
│   │   │   └── assessmentLogic.js
│   │   └── types/
│   │       └── assessment.types.js
│   │
│   ├── reports/
│   │   ├── components/
│   │   │   ├── ReportGenerator.jsx
│   │   │   ├── ReportPreview.jsx
│   │   │   └── ReportScheduler.jsx
│   │   └── services/
│   │       └── reportEngine.js (moved from services/)
│   │
│   ├── scenarios/
│   ├── dashboard/
│   └── results/
│
├── shared/
│   ├── components/
│   │   └── ui/  (shadcn components)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── use-mobile.js
│   │   └── useToast.js
│   └── utils/
│       ├── formatters.js
│       └── validators.js
│
└── services/
    ├── api/
    ├── llm/
    ├── calculations/
    └── integrations/
```

**Migration Steps**:
1. Create new directory structure
2. Move files to appropriate feature directories
3. Update imports (use find/replace with path aliases)
4. Test each feature independently

**Benefits**:
- Clear feature boundaries
- Easier to find related code
- Better code colocation
- Supports feature-based development

#### 4.2 Extract Reusable Components

**Identify and extract**:
- Common form inputs → shared/components/forms
- Common data displays → shared/components/data
- Loading states → shared/components/loading
- Error boundaries → shared/components/errors

### Phase 5: Extract Business Logic from Pages
**Priority**: P1 (High)  
**Effort**: 8-10 hours  
**Risk**: Medium

#### 5.1 Refactor Results.jsx

**Current**: 779 lines, 11+ useState calls, mixed concerns

**Create Custom Hooks**:

`/src/features/results/hooks/useResults.js`:
```javascript
export function useResults(assessmentId) {
  const { data: assessment, isLoading } = useAssessment(assessmentId);
  const { exportPDF, exportPowerPoint } = useAssessmentExport();
  const { aiInsights, isLoadingInsights } = useAIInsights(assessment);
  const { implementationPlan, generatePlan } = useImplementationPlan(assessment);

  return {
    assessment,
    isLoading,
    exportPDF,
    exportPowerPoint,
    aiInsights,
    isLoadingInsights,
    implementationPlan,
    generatePlan
  };
}
```

`/src/features/results/hooks/useAssessmentExport.js`:
```javascript
export function useAssessmentExport() {
  const queryClient = useQueryClient();

  const exportPDF = useMutation({
    mutationFn: (assessmentId) => reportEngine.generate(assessmentId, { format: 'pdf' }),
    onSuccess: (data) => {
      downloadFile(data, 'application/pdf', 'assessment.pdf');
      toast.success('PDF exported successfully');
    }
  });

  const exportPowerPoint = useMutation({
    mutationFn: (assessmentId) => reportEngine.generate(assessmentId, { format: 'pptx' }),
    onSuccess: (data) => {
      downloadFile(data, 'application/vnd.ms-powerpoint', 'assessment.pptx');
      toast.success('PowerPoint exported successfully');
    }
  });

  return { exportPDF, exportPowerPoint };
}
```

**Refactored**: `/src/pages/Results.jsx`
```jsx
export default function Results() {
  const { assessmentId } = useAssessmentFromRoute();
  const {
    assessment,
    isLoading,
    exportPDF,
    exportPowerPoint,
    aiInsights,
    implementationPlan,
    generatePlan
  } = useResults(assessmentId);

  if (isLoading) return <LoadingSpinner />;
  if (!assessment) return <NotFound />;

  return (
    <div className="results-container">
      <ResultsHeader 
        assessment={assessment}
        onExportPDF={exportPDF}
        onExportPowerPoint={exportPowerPoint}
      />
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ResultsOverview 
            assessment={assessment}
            insights={aiInsights}
          />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsList assessment={assessment} />
        </TabsContent>

        <TabsContent value="implementation">
          <ImplementationPlanView 
            plan={implementationPlan}
            onGenerate={generatePlan}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Impact**:
- Reduce from 779 lines to ~100 lines
- Clear separation of concerns
- Testable business logic
- Reusable hooks

#### 5.2 Refactor Assessment.jsx

Similar approach:
- Extract form logic to `useAssessmentForm`
- Extract calculation to calculationService
- Extract submission to `useAssessmentSubmit`
- Keep only UI rendering in page

#### 5.3 Refactor Dashboard.jsx

- Extract data fetching to `useDashboardData`
- Extract anomaly detection to service
- Extract widget management to `useDashboardWidgets`

### Phase 6: Testing Infrastructure
**Priority**: P0 (Critical)  
**Effort**: 12-16 hours  
**Risk**: Low

#### 6.1 Setup Testing Framework

**Install Vitest**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @vitejs/plugin-react
```

**Create**: `/vitest.config.js`
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Create**: `/tests/setup.js`
```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Update**: `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 6.2 Unit Tests for Services

**Create**: `/src/services/calculations/__tests__/roiCalculator.test.js`
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { roiCalculator } from '../roiCalculator';

describe('ROICalculator', () => {
  const mockDepartments = [
    {
      name: 'engineering',
      user_count: 50,
      hourly_rate: 100
    }
  ];

  describe('calculateROI', () => {
    it('should calculate ROI correctly for a single department', () => {
      const result = roiCalculator.calculateROI(mockDepartments, 'google_gemini');
      
      expect(result).toHaveProperty('total_annual_savings');
      expect(result).toHaveProperty('total_cost');
      expect(result).toHaveProperty('one_year_roi');
      expect(result.total_annual_savings).toBeGreaterThan(0);
    });

    it('should handle zero user count', () => {
      const zeroDepts = [{ name: 'engineering', user_count: 0, hourly_rate: 100 }];
      const result = roiCalculator.calculateROI(zeroDepts, 'google_gemini');
      
      expect(result.total_annual_savings).toBe(0);
    });

    it('should calculate department breakdown correctly', () => {
      const result = roiCalculator.calculateROI(mockDepartments, 'google_gemini');
      
      expect(result.department_breakdown).toHaveLength(1);
      expect(result.department_breakdown[0]).toHaveProperty('department', 'engineering');
      expect(result.department_breakdown[0]).toHaveProperty('annual_savings');
    });
  });

  describe('calculateAllPlatforms', () => {
    it('should calculate ROI for all platforms', () => {
      const results = roiCalculator.calculateAllPlatforms(mockDepartments);
      
      expect(results).toHaveLength(4); // 4 platforms
      results.forEach(result => {
        expect(result).toHaveProperty('platform');
        expect(result).toHaveProperty('one_year_roi');
      });
    });
  });
});
```

**Create**: `/src/services/llm/__tests__/llmService.test.js`
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMService } from '../llmService';

describe('LLMService', () => {
  let llmService;
  let mockBase44;

  beforeEach(() => {
    mockBase44 = {
      integrations: {
        Core: {
          InvokeLLM: vi.fn()
        }
      }
    };
    
    llmService = new LLMService({ maxRetries: 3 });
  });

  describe('generateText', () => {
    it('should successfully generate text on first try', async () => {
      const mockResponse = { text: 'Generated content' };
      mockBase44.integrations.Core.InvokeLLM.mockResolvedValue(mockResponse);

      const result = await llmService.generateText('Test prompt');

      expect(result).toEqual(mockResponse);
      expect(mockBase44.integrations.Core.InvokeLLM).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      mockBase44.integrations.Core.InvokeLLM
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ text: 'Success' });

      const result = await llmService.generateText('Test prompt');

      expect(result.text).toBe('Success');
      expect(mockBase44.integrations.Core.InvokeLLM).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      mockBase44.integrations.Core.InvokeLLM.mockRejectedValue(new Error('Persistent error'));

      await expect(llmService.generateText('Test prompt')).rejects.toThrow('Persistent error');
      expect(mockBase44.integrations.Core.InvokeLLM).toHaveBeenCalledTimes(3);
    });
  });
});
```

#### 6.3 Integration Tests

**Create**: `/src/services/api/__tests__/assessmentService.test.js`
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assessmentService } from '../assessmentService';
import { base44 } from '@/api/base44Client';

vi.mock('@/api/base44Client');

describe('assessmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an assessment', async () => {
      const mockAssessment = { id: '123', name: 'Test Assessment' };
      base44.entities.Assessment.create.mockResolvedValue(mockAssessment);

      const data = { name: 'Test Assessment', organization_id: 'org-123' };
      const result = await assessmentService.create(data);

      expect(result).toEqual(mockAssessment);
      expect(base44.entities.Assessment.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Assessment' })
      );
    });

    it('should throw error if organization_id is missing', async () => {
      await expect(assessmentService.create({ name: 'Test' }))
        .rejects.toThrow('Organization ID is required');
    });
  });

  describe('getById', () => {
    it('should return assessment by id', async () => {
      const mockAssessment = { id: '123', name: 'Test' };
      base44.entities.Assessment.filter.mockResolvedValue([mockAssessment]);

      const result = await assessmentService.getById('123');

      expect(result).toEqual(mockAssessment);
    });

    it('should throw error if assessment not found', async () => {
      base44.entities.Assessment.filter.mockResolvedValue([]);

      await expect(assessmentService.getById('999'))
        .rejects.toThrow('Assessment not found');
    });
  });
});
```

#### 6.4 Component Tests

**Create**: `/src/features/assessment/components/__tests__/AssessmentCard.test.jsx`
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssessmentCard } from '../AssessmentCard';

describe('AssessmentCard', () => {
  const mockAssessment = {
    id: '123',
    name: 'Test Assessment',
    status: 'completed',
    score: 85,
    created_at: '2026-01-01T00:00:00Z'
  };

  it('should render assessment details', () => {
    render(<AssessmentCard assessment={mockAssessment} />);

    expect(screen.getByText('Test Assessment')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('should display correct status badge', () => {
    render(<AssessmentCard assessment={mockAssessment} />);

    const statusBadge = screen.getByText('completed');
    expect(statusBadge).toHaveClass('badge-success'); // or appropriate class
  });
});
```

#### 6.5 Coverage Goals

**Initial Goals** (after Phase 6):
- Services: 80% coverage
- Utils: 90% coverage
- Hooks: 70% coverage
- Components: 50% coverage (focus on critical paths)

**Commands**:
```bash
npm run test              # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm run test:ui           # Open Vitest UI
```

### Phase 7: Documentation Updates
**Priority**: P2 (Medium)  
**Effort**: 4-6 hours  
**Risk**: Low

#### Tasks

1. **Update ARCHITECTURE.md**
   - Add new service layer diagrams
   - Document feature-based structure
   - Update data flow diagrams
   - Add testing section

2. **Create SERVICE_LAYER.md**
   - Document all services
   - API examples
   - Best practices

3. **Create TESTING_GUIDE.md**
   - Running tests
   - Writing new tests
   - Coverage requirements
   - Mocking strategies

4. **Update CONTRIBUTING.md**
   - New directory structure
   - Where to add code
   - Testing requirements

5. **Create migration guide**
   - How to find old code in new structure
   - Import path changes
   - Breaking changes

---

## Implementation Timeline

### Week 1: Foundation
- **Day 1-2**: Phase 1 (Configuration)
- **Day 3-5**: Phase 2 (Service Layer)

### Week 2: Consolidation
- **Day 1-3**: Phase 3 (Consolidate Duplicates)
- **Day 4-5**: Phase 4 (Component Restructuring) - Start

### Week 3: Refinement
- **Day 1-2**: Phase 4 (Component Restructuring) - Complete
- **Day 3-5**: Phase 5 (Extract Business Logic)

### Week 4: Testing & Documentation
- **Day 1-3**: Phase 6 (Testing Infrastructure)
- **Day 4-5**: Phase 7 (Documentation)

**Total Effort**: 50-70 hours (2-4 weeks depending on team size)

---

## Risk Assessment

### High Risks

1. **Breaking Existing Functionality**
   - **Mitigation**: Implement comprehensive tests before refactoring
   - **Mitigation**: Refactor incrementally, one feature at a time
   - **Mitigation**: Maintain parallel implementations during transition

2. **Import Path Changes Breaking Production**
   - **Mitigation**: Use TypeScript/JSConfig path aliases
   - **Mitigation**: Update all imports in single commit per feature
   - **Mitigation**: Use find/replace with verification

3. **Developer Confusion During Transition**
   - **Mitigation**: Create migration guide
   - **Mitigation**: Update documentation immediately
   - **Mitigation**: Keep both old and new patterns for 1 sprint

### Medium Risks

1. **Testing Infrastructure Setup**
   - **Mitigation**: Start simple, expand coverage gradually
   - **Mitigation**: Focus on services first (highest ROI)

2. **Service Layer Over-Abstraction**
   - **Mitigation**: Start with thin wrappers, add features as needed
   - **Mitigation**: Avoid premature optimization

### Low Risks

1. **Configuration Management**
   - Easy to revert if needed
   - Low impact on existing code initially

---

## Success Metrics

### Code Quality
- ✅ Reduce duplicate code by 60%+ (~2,500 lines eliminated)
- ✅ Reduce average file size from 250 lines to 150 lines
- ✅ Reduce component directory count from 30 to 15
- ✅ Zero hardcoded platform lists (currently 15+)

### Testability
- ✅ 80% test coverage for services
- ✅ 70% test coverage for hooks
- ✅ 50% test coverage for components
- ✅ All new code includes tests

### Maintainability
- ✅ Single implementation of ROI calculation (currently 5+)
- ✅ Single implementation of report generation (currently 4+)
- ✅ Single LLM service abstraction (currently 51 direct calls)
- ✅ Clear separation of concerns (business logic out of pages)

### Developer Experience
- ✅ New feature takes <2 hours to implement
- ✅ Bug fix requires changing 1-2 files (currently 5+)
- ✅ New developer productive in <1 day
- ✅ Clear documentation for all services

---

## Rollback Plan

If issues arise during implementation:

### Phase Rollback
Each phase is independent and can be rolled back:
1. Revert commits for that phase
2. Restore backup of modified files
3. Continue with other phases

### Feature Flag Approach
For risky changes:
1. Keep old implementation alongside new
2. Use feature flag to switch between them
3. Monitor metrics for both implementations
4. Remove old implementation after 1 sprint of stability

### Incremental Migration
- New code uses new patterns
- Old code remains until explicitly migrated
- No "big bang" cutover required

---

## Alternative Approaches Considered

### 1. Microservices Architecture
**Rejected**: Over-engineering for current scale
- Would add deployment complexity
- Not needed until 10x scale increase
- Can adopt later if needed

### 2. GraphQL API Layer
**Deferred**: Adds value but not critical
- Current REST API works well
- Can add later as abstraction layer
- Focus on service layer first

### 3. Monorepo with Packages
**Deferred**: Premature for current size
- Adds complexity to build process
- Not needed until multi-app scenario
- Current structure sufficient with good organization

### 4. Complete Rewrite
**Rejected**: Too risky, too slow
- Would take months
- High risk of breaking functionality
- Incremental refactor is safer and faster

---

## Next Steps

### Immediate (Upon Approval)
1. ✅ Review and approve this plan
2. Create GitHub project for tracking
3. Create feature branch for Phase 1
4. Begin Phase 1 implementation

### First Week
1. Implement Phase 1 (Configuration)
2. Implement Phase 2 (Service Layer)
3. Create baseline tests
4. Document progress

### Ongoing
1. Weekly sync on progress
2. Code reviews for each phase
3. Update metrics dashboard
4. Adjust plan based on learnings

---

## Questions for Stakeholders

Before implementation, please address:

1. **Timeline**: Is 2-4 week timeline acceptable?
2. **Priorities**: Should any phase be prioritized differently?
3. **Feature Freeze**: Should we freeze new features during refactor?
4. **Testing**: What is minimum acceptable test coverage?
5. **Breaking Changes**: Acceptable to have minor API changes?
6. **Resources**: How many developers can work on this?
7. **Deployment**: Can we deploy incrementally or need big release?

---

## Appendix

### A. File Migration Map

**Configuration**:
- `src/components/assessment/AssessmentData.jsx` → `src/config/platforms.js`
- Hardcoded arrays → `src/config/constants.js`

**Services**:
- LLM calls from 51 files → `src/services/llm/llmService.js`
- API calls → `src/services/api/*.js`
- Calculations → `src/services/calculations/*.js`

**Reports** (10 → 3 files):
- `ReportGenerator.jsx` → UI component
- `EnhancedReportGenerator.jsx` → Delete (merge to service)
- `AutomatedReportGenerator.jsx` → Delete (merge to service)
- `CustomReportGenerator.jsx` → Delete (merge to service)
- `AutomatedReportEngine.jsx` → Delete (duplicate)
- New: `src/services/reports/ReportEngine.js`
- New: `src/features/reports/components/ReportGenerator.jsx`

**Scenarios** (6 → 2 files):
- All engines → `src/services/scenarios/ScenarioEngine.js`
- UI components → `src/features/scenarios/components/`

### B. Dependency Graph

```
Pages
  ↓
Hooks (useAssessment, useReports, etc.)
  ↓
Services (assessmentService, reportEngine, llmService)
  ↓
Utils (formatters, validators)
  ↓
Config (constants, platforms)
  ↓
Base44 SDK
```

### C. Import Path Changes

**Before**:
```javascript
import { calculateROI } from '../components/assessment/CalculationEngine';
import { base44 } from '@/api/base44Client';
```

**After**:
```javascript
import { roiCalculator } from '@/services/calculations/roiCalculator';
import { assessmentService } from '@/services/api/assessmentService';
```

### D. Test File Locations

```
src/
├── services/
│   ├── api/
│   │   ├── assessmentService.js
│   │   └── __tests__/
│   │       └── assessmentService.test.js
│   ├── llm/
│   │   ├── llmService.js
│   │   └── __tests__/
│   │       └── llmService.test.js
│   └── calculations/
│       ├── roiCalculator.js
│       └── __tests__/
│           └── roiCalculator.test.js
├── features/
│   └── assessment/
│       ├── components/
│       │   ├── AssessmentCard.jsx
│       │   └── __tests__/
│       │       └── AssessmentCard.test.jsx
│       └── hooks/
│           ├── useAssessment.js
│           └── __tests__/
│               └── useAssessment.test.js
```

---

## Conclusion

This plan provides a comprehensive roadmap to transform the AI Adoption Strategist codebase from a monolithic, duplicative structure into a modular, testable, and maintainable architecture. The phased approach minimizes risk while delivering incremental value.

**Key Benefits**:
- 60% reduction in code duplication (~2,500 lines)
- 80%+ test coverage for critical business logic
- Clear separation of concerns
- Improved developer productivity
- Foundation for future scaling

**Recommendation**: Approve this plan and begin with Phase 1 (Configuration & Constants) as it provides immediate value with minimal risk.

---

**Prepared by**: Senior Software Architect  
**Date**: 2026-02-06  
**Status**: Awaiting Approval
