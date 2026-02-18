# Deployment Guide

**Document Status**: ✅ **Completed**  
**Priority**: P0 - Critical  
**Last Updated**: 2026-02-18  
**Owner**: DevOps/Engineering Team

---

## Purpose

This document provides comprehensive deployment procedures for all environments including build processes, deployment steps, verification procedures, and rollback strategies.

---

## Table of Contents

1. [Environment Overview](#environment-overview)
2. [Prerequisites](#prerequisites)
3. [Build Process](#build-process)
4. [Deployment Procedures](#deployment-procedures)
5. [Rollback Procedures](#rollback-procedures)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)

---

## Environment Overview

### Environments

| Environment | Purpose | URL Pattern | Branch | Auto-Deploy |
|-------------|---------|-------------|--------|-------------|
| **Development** | Local development | `http://localhost:5173` | Any | No |
| **Staging** | Pre-production testing | `https://staging.example.com` | `develop` | Yes (via CI/CD) |
| **Production** | Live user environment | `https://app.example.com` | `main` | Manual approval |

### Environment Access

- **Development**: All developers (local machine)
- **Staging**: Engineering team + QA
- **Production**: DevOps team + on-call engineers

---

## Prerequisites

### Required Tools

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Environment Variables**
   - See [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) for complete list
   - Ensure `.env` file is configured for your environment

### Required Access

- [ ] GitHub repository access
- [ ] Base44 platform account
- [ ] Cloud hosting provider access (AWS/Vercel/Netlify)
- [ ] Secrets management system access
- [ ] Monitoring dashboard access (if production)

---

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Start development server (hot reload enabled)
npm run dev

# Access at http://localhost:5173
```

**Development Features:**
- Hot module replacement (HMR)
- Source maps enabled
- Detailed error messages
- No minification
- Fast build times

### Production Build

```bash
# Install dependencies (production only)
npm ci --production=false

# Run linter
npm run lint

# Run tests
npm test

# Type check
npm run typecheck

# Build for production
npm run build

# Output: ./dist directory
```

**Production Optimizations:**
- Minified JavaScript and CSS
- Tree shaking (remove unused code)
- Asset optimization and compression
- Code splitting for faster loads
- Source maps (external, not inline)

### Build Verification

After building, verify the output:

```bash
# Check dist directory was created
ls -lh dist/

# Preview production build locally
npm run preview

# Access at http://localhost:4173
```

**Expected Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [PWA assets]
```

---

## Deployment Procedures

### Development Deployment

**Purpose**: Local development and testing

**Steps**:
1. Clone repository:
   ```bash
   git clone https://github.com/Krosebrook/ai-adoption-strategist.git
   cd ai-adoption-strategist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local values
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Verify:
   - Open `http://localhost:5173`
   - Check console for errors
   - Test authentication flow

---

### Staging Deployment

**Purpose**: Pre-production testing with production-like data

**Prerequisites**:
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations prepared (if any)

**Deployment Steps**:

1. **Pre-Deployment Checklist**:
   ```bash
   # Ensure on correct branch
   git checkout develop
   git pull origin develop
   
   # Run full test suite
   npm test
   
   # Run linter
   npm run lint
   
   # Build locally to verify
   npm run build
   ```

2. **Merge to Develop Branch**:
   ```bash
   git checkout develop
   git merge feature/your-feature
   git push origin develop
   ```

3. **Automated CI/CD** (GitHub Actions):
   - Workflow automatically triggers on push to `develop`
   - Runs: lint, test, build
   - Deploys to staging environment
   - Sends notification to Slack

4. **Manual Deployment** (if CI/CD not configured):
   ```bash
   # Build production assets
   npm run build
   
   # Deploy to staging (example for Netlify)
   netlify deploy --prod --dir=dist
   
   # Or for Vercel
   vercel --prod
   ```

5. **Post-Deployment Verification**:
   ```bash
   # Check deployment status
   curl -I https://staging.example.com
   
   # Expected: HTTP/2 200 OK
   ```

6. **Smoke Tests**:
   - [ ] Homepage loads
   - [ ] Authentication works
   - [ ] Critical user flows function
   - [ ] No console errors
   - [ ] API endpoints responding

---

### Production Deployment

**Purpose**: Deploy to live user environment

**⚠️ CRITICAL: Production deployments require approval and monitoring**

**Prerequisites**:
- [ ] Successfully deployed to staging
- [ ] Staging verified by QA
- [ ] Approval from product owner
- [ ] Deployment window scheduled
- [ ] On-call engineer available
- [ ] Rollback plan prepared

**Pre-Deployment Checklist**:
```bash
# 1. Verify staging is stable
# Monitor staging for 24-48 hours

# 2. Create production release branch
git checkout main
git pull origin main
git merge develop
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. Run full verification
npm ci
npm run lint
npm test
npm run build

# 4. Security scan
npm audit
# Fix any high/critical vulnerabilities
```

**Deployment Steps**:

1. **Notify Stakeholders**:
   - Post in #deployments Slack channel
   - Send email to stakeholders
   - Update status page (if applicable)

2. **Deploy**:
   ```bash
   # Push release tag
   git push origin main
   git push origin v1.0.0
   
   # Manual deployment (if needed)
   npm run build
   # Upload dist/ to hosting provider
   ```

3. **Monitor Deployment**:
   ```bash
   # Watch CI/CD pipeline
   # Monitor error tracking dashboard
   # Check application logs
   ```

4. **Post-Deployment Verification**:
   - [ ] Homepage loads (`https://app.example.com`)
   - [ ] Authentication works
   - [ ] Critical paths tested
   - [ ] Error rates normal
   - [ ] Response times acceptable
   - [ ] No spike in error tracking

5. **Health Checks** (see [Health Checks](#health-checks) section)

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- ❌ Critical functionality broken
- ❌ Error rate >5%
- ❌ Performance degradation >50%
- ❌ Security vulnerability introduced
- ❌ Data corruption detected

### Rollback Steps

**Method 1: Revert Git Commit** (Preferred)

```bash
# 1. Identify last good commit
git log --oneline

# 2. Revert to last good commit
git revert HEAD
git push origin main

# 3. Re-deploy automatically via CI/CD
# Or manually trigger deployment
```

**Method 2: Redeploy Previous Version**

```bash
# 1. Checkout previous tag
git checkout v1.0.0  # Last stable version

# 2. Build and deploy
npm ci
npm run build
# Deploy dist/ directory

# 3. Verify rollback
curl -I https://app.example.com
```

**Method 3: Hosting Provider Rollback** (Fastest)

For platforms like Vercel/Netlify:
```bash
# Vercel CLI
vercel rollback

# Netlify CLI
netlify rollback
```

### Post-Rollback

1. **Verify Stability**:
   - Check error rates returned to normal
   - Test critical functionality
   - Monitor for 15-30 minutes

2. **Incident Report**:
   - Document what went wrong
   - Root cause analysis
   - Create fix plan
   - Update runbook if needed

3. **Communication**:
   - Notify stakeholders of rollback
   - Update status page
   - Post in Slack #incidents

---

## Health Checks

### Automated Health Checks

Create `/health` endpoint (if not exists):

```javascript
// Example health check endpoint
export default async function health(req) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: await checkDatabase(),
      api: await checkAPI(),
      cache: await checkCache(),
    }
  }
  
  const allHealthy = Object.values(checks.checks).every(c => c.status === 'ok')
  
  return Response.json(checks, {
    status: allHealthy ? 200 : 503
  })
}
```

### Manual Health Checks

**After Every Deployment**:

```bash
# 1. Check HTTP status
curl -I https://app.example.com
# Expected: 200 OK

# 2. Check health endpoint
curl https://app.example.com/health
# Expected: {"status":"healthy"}

# 3. Check JavaScript loads
curl https://app.example.com | grep -o '<script' | wc -l
# Expected: >0

# 4. Check API connectivity
curl https://app.example.com/api/status
```

**Critical User Flows**:
- [ ] User can log in
- [ ] User can create assessment
- [ ] User can generate report
- [ ] User can export data

### Monitoring Dashboard

**Key Metrics to Watch** (first 30 minutes post-deploy):
- Error rate (should be <1%)
- Response time (p95 should be <2s)
- Throughput (requests/second)
- 4xx/5xx errors
- JavaScript errors in Sentry

---

## Troubleshooting

### Common Deployment Issues

#### Build Fails

**Symptom**: `npm run build` fails

**Solutions**:
```bash
# 1. Clear cache
rm -rf node_modules package-lock.json
npm install

# 2. Check Node version
node --version  # Must be 18+

# 3. Check for TypeScript errors
npm run typecheck

# 4. Check for linting errors
npm run lint
```

#### Environment Variables Missing

**Symptom**: App fails to start, "undefined" errors

**Solutions**:
```bash
# 1. Verify .env file exists
ls -la .env

# 2. Check required variables
cat .env | grep VITE_BASE44_PROJECT_ID

# 3. Verify variables loaded
npm run dev  # Check console output
```

#### Build Output Too Large

**Symptom**: Bundle size warnings, slow page loads

**Solutions**:
1. Check bundle analysis:
   ```bash
   npm run build -- --sourcemap
   # Analyze size in dist/
   ```

2. Reduce bundle size:
   - Use dynamic imports for large components
   - Remove unused dependencies
   - Optimize images

#### Deployment Fails on CI/CD

**Symptom**: GitHub Actions fails

**Solutions**:
1. Check workflow logs in GitHub
2. Verify secrets are configured
3. Test build locally first
4. Check Node version in workflow matches local

---

## Deployment Checklist Template

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Linter passing
- [ ] Build successful locally
- [ ] Environment variables configured
- [ ] Database migrations prepared (if needed)
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### Deployment
- [ ] Deploy to staging first
- [ ] Staging smoke tests passed
- [ ] Approval obtained
- [ ] Deploy to production
- [ ] Monitor for 15 minutes

### Post-Deployment
- [ ] Health checks passed
- [ ] Critical flows tested
- [ ] Error rates normal
- [ ] Performance metrics acceptable
- [ ] Stakeholders notified of success
- [ ] Documentation updated

### Rollback (if needed)
- [ ] Rollback executed
- [ ] Stability verified
- [ ] Incident documented
- [ ] Stakeholders notified

---

## Next Steps

After successful deployment:
1. Monitor application for 24-48 hours
2. Review error tracking dashboards
3. Analyze user feedback
4. Plan next release
5. Update runbook with lessons learned

For questions or issues, contact:
- **Engineering**: engineering@example.com
- **DevOps**: devops@example.com
- **On-Call**: Check PagerDuty/OpsGenie

---

**Last Updated**: 2026-02-18  
**Next Review**: 2026-03-18
- [ ] Rollback commands
- [ ] Data rollback considerations
- [ ] Rollback verification
- [ ] Post-rollback communication

### 6. Database Migrations
- [ ] Migration strategy
- [ ] Running migrations
- [ ] Migration rollback
- [ ] Zero-downtime migrations

### 7. Deployment Verification
- [ ] Health check endpoints
- [ ] Smoke test procedures
- [ ] Key functionality verification
- [ ] Performance verification
- [ ] Security verification

### 8. Deployment Checklist

#### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Change log updated
- [ ] Stakeholders notified

#### During Deployment
- [ ] Deployment started notification
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health checks passing

#### Post-Deployment
- [ ] Smoke tests completed
- [ ] Monitoring alerts reviewed
- [ ] Error rates normal
- [ ] Performance metrics normal
- [ ] Deployment completed notification

### 9. Troubleshooting
- [ ] Common deployment issues
- [ ] Failed build troubleshooting
- [ ] Failed deployment troubleshooting
- [ ] Emergency contacts

### 10. Hosting Infrastructure
- [ ] Frontend hosting (Vercel/Netlify/etc.)
- [ ] Backend hosting (Base44)
- [ ] CDN configuration
- [ ] DNS configuration
- [ ] SSL/TLS certificates

## Current State

**Deployment Process**: Manual (undocumented)  
**CI/CD**: Not configured  
**Hosting**: Not documented  
**Rollback**: No documented procedure  

**Critical Gaps**:
- No documented deployment procedure
- No automated deployment
- No rollback plan
- No deployment verification checklist

## Implementation Priority

This document must be completed **before** production deployment.

**Estimated Effort**: 4 hours for documentation + implementation time varies  
**Blocking**: Yes - Production deployment  

## Related Documents

- [CI_CD.md](./CI_CD.md) - Automated deployment via CI/CD
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - Environment configuration
- [RUNBOOKS.md](./RUNBOOKS.md) - Operational runbooks
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Incident handling

---

**Action Required**: DevOps/Engineering Lead must complete this document and establish deployment procedures.
