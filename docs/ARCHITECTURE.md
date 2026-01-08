# System Architecture

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: Architecture Team  
**Status**: Active

## Overview

This document provides a high-level architectural overview of the AI Adoption Strategist platform, describing the system components, their relationships, data flow, and key design decisions.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Browser    │  │   Mobile     │  │    PWA       │     │
│  │ (React/Vite) │  │   (Future)   │  │  Installed   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/TLS 1.3
┌───────────────────────────┴─────────────────────────────────┐
│                    CDN & Edge Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CDN (Cloudflare/AWS CloudFront)                    │   │
│  │  - Static Asset Caching                             │   │
│  │  - DDoS Protection                                  │   │
│  │  - SSL/TLS Termination                              │   │
│  │  - Geographic Distribution                          │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   Application Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend Application                     │  │
│  │  ┌─────────────────┐  ┌─────────────────┐           │  │
│  │  │   Components    │  │   State Mgmt    │           │  │
│  │  │   (React)       │  │   (Context/     │           │  │
│  │  │                 │  │    TanStack)    │           │  │
│  │  └─────────────────┘  └─────────────────┘           │  │
│  │  ┌─────────────────┐  ┌─────────────────┐           │  │
│  │  │   Routing       │  │   UI Library    │           │  │
│  │  │   (React Router)│  │   (shadcn/ui)   │           │  │
│  │  └─────────────────┘  └─────────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Worker                           │  │
│  │  - Offline Support                                    │  │
│  │  - Cache Management                                   │  │
│  │  - Background Sync                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API / WebSocket
┌───────────────────────────┴─────────────────────────────────┐
│                    Backend Layer (Base44)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Gateway                              │  │
│  │  - Authentication/Authorization                       │  │
│  │  - Rate Limiting                                      │  │
│  │  - Request Routing                                    │  │
│  │  - API Versioning                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌────────────┬────────────┴────────────┬────────────┐     │
│  │            │                          │            │     │
│  ▼            ▼                          ▼            ▼     │
│  ┌──────┐  ┌──────┐  ┌──────────┐  ┌──────────┐           │
│  │ Auth │  │ CRUD │  │ Real-time│  │Functions │           │
│  │Service│  │ API  │  │ Updates  │  │(Serverless)│         │
│  └──────┘  └──────┘  └──────────┘  └──────────┘           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database (Base44 Managed)          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │Assessments│  │  Users   │  │  Reports │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │  Orgs    │  │Templates │  │  Metrics │           │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Object Storage (Files/Reports)                │  │
│  │  - Assessment Attachments                             │  │
│  │  - Generated Reports (PDF)                            │  │
│  │  - User Uploads                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Application

#### Component Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI primitives
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   └── ...
│   ├── assessment/         # Assessment-specific components
│   │   ├── AssessmentCard.jsx
│   │   ├── AssessmentForm.jsx
│   │   └── AssessmentList.jsx
│   ├── dashboard/          # Dashboard components
│   │   ├── widgets/
│   │   └── DashboardLayout.jsx
│   └── shared/             # Shared complex components
├── pages/                  # Page-level components
│   ├── Dashboard.jsx
│   ├── Assessments.jsx
│   └── AssessmentDetail.jsx
├── lib/                    # Utilities and helpers
│   ├── api.js             # API client configuration
│   ├── utils.js           # Utility functions
│   └── context/           # React contexts
├── hooks/                  # Custom React hooks
│   ├── useAssessments.js
│   └── useAuth.js
└── api/                    # API layer abstraction
    ├── assessments.js
    ├── reports.js
    └── users.js
