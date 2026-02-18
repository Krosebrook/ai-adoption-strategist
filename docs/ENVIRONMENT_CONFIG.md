# Environment Configuration

**Document Status**: ✅ **Completed**  
**Priority**: P0 - Critical  
**Last Updated**: 2026-02-18  
**Owner**: Engineering Team

---

## Purpose

This document comprehensively documents all environment variables, configuration parameters, secrets management, and environment-specific settings for the AI Adoption Strategist platform.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in required values (see sections below)

3. **NEVER commit `.env` files to version control**

4. Verify configuration:
   ```bash
   npm run typecheck  # Checks for missing required env vars
   ```

---

## Required Environment Variables

### 1. Base44 Configuration (REQUIRED)

#### `VITE_BASE44_PROJECT_ID`
- **Purpose**: Base44 project identifier for authentication and API access
- **Format**: Alphanumeric string
- **Required**: ✅ YES
- **Default**: None
- **Example**: `my-project-123`
- **Where to Get**: Base44 Dashboard → Project Settings
- **Validation**: Must be provided or app won't authenticate

---

## Application Configuration

### Core Settings

#### `NODE_ENV`
- **Purpose**: Environment mode for Node.js
- **Format**: String enum
- **Required**: No
- **Default**: `development`
- **Valid Values**: `development`, `staging`, `production`
- **Example**: `production`

#### `VITE_APP_URL`
- **Purpose**: Base URL for the application
- **Format**: Valid URL with protocol
- **Required**: No
- **Default**: `http://localhost:5173` (development)
- **Example**: `https://app.example.com`
- **Usage**: Used for generating absolute URLs, redirects, etc.

#### `VITE_API_URL`
- **Purpose**: API base URL (if different from app URL)
- **Format**: Valid URL with protocol
- **Required**: No
- **Default**: Same as `VITE_APP_URL`
- **Example**: `https://api.example.com`

---

## Third-Party Integrations

### Email Services

#### `SENDGRID_API_KEY`
- **Purpose**: SendGrid API key for transactional emails
- **Format**: String starting with `SG.`
- **Required**: ⚠️ Required for email functionality
- **Example**: `SG.abc123...`
- **Where to Get**: SendGrid Dashboard → API Keys
- **Security**: 🔒 SECRET - Never commit
- **Permissions**: Send Mail, Mail Settings (Read)
- **Fallback**: Email features disabled if not provided

### Communication Services

#### `SLACK_WEBHOOK_URL`
- **Purpose**: Slack incoming webhook for notifications
- **Format**: `https://hooks.slack.com/services/...`
- **Required**: ⚠️ Required for Slack notifications
- **Example**: `https://hooks.slack.com/services/T00/B00/XXX`
- **Where to Get**: Slack App Settings → Incoming Webhooks
- **Security**: 🔒 SECRET - Never commit
- **Usage**: System alerts, error notifications

#### `TWILIO_ACCOUNT_SID`
- **Purpose**: Twilio account identifier
- **Format**: String starting with `AC`
- **Required**: ⚠️ Required for SMS functionality
- **Example**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Where to Get**: Twilio Console → Account Info
- **Security**: 🔐 Sensitive - Do not expose publicly

#### `TWILIO_AUTH_TOKEN`
- **Purpose**: Twilio authentication token
- **Format**: Alphanumeric string
- **Required**: ⚠️ Required for SMS functionality
- **Example**: `your_auth_token_here`
- **Where to Get**: Twilio Console → Account Info
- **Security**: 🔒 SECRET - Never commit

### AI/LLM Services

#### `OPENAI_API_KEY`
- **Purpose**: OpenAI API access for ChatGPT integration
- **Format**: String starting with `sk-`
- **Required**: ⚠️ Required for OpenAI features
- **Example**: `sk-proj-...`
- **Where to Get**: OpenAI Platform → API Keys
- **Security**: 🔒 SECRET - Never commit
- **Rate Limits**: Monitor usage to avoid overages
- **Cost**: Pay-per-use, set billing alerts

#### `ANTHROPIC_API_KEY`
- **Purpose**: Anthropic API access for Claude integration
- **Format**: String starting with `sk-ant-`
- **Required**: ⚠️ Required for Claude features
- **Example**: `sk-ant-api03-...`
- **Where to Get**: Anthropic Console → API Keys
- **Security**: 🔒 SECRET - Never commit

#### `GOOGLE_AI_API_KEY`
- **Purpose**: Google AI/Gemini API access
- **Format**: Alphanumeric string
- **Required**: ⚠️ Required for Gemini features
- **Example**: `AIza...`
- **Where to Get**: Google Cloud Console → APIs & Services → Credentials
- **Security**: 🔒 SECRET - Never commit

### CRM & Sales Tools

#### `HUBSPOT_API_KEY`
- **Purpose**: HubSpot API access for CRM integration
- **Format**: UUID string
- **Required**: ⚠️ Required for HubSpot features
- **Example**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Where to Get**: HubSpot Settings → Integrations → API Key
- **Security**: 🔒 SECRET - Never commit

### Payment Processing

#### `STRIPE_SECRET_KEY`
- **Purpose**: Stripe secret key for payment processing
- **Format**: String starting with `sk_`
- **Required**: ⚠️ Required for payment features
- **Example**: `sk_test_...` (test) or `sk_live_...` (production)
- **Where to Get**: Stripe Dashboard → Developers → API Keys
- **Security**: 🔒 SECRET - CRITICAL - Never commit or expose
- **Test Mode**: Use `sk_test_` keys for development

