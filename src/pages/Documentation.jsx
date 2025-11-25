import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Code, Zap, Shield, Users, FileText, 
  Target, DollarSign, TrendingUp, Brain, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const documentation = {
  overview: `
# INT Inc. Enterprise AI Platform

## Overview

The INT Inc. Enterprise AI Platform is a comprehensive solution for strategic AI adoption assessment, implementation planning, and ongoing management. It provides AI-powered tools to help organizations make informed decisions about adopting enterprise AI platforms.

## Key Capabilities

- **AI-Powered Assessment**: Intelligent evaluation of organizational needs and platform recommendations
- **Strategy Automation**: Automated roadmap generation with risk management and progress tracking
- **Financial Optimization**: Cost forecasting, ROI analysis, and budget scenario simulation
- **Collaborative Planning**: Multi-user strategy co-editing with AI-driven decision support
- **Training System**: Personalized learning paths with AI-generated content
- **Compliance Management**: Gap analysis and regulatory compliance tracking
- **Scenario Modeling**: Combined impact analysis of market, regulatory, and organizational changes

## Supported AI Platforms

1. **Google Gemini** - Google's multimodal AI platform
2. **Microsoft Copilot** - Microsoft's AI assistant ecosystem
3. **Anthropic Claude** - Advanced reasoning and analysis
4. **OpenAI ChatGPT** - Versatile language model platform
`,

  architecture: `
# System Architecture

## Frontend Architecture

\`\`\`
├── pages/                 # Main application pages
│   ├── Home.jsx          # Landing page with platform overview
│   ├── Assessment.jsx    # AI assessment wizard
│   ├── StrategyAutomation.jsx  # Strategy management
│   ├── Training.jsx      # Training modules
│   ├── Reports.jsx       # Report generation
│   └── Documentation.jsx # This documentation
│
├── components/           # Reusable components
│   ├── ai/              # AI-powered components
│   ├── assessment/      # Assessment wizard steps
│   ├── collaboration/   # Collaboration features
│   ├── compliance/      # Compliance analysis
│   ├── financial/       # Financial optimization
│   ├── guidance/        # Contextual guidance
│   ├── onboarding/      # Onboarding system
│   ├── reports/         # Automated reporting
│   ├── scenarios/       # Scenario modeling
│   ├── strategy/        # Strategy components
│   └── training/        # Training system
│
├── entities/            # Data models (JSON Schema)
├── agents/              # AI agents configuration
├── functions/           # Backend functions
└── Layout.js            # App layout
\`\`\`

## Data Entities

| Entity | Purpose |
|--------|---------|
| Assessment | Stores organization assessments and recommendations |
| AdoptionStrategy | AI adoption strategy with roadmap and risks |
| TrainingModule | AI-generated training content |
| TrainingProgress | User progress tracking |
| StrategySession | Collaborative strategy sessions |
| BudgetScenario | Financial scenario configurations |
| AutomatedReport | Scheduled report configurations |
| OnboardingFlow | User onboarding progress |

## AI Agents

1. **Strategy Advisor** - Strategy planning and risk assessment
2. **Training Coach** - Personalized learning guidance
3. **Compliance Analyst** - Regulatory compliance support
4. **Report Generator** - Automated report creation
`,

  api: `
# API Integrations

## Built-in Integrations

### Core AI
- **InvokeLLM** - AI text generation with structured output
- **GenerateImage** - AI image generation
- **ExtractDataFromFile** - Document data extraction

### Communication
- **SendEmail** - Email notifications
- **UploadFile** - File management

## External API Functions

### Slack Integration
\`\`\`javascript
await base44.functions.invoke('slackNotify', {
  channel: '#ai-updates',
  message: 'Strategy milestone completed!'
});
\`\`\`

### HubSpot CRM
\`\`\`javascript
await base44.functions.invoke('hubspotSync', {
  action: 'create_contact',
  contactData: { email, firstname, lastname }
});
\`\`\`

### Jira Integration
\`\`\`javascript
await base44.functions.invoke('jiraIntegration', {
  action: 'create_issue',
  projectKey: 'AI',
  issueData: { summary, description, issuetype: { name: 'Task' } }
});
\`\`\`

### Microsoft Teams
\`\`\`javascript
await base44.functions.invoke('microsoftTeams', {
  webhookUrl: 'https://...',
  title: 'AI Strategy Update',
  message: 'New milestone achieved'
});
\`\`\`

### Airtable Sync
\`\`\`javascript
await base44.functions.invoke('airtableSync', {
  action: 'create',
  baseId: 'app...',
  tableId: 'tbl...',
  fields: { Name: 'Assessment', Status: 'Complete' }
});
\`\`\`

### Stripe Payments
\`\`\`javascript
await base44.functions.invoke('stripePayments', {
  action: 'create_checkout_session',
  priceId: 'price_...'
});
\`\`\`

### Power BI Export
\`\`\`javascript
await base44.functions.invoke('powerBIExport', {
  datasetName: 'AI Adoption Metrics',
  data: { assessments, strategies }
});
\`\`\`

### Twilio SMS
\`\`\`javascript
await base44.functions.invoke('twilioSMS', {
  to: '+1234567890',
  message: 'Strategy alert: Risk level increased'
});
\`\`\`

### Zapier Webhook
\`\`\`javascript
await base44.functions.invoke('zapierWebhook', {
  webhookUrl: 'https://hooks.zapier.com/...',
  eventType: 'assessment_completed',
  data: { assessmentId, score }
});
\`\`\`
`,

  deployment: `
# Deployment & Configuration

## Environment Variables

Required secrets for full functionality:

| Secret | Purpose |
|--------|---------|
| OPENAI_API_KEY | OpenAI API access |
| GOOGLE_API_KEY | Google AI access |
| ANTHROPIC_API_KEY | Anthropic Claude access |
| SLACK_WEBHOOK_URL | Slack notifications |
| SENDGRID_API_KEY | Email delivery |
| HUBSPOT_API_KEY | CRM integration |
| JIRA_DOMAIN, JIRA_EMAIL, JIRA_API_TOKEN | Jira integration |
| AIRTABLE_API_KEY | Airtable sync |
| STRIPE_API_KEY | Payment processing |
| TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN | SMS notifications |

## PWA Configuration

The app is configured as a Progressive Web App with:
- Offline capability (network-first caching)
- Home screen installation
- Push notification support (when configured)

## Security Considerations

1. All API keys stored as encrypted secrets
2. User authentication required for all operations
3. Role-based access control (admin/user)
4. Audit logging for sensitive operations
5. Data encryption at rest and in transit

## Performance Optimization

- Lazy loading of components
- React Query for data caching
- Optimistic updates for better UX
- Image optimization via CDN
`
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E88A1D, #D07612)' }}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Documentation</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>INT Inc. Enterprise AI Platform</p>
          </div>
          <Badge className="ml-auto" style={{ background: '#E88A1D' }}>v2.0 Production</Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">
              <Target className="h-4 w-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Code className="h-4 w-4 mr-1" /> Architecture
            </TabsTrigger>
            <TabsTrigger value="api">
              <Zap className="h-4 w-4 mr-1" /> API Reference
            </TabsTrigger>
            <TabsTrigger value="deployment">
              <Shield className="h-4 w-4 mr-1" /> Deployment
            </TabsTrigger>
          </TabsList>

          {Object.entries(documentation).map(([key, content]) => (
            <TabsContent key={key} value={key}>
              <Card className="sunrise-card">
                <CardContent className="pt-6">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3" style={{ color: 'var(--color-text)' }}>{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2" style={{ color: 'var(--color-text)' }}>{children}</h3>,
                        p: ({ children }) => <p className="mb-3" style={{ color: 'var(--color-text-secondary)' }}>{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                        li: ({ children }) => <li style={{ color: 'var(--color-text-secondary)' }}>{children}</li>,
                        code: ({ inline, children }) => inline ? (
                          <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">{children}</code>
                        ) : (
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-sm">
                            <code>{children}</code>
                          </pre>
                        ),
                        table: ({ children }) => <table className="w-full border-collapse mb-4">{children}</table>,
                        th: ({ children }) => <th className="border p-2 bg-slate-100 text-left font-semibold">{children}</th>,
                        td: ({ children }) => <td className="border p-2">{children}</td>,
                        strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--color-text)' }}>{children}</strong>
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}