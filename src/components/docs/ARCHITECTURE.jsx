export const ARCHITECTURE = `# System Architecture

## High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Pages   │ │Components│ │  Agents  │ │  Hooks   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Base44 SDK)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Entities │ │Functions │ │Integrations│ │  Auth   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend Services (Deno Deploy)                     │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │ Serverless     │  │  AI Services   │                    │
│  │ Functions      │  │  Integration   │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (Base44 DB)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Assessments│ │Strategies│ │ Users    │ │AI Logs   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Component Architecture

### Frontend Components

#### Pages (Top-Level Routes)
- **Home**: Landing and quick access dashboard
- **Assessment**: AI readiness assessment wizard
- **Results**: Assessment results and recommendations
- **StrategyAutomation**: Strategy generation and management
- **AIAgentHub**: Conversational AI agents interface
- **Analytics**: Data analytics and insights
- **Training**: Learning modules and progress tracking
- **AIGovernance**: Usage monitoring and compliance
- **RiskMonitoring**: Risk alerts and mitigation
- **ExecutiveDashboard**: C-level summary views
- **Settings**: User preferences and configuration

#### Reusable Components
- **UI Components** (shadcn/ui): Buttons, Cards, Dialogs, Forms, etc.
- **Assessment Components**: Wizard steps, calculation engines
- **Strategy Components**: Roadmap viewers, risk analysis
- **Agent Components**: Chat interfaces, collaboration tools
- **Governance Components**: Usage analytics, bias monitoring
- **Analytics Components**: Charts, predictive models

### Backend Functions (Deno Deploy)

All functions follow this pattern:
\`\`\`javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Function logic
    
    return Response.json({ data });
});
\`\`\`

**Key Functions**:
- \`automatedBiasScan\`: Scheduled bias detection
- \`exportPDF\`: Generate PDF reports
- \`exportPowerPoint\`: Generate presentations

## Data Model

### Core Entities

#### Assessment
Stores organizational AI readiness evaluations.

**Key Fields**:
- \`organization_name\`: string
- \`departments\`: array of { name, user_count, annual_spend }
- \`business_goals\`: array of strings
- \`technical_constraints\`: object
- \`budget_constraints\`: object
- \`compliance_requirements\`: array
- \`recommended_platforms\`: array (AI-generated)
- \`ai_assessment_score\`: object

#### AdoptionStrategy
Strategic roadmaps for AI implementation.

**Key Fields**:
- \`assessment_id\`: reference to Assessment
- \`platform\`: selected AI platform
- \`roadmap\`: object with phases, quick wins, goals
- \`risk_analysis\`: object with identified risks
- \`milestones\`: array of milestone objects
- \`progress_tracking\`: object

#### ImplementationPlan
Detailed implementation plans with stakeholder analysis.

**Key Fields**:
- \`assessment_id\`: reference
- \`strategy_id\`: reference
- \`plan_data\`: comprehensive plan structure
- \`stakeholder_analysis\`: multi-stakeholder perspectives
- \`status\`: draft | approved | in_progress

#### AIUsageLog
Audit trail for all AI interactions.

**Key Fields**:
- \`user_email\`: string
- \`agent_name\`: string
- \`interaction_type\`: enum
- \`prompt\`: string
- \`response\`: string
- \`tokens_used\`: number
- \`cost\`: number
- \`bias_flags\`: array

#### BiasMonitoring
Automated bias scan results.

**Key Fields**:
- \`agent_name\`: string
- \`sample_size\`: number
- \`bias_metrics\`: object with scores
- \`detected_issues\`: array with mitigation strategies
- \`policy_recommendations\`: array
- \`risk_level\`: enum

### Entity Relationships

\`\`\`
Assessment (1) ──→ (N) AdoptionStrategy
           \\
            ──→ (N) ImplementationPlan
            ──→ (N) TrainingModule
            
AdoptionStrategy (1) ──→ (N) StrategyCheckpoint
                 (1) ──→ (N) BudgetScenario
                 (1) ──→ (N) RiskAlert
                 
ImplementationPlan (1) ──→ (N) Task

AIUsageLog ──→ BiasMonitoring (analysis relationship)
\`\`\`

## Integration Architecture

### AI Service Integration

\`\`\`javascript
// Standard LLM call pattern
const response = await base44.integrations.Core.InvokeLLM({
    prompt: "Your detailed prompt",
    response_json_schema: {
        type: "object",
        properties: {
            // Define expected structure
        }
    },
    add_context_from_internet: true, // Enable web search
    file_urls: ["url1", "url2"] // Optional file context
});
\`\`\`

### Real-Time Features

**Entity Subscriptions**:
\`\`\`javascript
useEffect(() => {
    const unsubscribe = base44.entities.EntityName.subscribe((event) => {
        if (event.type === 'create') { /* handle */ }
        if (event.type === 'update') { /* handle */ }
        if (event.type === 'delete') { /* handle */ }
    });
    return unsubscribe;
}, []);
\`\`\`

## Security Architecture

### Authentication Flow

1. User accesses application
2. Base44 Auth checks session
3. If unauthenticated, redirect to login
4. After login, JWT token stored
5. All API calls include auth token
6. Backend validates token + RBAC

### Authorization Layers

- **Frontend**: Route guards based on user role
- **Backend**: Function-level checks via \`base44.auth.me()\`
- **Database**: Entity-level permissions via Base44

### Data Encryption

- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.3
- **Secrets**: Environment variables, never in code

## Scalability Considerations

### Current Scale
- **Users**: Up to 10,000 concurrent
- **Assessments**: Unlimited
- **AI Calls**: Rate-limited by Base44 (fair use)

### Performance Optimization
- **React Query**: Caching and background refetching
- **Code Splitting**: Lazy-loaded routes
- **Image Optimization**: CDN-served assets
- **Database Indexing**: Automatic via Base44

### Monitoring
- **Frontend**: Error boundaries, performance metrics
- **Backend**: Function logs via Deno Deploy console
- **AI Usage**: Tracked in AIUsageLog entity
- **Costs**: Monitored via governance dashboard
`;