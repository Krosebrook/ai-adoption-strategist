export const README = `# INT Inc. AI Platform - Complete Documentation

## Executive Summary

The INT Inc. AI Platform is an enterprise-grade AI adoption assessment and implementation planning system designed to help organizations evaluate, select, and deploy AI solutions across their operations.

### Key Capabilities

- **AI Assessment Engine**: Intelligent evaluation of organizational readiness and AI platform compatibility
- **Multi-Platform Comparison**: Vendor-agnostic analysis of Google Gemini, Microsoft Copilot, Anthropic Claude, and OpenAI ChatGPT
- **Strategic Planning**: Automated generation of adoption strategies, implementation roadmaps, and risk mitigation plans
- **AI Agent Hub**: Specialized AI agents for different organizational roles (Strategy, Security, Engineering, UX, Training, Compliance)
- **Governance & Compliance**: Comprehensive AI usage monitoring, bias detection, and policy enforcement
- **Training & Enablement**: Personalized learning paths and team skill development
- **Analytics & Reporting**: Predictive insights, automated reporting, and executive dashboards

## Technology Stack

### Frontend
- **Framework**: React 18.2+ with TypeScript
- **Styling**: Tailwind CSS with custom INT Inc. brand theme
- **UI Components**: shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Backend
- **Platform**: Base44 Backend-as-a-Service
- **Runtime**: Deno Deploy for serverless functions
- **Database**: Base44 managed entities (PostgreSQL-based)
- **Authentication**: Base44 Auth with role-based access control

### AI Services
- **Primary LLM**: Google Gemini (via Base44 Core.InvokeLLM)
- **Fallback Options**: OpenAI, Anthropic Claude, Microsoft Azure OpenAI
- **Capabilities**: Web search context, vision, file processing, structured JSON outputs

## Quick Start

### For Developers

\`\`\`bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure: BASE44_APP_ID, BASE44_API_KEY

# Run development server
npm run dev

# Open browser
http://localhost:5173
\`\`\`

### For Product Managers

1. **User Onboarding**: New users complete a personalized onboarding flow based on their role
2. **Assessment Creation**: Start with "New Assessment" to evaluate AI needs
3. **Platform Comparison**: Review AI-generated recommendations and ROI projections
4. **Strategy Development**: Generate automated adoption strategies with risk analysis
5. **Implementation Planning**: Create phased rollout plans with stakeholder alignment
6. **Monitoring**: Track progress via Executive Dashboard and Analytics

### For AI Service Leads

- Review **AI Services Documentation** for LLM integration patterns
- Check **AI Governance** module for usage analytics and bias monitoring
- Configure **Automated Bias Scans** for proactive monitoring
- Set up **AI Policies** for responsible AI usage
- Monitor **Audit Logs** for compliance and transparency

## Core Modules

| Module | Purpose | Key Features |
|--------|---------|--------------|
| Assessment | Evaluate AI readiness | Wizard-based flow, AI-enhanced insights |
| Strategy Automation | Generate adoption plans | Roadmaps, risk analysis, budget scenarios |
| AI Agent Hub | Specialized AI assistance | 7 role-specific agents, collaboration |
| Analytics | Data-driven insights | Predictive analytics, anomaly detection |
| Governance | Responsible AI | Usage tracking, bias monitoring, policies |
| Training | Skill development | Personalized paths, interactive modules |
| Risk Monitoring | Proactive alerts | KRI tracking, mitigation progress |

## User Roles

- **Admin**: Full platform access, user management, governance oversight
- **User**: Standard access to assessments, strategies, and analytics

## Data Security

- All sensitive data encrypted at rest and in transit
- Role-based access control (RBAC)
- Comprehensive audit logging
- Compliance with GDPR, SOC 2, ISO 27001 standards

## Support

- **Documentation**: Available in-app via Documentation page
- **AI Assistance**: Contextual guidance throughout the platform
- **Training**: Interactive modules and personalized learning paths

## Version

Current Version: 2.0.0 (January 2026)
Platform: Base44 v3+
`;