```

#### Key Components

**Layout Components**:
- `RootLayout`: Main application wrapper
- `DashboardLayout`: Dashboard page structure
- `Navbar`: Navigation header
- `Sidebar`: Side navigation

**Feature Components**:
- `AssessmentWizard`: Multi-step assessment creation
- `ReportGenerator`: Report creation and download
- `ComparisonView`: Platform comparison interface
- `MetricsDashboard`: Analytics and metrics display

**UI Components**:
- Based on shadcn/ui (Radix UI primitives)
- Fully accessible (WCAG 2.1 AA)
- Theme-aware (light/dark mode)
- Responsive design patterns

### State Management

#### Global State
Managed via React Context API:
- `AuthContext`: User authentication state
- `ThemeContext`: UI theme preferences
- `NotificationContext`: Toast notifications

#### Server State
Managed via TanStack Query:
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

```javascript
// Example: Assessment data management
const { data: assessments, isLoading } = useQuery({
  queryKey: ['assessments', { status: 'active' }],
  queryFn: () => assessmentsAPI.getAll({ status: 'active' }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### Local State
Component-level state with `useState` and `useReducer`:
- Form inputs
- UI toggles
- Component-specific data

### Data Flow

#### Read Operation Flow
```
User Action
  ↓
Component
  ↓
React Query (Check Cache)
  ↓
API Client
  ↓
Base44 SDK
  ↓
Backend API
  ↓
Database
  ↓
Response (cached by React Query)
  ↓
Component Re-render
```

#### Write Operation Flow
```
User Action
  ↓
Component
  ↓
React Query Mutation
  ↓
API Client
  ↓
Base44 SDK
  ↓
Backend API (Validation)
  ↓
Database (Transaction)
  ↓
Real-time Notification
  ↓
Cache Invalidation
  ↓
UI Update
```

## Backend Architecture (Base44)

### Core Services

#### Authentication Service
**Responsibilities**:
- User authentication (email/password, OAuth)
- Session management
- Token generation and validation
- Multi-factor authentication

**Technologies**:
- JWT tokens (RS256 algorithm)
- Refresh token rotation
- Session persistence

#### Authorization Service
**Responsibilities**:
- Role-based access control (RBAC)
- Row-level security (RLS)
- Permission evaluation
- Resource ownership verification

**Implementation**:
- PostgreSQL RLS policies
- Role hierarchy
- Fine-grained permissions

#### Database Service
**Responsibilities**:
- CRUD operations
- Query optimization
- Transaction management
- Data validation

**Features**:
- Automatic API generation
- Real-time subscriptions
- Audit logging
- Soft deletes

#### Real-time Service
**Responsibilities**:
- WebSocket connections
- Change notifications
- Presence tracking
- Broadcast messages

**Protocol**:
- WebSocket for persistent connections
- Server-Sent Events (SSE) fallback
- Automatic reconnection

#### Storage Service
**Responsibilities**:
- File upload/download
- Access control
- URL signing
- CDN integration

**Features**:
- Chunked uploads for large files
- Image optimization
- Automatic backup

### Database Schema

#### Core Tables

**users**
- `id` (UUID, PK)
- `email` (String, Unique)
- `name` (String)
- `role` (Enum: admin, assessor, viewer)
- `organization_id` (UUID, FK)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**organizations**
- `id` (UUID, PK)
- `name` (String)
- `industry` (String)
- `size` (Enum)
- `settings` (JSONB)
- `created_at` (Timestamp)

**assessments**
- `id` (UUID, PK)
- `name` (String)
- `description` (Text)
- `status` (Enum: draft, in_progress, completed)
- `score` (Integer)
- `organization_id` (UUID, FK)
- `created_by` (UUID, FK)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**assessment_responses**
- `id` (UUID, PK)
- `assessment_id` (UUID, FK)
- `question_id` (UUID, FK)
- `response` (JSONB)
- `score` (Integer)
- `created_at` (Timestamp)

**reports**
- `id` (UUID, PK)
- `assessment_id` (UUID, FK)
- `format` (Enum: pdf, csv)
- `status` (Enum: processing, completed, failed)
- `file_url` (String)
- `created_at` (Timestamp)
- `expires_at` (Timestamp)

### Database Relationships

```
organizations (1) ──< (N) users
organizations (1) ──< (N) assessments
users (1) ──< (N) assessments (creator)
assessments (1) ──< (N) assessment_responses
assessments (1) ──< (N) reports
```

### Row-Level Security (RLS)

Implemented via PostgreSQL RLS policies:

```sql
-- Example: Users can only see assessments in their organization
CREATE POLICY assessment_org_access ON assessments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );
```

See [ENTITY_ACCESS_RULES.md](./ENTITY_ACCESS_RULES.md) for complete access rules.

## Integration Points

### Third-Party Integrations

#### AI Services (Future)
- OpenAI GPT for recommendations
- Assessment analysis
- Report generation

#### Analytics
- Usage metrics
- Performance monitoring
- Error tracking

#### Communication
- Email notifications (SendGrid/AWS SES)
- In-app notifications
- Webhook notifications

## Deployment Architecture

### Hosting Infrastructure

```
┌─────────────────────────────────────────────────┐
│              Production Environment              │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Frontend   │  │   Backend    │            │
│  │   (Vercel/   │  │   (Base44    │            │
│  │   Netlify)   │  │   Platform)  │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │     CDN      │  │   Database   │            │
│  │ (CloudFront) │  │  (PostgreSQL)│            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Developer Push
  ↓
GitHub Repository
  ↓
GitHub Actions Triggered
  ↓
├── Lint & Type Check
├── Unit Tests
├── Build Application
├── Security Scan
└── Integration Tests
  ↓
Deploy to Staging
  ↓
Automated Tests
  ↓
Manual Approval
  ↓
Deploy to Production
  ↓
Post-Deployment Verification
```

## Performance Considerations

### Frontend Optimization

**Code Splitting**:
- Route-based splitting
- Component lazy loading
- Dynamic imports

**Asset Optimization**:
- Image optimization (WebP, lazy loading)
- CSS purging (Tailwind)
- JavaScript minification
- Tree shaking

**Caching Strategy**:
- Service Worker caching
- Browser caching headers
- CDN caching
- React Query caching

### Backend Optimization

**Database**:
- Indexed columns for common queries
- Query optimization
- Connection pooling
- Read replicas (future)

**API**:
- Response compression (gzip/brotli)
- Request caching
- Rate limiting
- Pagination

## Security Architecture

### Security Layers

**Transport Security**:
- TLS 1.3 encryption
- HSTS headers
- Certificate pinning

**Application Security**:
- Input validation
- Output encoding
- CSRF protection
- XSS prevention
- SQL injection prevention (parameterized queries)

**Authentication Security**:
- JWT tokens with short expiration
- Refresh token rotation
- MFA support
- Password hashing (bcrypt)

**Authorization Security**:
- Row-level security
- Role-based access control
- Least privilege principle

See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.

## Scalability Considerations

### Horizontal Scaling
- Stateless frontend (can scale infinitely)
- Base44 handles backend scaling
- Database scaling via Base44 platform

### Vertical Scaling
- Optimized queries and indexes
- Efficient caching strategies
- Resource monitoring

### Future Scaling Plans
- Read replicas for read-heavy operations
- Caching layer (Redis)
- CDN expansion
- Multi-region deployment

## Monitoring and Observability

### Application Monitoring
- Error tracking (Sentry/similar)
- Performance monitoring (Web Vitals)
- User analytics
- API metrics

### Infrastructure Monitoring
- Server health checks
- Database performance
- API response times
- Error rates

### Logging
- Application logs
- Access logs
- Error logs
- Audit logs

## Disaster Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Geographic redundancy
- Backup testing

### Recovery Procedures
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours
- Documented recovery procedures
- Regular DR testing

## Technology Decisions

### Why React?
- Component reusability
- Rich ecosystem
- Strong community support
- Excellent developer experience

### Why Base44?
- Rapid development
- Built-in authentication
- Real-time capabilities
- Managed infrastructure
- Row-level security

### Why Tailwind CSS?
- Utility-first approach
- Consistency across components
- Small bundle size
- Easy customization

### Why Vite?
- Fast development server
- Optimized builds
- Plugin ecosystem
- Modern tooling

## Future Architecture Plans

### Planned Enhancements
- Microservices for complex features
- Event-driven architecture
- GraphQL API (alongside REST)
- Mobile applications (React Native)
- Advanced analytics platform

### Technology Evaluation
- AI/ML integration for smarter assessments
- Real-time collaboration features
- Advanced reporting engine
- Integration marketplace

## Related Documents

- [FRAMEWORK.md](./FRAMEWORK.md) - Technology stack details
- [SECURITY.md](./SECURITY.md) - Security architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ENTITY_ACCESS_RULES.md](./ENTITY_ACCESS_RULES.md) - Access control

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | Architecture Team | Initial version |