#### `STRIPE_PUBLISHABLE_KEY`
- **Purpose**: Stripe publishable key for client-side
- **Format**: String starting with `pk_`
- **Required**: ⚠️ Required for payment features
- **Example**: `pk_test_...` (test) or `pk_live_...` (production)
- **Where to Get**: Stripe Dashboard → Developers → API Keys
- **Security**: 🟡 Can be public, but use test keys for development

---

## Optional Services

### Observability (Recommended for Production)

#### `SENTRY_DSN`
- **Purpose**: Sentry error tracking DSN
- **Format**: `https://xxx@xxx.ingest.sentry.io/xxx`
- **Required**: No (recommended for production)
- **Example**: `https://abc123@o123.ingest.sentry.io/456`
- **Where to Get**: Sentry Project Settings → Client Keys (DSN)
- **Usage**: Automatic error tracking and reporting

#### `VITE_GA_MEASUREMENT_ID`
- **Purpose**: Google Analytics measurement ID
- **Format**: String starting with `G-`
- **Required**: No
- **Example**: `G-XXXXXXXXXX`
- **Where to Get**: Google Analytics → Admin → Data Streams
- **Usage**: User behavior analytics

### Feature Flags

#### `VITE_ENABLE_ANALYTICS`
- **Purpose**: Enable/disable analytics tracking
- **Format**: Boolean string
- **Required**: No
- **Default**: `false`
- **Valid Values**: `true`, `false`
- **Example**: `true`

#### `VITE_ENABLE_ERROR_TRACKING`
- **Purpose**: Enable/disable error tracking (Sentry)
- **Format**: Boolean string
- **Required**: No
- **Default**: `false`
- **Valid Values**: `true`, `false`
- **Example**: `true`

#### `VITE_LOG_LEVEL`
- **Purpose**: Logging verbosity level
- **Format**: String enum
- **Required**: No
- **Default**: `INFO`
- **Valid Values**: `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`
- **Example**: `DEBUG` (development), `WARN` (production)

---

## Environment Setups

### Development Environment

Create `.env` file:
```bash
# Required
VITE_BASE44_PROJECT_ID=dev-project-id
VITE_BASE44_API_KEY=dev-api-key
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
# ... other variables
```

#### Staging Environment
```bash
# Environment variables for staging
# To be documented
```

#### Production Environment
```bash
# Environment variables for production
# To be documented
```

### 3. Secrets Management
- [ ] How secrets are stored
- [ ] How secrets are accessed
- [ ] Secret rotation procedures
- [ ] Who has access to secrets
- [ ] Emergency secret access procedures

### 4. Configuration Files

#### Vite Configuration
- [ ] `vite.config.js` - Build tool configuration
  - Purpose of each configuration option
  - Environment-specific overrides

#### Tailwind Configuration
- [ ] `tailwind.config.js` - Styling framework configuration
  - Theme customization
  - Plugin configuration

#### ESLint Configuration
- [ ] `eslint.config.js` - Linting rules
  - Rule explanations
  - Exceptions and overrides

#### TypeScript/JSConfig
- [ ] `jsconfig.json` - JavaScript configuration
  - Compiler options
  - Path aliases

#### PostCSS Configuration
- [ ] `postcss.config.js` - CSS processing
  - Plugin configuration

#### Package.json Scripts
- [ ] Build scripts
- [ ] Development scripts
- [ ] Test scripts
- [ ] Deployment scripts

### 5. Runtime Configuration
- [ ] Browser compatibility requirements
- [ ] Node.js version requirements
- [ ] npm/yarn version requirements
- [ ] Operating system requirements

### 6. Feature Configuration
- [ ] PWA manifest configuration
- [ ] Service worker configuration
- [ ] Analytics configuration
- [ ] Error tracking configuration

### 7. Database Configuration
- [ ] Base44 database connection
- [ ] Connection pooling
- [ ] Query timeouts
- [ ] Row-level security configuration

### 8. Security Configuration
- [ ] CORS configuration
- [ ] CSP (Content Security Policy) headers
- [ ] API rate limiting
- [ ] Authentication configuration
- [ ] Session configuration

### 9. Performance Configuration
- [ ] Cache configuration
- [ ] CDN configuration
- [ ] Asset optimization settings
- [ ] Service worker cache strategy

### 10. Logging and Monitoring Configuration
- [ ] Log level configuration
- [ ] Log destination configuration
- [ ] Monitoring service configuration
- [ ] Alert configuration

## Current State

**Environment Variables**: Referenced in code but not documented  
**Secrets Management**: Unknown  
**Configuration Files**: Exist but not fully documented  

**Critical Gaps**:
- Complete list of environment variables unknown
- No documentation of required vs. optional variables
- No secrets management documentation
- No environment-specific configuration guide

## Environment Variable Discovery

Based on code analysis, the following environment variables are referenced:
- `VITE_BASE44_PROJECT_ID` (found in package.json/vite.config.js)
- `VITE_BASE44_API_KEY` (found in package.json/vite.config.js)
- Additional variables need to be discovered through code audit

## Implementation Priority

This document must be completed **immediately** to prevent configuration errors during deployment.

**Estimated Effort**: 3 hours for documentation + code audit  
**Blocking**: Yes - All deployments  

## Setup Instructions

### For Developers
1. Copy `.env.example` to `.env.local` (if `.env.example` exists)
2. Fill in required environment variables
3. Source secrets from [SECRET_LOCATION]
4. Run `npm install` and `npm run dev`

### For Deployment
1. Configure environment variables in hosting platform
2. Set secrets in secure secret store
3. Verify configuration before deployment

## Related Documents

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [CI_CD.md](./CI_CD.md) - CI/CD configuration
- [SECURITY.md](./SECURITY.md) - Security configuration
- [ONBOARDING.md](./ONBOARDING.md) - Developer setup

---

**Action Required**: Engineering Lead must audit codebase for all environment variables and complete this document.
