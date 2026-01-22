export const AI_SERVICES = `# AI Services Documentation

## Overview

The INT Inc. AI Platform leverages advanced Large Language Models (LLMs) for intelligent automation, analysis, and decision support across all modules.

## AI Service Architecture

\`\`\`
┌─────────────────────────────────────────────────────┐
│         Application Layer (Frontend/Backend)        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│           Base44 InvokeLLM Integration              │
│  ┌──────────────────────────────────────────────┐  │
│  │  • Prompt Engineering                        │  │
│  │  • Schema Validation                         │  │
│  │  • Web Context Injection                     │  │
│  │  • File/Vision Processing                    │  │
│  └──────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              LLM Providers (Primary)                │
│  • Google Gemini (Primary)                          │
│  • OpenAI GPT-4                                     │
│  • Anthropic Claude                                 │
│  • Microsoft Azure OpenAI                           │
└─────────────────────────────────────────────────────┘
\`\`\`

## Core AI Capabilities

### 1. Assessment Intelligence

**Purpose**: Analyze organizational data to generate AI readiness scores and platform recommendations.

**Implementation**:
\`\`\`javascript
const assessment = await base44.integrations.Core.InvokeLLM({
    prompt: \`Analyze this organization's AI readiness:
    
    Organization: \${orgName}
    Departments: \${JSON.stringify(departments)}
    Business Goals: \${goals.join(', ')}
    Budget: \${budget}
    Compliance: \${compliance.join(', ')}
    
    Provide:
    1. Readiness score (0-100)
    2. Risk assessment
    3. Platform recommendations
    4. Implementation timeline\`,
    
    response_json_schema: {
        type: "object",
        properties: {
            overall_score: { type: "number" },
            readiness_score: { type: "number" },
            risk_score: { type: "number" },
            recommended_platforms: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        platform: { type: "string" },
                        score: { type: "number" },
                        justification: { type: "string" }
                    }
                }
            }
        }
    }
});
\`\`\`

### 2. Strategy Generation

**Purpose**: Create comprehensive AI adoption strategies with phased roadmaps.

**Key Features**:
- Multi-phase implementation plans
- Risk identification and mitigation
- Quick wins and long-term goals
- Budget optimization

**Example**:
\`\`\`javascript
const strategy = await generateStrategy(assessmentData);
// Returns: { roadmap, risk_analysis, milestones, ai_recommendations }
\`\`\`

### 3. Bias Detection

**Purpose**: Automated monitoring for bias and fairness in AI outputs.

**Metrics Tracked**:
- Gender bias score (0-100)
- Racial/ethnic bias score
- Age bias score
- Language/cultural bias score
- Overall fairness score

**Automated Actions**:
1. Flag high-risk interactions
2. Generate mitigation strategies
3. Recommend policy updates
4. Alert administrators

**Implementation**: See \`functions/automatedBiasScan.js\`

### 4. Conversational AI Agents

**Available Agents**:

| Agent | Specialty | Use Cases |
|-------|-----------|-----------|
| StrategyAdvisor | Adoption planning | Roadmap creation, milestone tracking |
| SecurityAdvisor | Security & compliance | Risk assessment, policy review |
| EngineeringManagerAdvisor | Technical architecture | Integration planning, technical feasibility |
| UXAdvisor | User experience | Change management, adoption strategies |
| TrainingCoach | Learning & development | Skill gap analysis, training plans |
| ComplianceAnalyst | Regulatory compliance | Compliance mapping, documentation |
| ReportGenerator | Reporting & analytics | Executive summaries, presentations |

**Agent Capabilities**:
- Multi-turn conversations with context retention
- File upload and analysis
- Web search for current information
- Collaboration between agents
- WhatsApp integration

### 5. Predictive Analytics

**Capabilities**:
- ROI forecasting
- Risk prediction
- Cost trend analysis
- Adoption timeline estimation
- Resource optimization

**Example**:
\`\`\`javascript
const forecast = await base44.integrations.Core.InvokeLLM({
    prompt: "Predict 3-year ROI for this AI adoption strategy...",
    add_context_from_internet: true,
    response_json_schema: {
        type: "object",
        properties: {
            year1_roi: { type: "number" },
            year2_roi: { type: "number" },
            year3_roi: { type: "number" },
            confidence_level: { type: "number" }
        }
    }
});
\`\`\`

## Prompt Engineering Patterns

### 1. Structured Output Pattern
\`\`\`javascript
const result = await base44.integrations.Core.InvokeLLM({
    prompt: "Clear, specific instructions...",
    response_json_schema: {
        type: "object",
        properties: {
            // Define exact structure
        }
    }
});
\`\`\`

### 2. Multi-Step Analysis Pattern
\`\`\`javascript
const prompt = \`
Step 1: Analyze the data
Step 2: Identify patterns
Step 3: Generate recommendations
Step 4: Assess risks

Data: \${data}

Provide structured output for each step.
\`;
\`\`\`

### 3. Context-Augmented Pattern
\`\`\`javascript
const result = await base44.integrations.Core.InvokeLLM({
    prompt: "Compare these AI platforms for enterprise use...",
    add_context_from_internet: true  // Adds current pricing, features, reviews
});
\`\`\`

### 4. File Analysis Pattern
\`\`\`javascript
// Upload file
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Analyze with AI
const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: "Extract key metrics from this document",
    file_urls: [file_url],
    response_json_schema: { ... }
});
\`\`\`

## AI Usage Monitoring

### Tracking Metrics

All AI interactions are automatically logged:
- User email
- Agent/model used
- Prompt and response
- Tokens consumed
- Cost (USD)
- Latency (ms)
- Bias flags
- Policy compliance

### Cost Management

**Per-interaction cost tracking**:
\`\`\`javascript
const logs = await base44.entities.AIUsageLog.filter({
    user_email: user.email
});

const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
\`\`\`

**Budget alerts**: Automatic notifications when approaching limits.

## Responsible AI Practices

### 1. Bias Mitigation

- **Automated Scans**: Weekly bias detection across all agents
- **Flagging**: High-risk interactions automatically flagged
- **Mitigation**: AI-generated strategies to address bias
- **Policy Updates**: Recommendations for policy improvements

### 2. Transparency

- **Audit Logs**: Complete history of all AI interactions
- **Explainability**: AI reasoning included in outputs
- **User Control**: Users can review and provide feedback

### 3. Privacy & Security

- **No PII in Prompts**: Policies enforce PII detection and blocking
- **Data Minimization**: Only necessary data sent to LLMs
- **Encryption**: All data encrypted in transit and at rest
- **Compliance**: GDPR, SOC 2, ISO 27001 adherence

### 4. Governance Policies

**Active Policies**:
- Data Privacy Protection
- Fairness & Bias Prevention
- Transparency Requirements
- Security Standards
- Compliance Monitoring

## Performance Optimization

### 1. Caching Strategy
\`\`\`javascript
// Cache LLM responses for identical prompts (24h TTL)
const { data } = useQuery({
    queryKey: ['llm', prompt],
    queryFn: () => invokeLLM(prompt),
    staleTime: 24 * 60 * 60 * 1000
});
\`\`\`

### 2. Batch Processing
\`\`\`javascript
// Process multiple assessments in parallel
const results = await Promise.all(
    assessments.map(a => analyzeAssessment(a))
);
\`\`\`

### 3. Prompt Optimization

**Bad** (verbose):
\`\`\`
Please analyze this organization and tell me everything about their 
AI readiness, including all possible factors...
\`\`\`

**Good** (concise):
\`\`\`
Analyze AI readiness. Output: score (0-100), top 3 risks, 
recommended platform.
\`\`\`

## Error Handling

### LLM Call Failures
\`\`\`javascript
try {
    const result = await base44.integrations.Core.InvokeLLM({...});
} catch (error) {
    if (error.message.includes('rate limit')) {
        // Retry with exponential backoff
    } else if (error.message.includes('timeout')) {
        // Simplify prompt and retry
    } else {
        // Log and notify user
    }
}
\`\`\`

### Schema Validation
\`\`\`javascript
// LLM returns invalid JSON
const result = await base44.integrations.Core.InvokeLLM({...});

if (!result || typeof result !== 'object') {
    throw new Error('Invalid LLM response format');
}
\`\`\`

## Testing AI Features

### Unit Testing
\`\`\`javascript
// Mock LLM responses for testing
jest.mock('@/api/base44Client', () => ({
    base44: {
        integrations: {
            Core: {
                InvokeLLM: jest.fn().mockResolvedValue({
                    score: 85,
                    recommendations: ['Test rec']
                })
            }
        }
    }
}));
\`\`\`

### Integration Testing
\`\`\`javascript
// Test with real LLM but controlled inputs
const testPrompt = "Analyze test organization: 50 employees, SaaS";
const result = await base44.integrations.Core.InvokeLLM({
    prompt: testPrompt,
    response_json_schema: testSchema
});

expect(result.score).toBeGreaterThan(0);
expect(result.score).toBeLessThanOrEqual(100);
\`\`\`

## Future AI Enhancements

### Planned Features
- Fine-tuned models for specific domains
- Multi-modal analysis (text + images + data)
- Federated learning for privacy
- On-premise model deployment option
- Custom agent creation by admins
- A/B testing for prompt variations
- Automated prompt optimization

### Research Areas
- Reinforcement learning from user feedback
- Knowledge graph integration
- Multi-agent collaboration protocols
- Explainable AI (XAI) improvements
`;