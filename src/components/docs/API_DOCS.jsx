export const API_DOCS = `# API Documentation

## Base44 SDK

All API calls use the pre-initialized Base44 SDK client:

\`\`\`javascript
import { base44 } from '@/api/base44Client';
\`\`\`

## Authentication API

### Get Current User
\`\`\`javascript
const user = await base44.auth.me();
// Returns: { id, email, full_name, role, ... }
\`\`\`

### Check Authentication
\`\`\`javascript
const isAuth = await base44.auth.isAuthenticated();
// Returns: boolean
\`\`\`

### Update Current User
\`\`\`javascript
await base44.auth.updateMe({ 
    preferences: { theme: 'dark' } 
});
\`\`\`

### Logout
\`\`\`javascript
base44.auth.logout(redirectUrl);
\`\`\`

### Redirect to Login
\`\`\`javascript
base44.auth.redirectToLogin(nextUrl);
\`\`\`

## Entity CRUD Operations

### Generic Pattern
\`\`\`javascript
// List all (with optional sorting and limit)
const items = await base44.entities.EntityName.list(sortField, limit);

// Filter by criteria
const filtered = await base44.entities.EntityName.filter(
    { status: 'active' }, 
    '-created_date', 
    50
);

// Create
const newItem = await base44.entities.EntityName.create({
    field1: 'value1',
    field2: 'value2'
});

// Update
await base44.entities.EntityName.update(id, {
    field1: 'new value'
});

// Delete
await base44.entities.EntityName.delete(id);

// Get schema
const schema = base44.entities.EntityName.schema();
\`\`\`

### Assessment API

**Create Assessment**
\`\`\`javascript
const assessment = await base44.entities.Assessment.create({
    organization_name: "ACME Corp",
    departments: [
        { name: "Engineering", user_count: 50, annual_spend: 200000 }
    ],
    business_goals: ["Improve efficiency", "Reduce costs"],
    budget_constraints: {
        max_budget: 500000,
        budget_period: "annual"
    }
});
\`\`\`

**Get Assessment with Results**
\`\`\`javascript
const assessment = await base44.entities.Assessment.filter(
    { id: assessmentId }
);
// Returns recommended_platforms, ai_assessment_score, etc.
\`\`\`

### Adoption Strategy API

**Create Strategy**
\`\`\`javascript
const strategy = await base44.entities.AdoptionStrategy.create({
    assessment_id: assessmentId,
    organization_name: "ACME Corp",
    platform: "Google Gemini",
    roadmap: {
        executive_summary: "...",
        phases: [...]
    }
});
\`\`\`

**Update Progress**
\`\`\`javascript
await base44.entities.AdoptionStrategy.update(strategyId, {
    progress_tracking: {
        overall_progress: 45,
        current_phase: "Phase 2",
        achievements: ["Completed pilot"],
        blockers: []
    }
});
\`\`\`

### AI Usage Logging API

**Log AI Interaction** (typically automatic)
\`\`\`javascript
await base44.entities.AIUsageLog.create({
    user_email: user.email,
    agent_name: "StrategyAdvisor",
    interaction_type: "chat",
    prompt: "How do I start?",
    response: "Begin by...",
    tokens_used: 150,
    cost: 0.002,
    latency_ms: 1200
});
\`\`\`

**Query Usage Logs**
\`\`\`javascript
const logs = await base44.entities.AIUsageLog.filter({
    user_email: user.email,
    agent_name: "StrategyAdvisor"
}, '-created_date', 100);
\`\`\`

### Bias Monitoring API

**Get Latest Scans**
\`\`\`javascript
const scans = await base44.entities.BiasMonitoring.list('-scan_date', 20);
\`\`\`

**Create Bias Scan**
\`\`\`javascript
const scan = await base44.entities.BiasMonitoring.create({
    agent_name: "StrategyAdvisor",
    sample_size: 500,
    bias_metrics: {
        gender_bias_score: 12,
        racial_bias_score: 8,
        overall_fairness_score: 92
    },
    detected_issues: [...],
    status: "clear"
});
\`\`\`

## Integration APIs

### Core Integrations

All integrations accessed via \`base44.integrations.Core\`:

#### InvokeLLM
\`\`\`javascript
const response = await base44.integrations.Core.InvokeLLM({
    prompt: string,
    add_context_from_internet: boolean,
    response_json_schema: object | null,
    file_urls: string[] | null
});

// Example with structured output
const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: "Analyze this organization's AI readiness",
    response_json_schema: {
        type: "object",
        properties: {
            readiness_score: { type: "number" },
            key_findings: { type: "array", items: { type: "string" } }
        }
    }
});
// Returns: { readiness_score: 75, key_findings: [...] }
\`\`\`

#### SendEmail
\`\`\`javascript
await base44.integrations.Core.SendEmail({
    from_name: "INT Inc AI Platform",
    to: "user@example.com",
    subject: "Assessment Complete",
    body: "Your assessment is ready..."
});
\`\`\`

#### UploadFile
\`\`\`javascript
const { file_url } = await base44.integrations.Core.UploadFile({
    file: fileObject
});
// Returns: { file_url: "https://..." }
\`\`\`

#### GenerateImage
\`\`\`javascript
const { url } = await base44.integrations.Core.GenerateImage({
    prompt: "A futuristic AI dashboard",
    existing_image_urls: [] // Optional reference images
});
\`\`\`

#### ExtractDataFromUploadedFile
\`\`\`javascript
const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
    file_url: uploadedFileUrl,
    json_schema: {
        type: "object",
        properties: {
            company_name: { type: "string" },
            employees: { type: "number" }
        }
    }
});
// Returns: { status: "success", output: {...} }
\`\`\`

## Backend Functions API

### Invoke Function
\`\`\`javascript
const response = await base44.functions.invoke('functionName', {
    param1: 'value1',
    param2: 'value2'
});

// Response structure
{
    data: { ... },  // Function response data
    status: 200,
    headers: { ... }
}
\`\`\`

### Automated Bias Scan Function
\`\`\`javascript
const result = await base44.functions.invoke('automatedBiasScan', {
    agent_name: 'StrategyAdvisor',
    lookback_days: 7
});

// Returns
{
    success: true,
    scan_id: "scan_123",
    agent_name: "StrategyAdvisor",
    sample_size: 342,
    status: "needs_attention",
    risk_level: "medium",
    issues_detected: 3,
    logs_flagged: 12,
    notification_sent: false,
    policy_recommendations: 2
}
\`\`\`

## Real-Time Subscriptions

### Subscribe to Entity Changes
\`\`\`javascript
const unsubscribe = base44.entities.EntityName.subscribe((event) => {
    console.log(event.type);     // 'create' | 'update' | 'delete'
    console.log(event.id);       // Entity ID
    console.log(event.data);     // Current entity data
    console.log(event.old_data); // Previous data (update only)
});

// Clean up
unsubscribe();
\`\`\`

### React Hook Pattern
\`\`\`javascript
useEffect(() => {
    const unsubscribe = base44.entities.Assessment.subscribe((event) => {
        if (event.type === 'create') {
            queryClient.invalidateQueries(['assessments']);
        }
    });
    return unsubscribe;
}, [queryClient]);
\`\`\`

## Agent Chat API

### Create Conversation
\`\`\`javascript
const conversation = await base44.agents.createConversation({
    agent_name: "StrategyAdvisor",
    metadata: {
        name: "Q1 Strategy Discussion",
        description: "Planning AI adoption"
    }
});
\`\`\`

### List Conversations
\`\`\`javascript
const conversations = await base44.agents.listConversations({
    agent_name: "StrategyAdvisor"
});
\`\`\`

### Add Message
\`\`\`javascript
await base44.agents.addMessage(conversation, {
    role: "user",
    content: "What are the key risks?",
    file_urls: [] // Optional attachments
});
\`\`\`

### Subscribe to Conversation
\`\`\`javascript
useEffect(() => {
    const unsubscribe = base44.agents.subscribeToConversation(
        conversationId, 
        (data) => {
            setMessages(data.messages);
        }
    );
    return unsubscribe;
}, [conversationId]);
\`\`\`

### WhatsApp Integration URL
\`\`\`javascript
const whatsappUrl = base44.agents.getWhatsAppConnectURL('StrategyAdvisor');
// Use in: <a href={whatsappUrl}>Connect WhatsApp</a>
\`\`\`

## Error Handling

### Standard Error Response
\`\`\`javascript
try {
    const data = await base44.entities.Something.create({...});
} catch (error) {
    console.error(error.message);
    // Show user-friendly error
    toast.error('Failed to save data');
}
\`\`\`

### Function Error Handling
\`\`\`javascript
const response = await base44.functions.invoke('myFunction', {...});

if (!response.data.success) {
    console.error(response.data.error);
}
\`\`\`

## Rate Limits

- **LLM Calls**: Fair use policy, monitor via AIUsageLog
- **Entity Operations**: Unlimited within reasonable use
- **File Uploads**: 10MB per file, 100 files/day
- **Email**: 1000 emails/day

## Pagination

\`\`\`javascript
// Get first page
const page1 = await base44.entities.Entity.list('-created_date', 50);

// For more, implement offset-based fetching
// (Base44 handles this via limit parameter)
\`\`\`

## Webhooks

Currently not supported in Base44 platform. Use real-time subscriptions instead.
`;