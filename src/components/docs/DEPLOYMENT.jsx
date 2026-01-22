export const DEPLOYMENT = `# Deployment Guide

## Deployment Architecture

The INT Inc. AI Platform is deployed on the Base44 platform, which provides:
- Frontend hosting (CDN-distributed React app)
- Backend functions (Deno Deploy serverless)
- Database (Managed PostgreSQL)
- Authentication & Authorization
- File storage
- Real-time subscriptions

## Prerequisites

- Base44 account (admin access)
- Git repository access
- Node.js 18+ installed locally
- npm or yarn package manager

## Development Environment

### Local Setup

1. **Clone Repository**
\`\`\`bash
git clone [repository-url]
cd int-inc-ai-platform
\`\`\`

2. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Configure Environment**
Create \`.env.local\`:
\`\`\`env
BASE44_APP_ID=your_app_id
BASE44_API_KEY=your_api_key_for_dev
\`\`\`

4. **Run Development Server**
\`\`\`bash
npm run dev
\`\`\`

Access at: \`http://localhost:5173\`

### Hot Reload

Changes to the following trigger hot reload:
- Pages (\`pages/*.js\`)
- Components (\`components/**/*.jsx\`)
- Styles (\`globals.css\`)

Changes requiring server restart:
- Entities (\`entities/*.json\`)
- Backend functions (\`functions/*.js\`)
- Agents (\`agents/*.json\`)

## Production Deployment

### Via Base44 Dashboard

1. **Login to Base44**
   - Navigate to your app dashboard
   - Go to "Deploy" section

2. **Git Integration** (Recommended)
   - Connect GitHub/GitLab repository
   - Configure auto-deploy on push to main branch
   - Set production branch (usually \`main\` or \`production\`)

3. **Manual Deployment**
   - Zip project files
   - Upload via Base44 dashboard
   - Click "Deploy"

### Via CLI (Coming Soon)

\`\`\`bash
base44 deploy --production
\`\`\`

## Environment Configuration

### Production Secrets

Set via Base44 Dashboard → Settings → Environment Variables:

**Required**:
- (None - Base44 auto-configures BASE44_APP_ID)

**Optional** (for enhanced features):
- \`OPENAI_API_KEY\`: For OpenAI-specific features
- \`GOOGLE_API_KEY\`: For Google services
- \`ANTHROPIC_API_KEY\`: For Claude-specific features

### Feature Flags

Configure in Base44 Dashboard → Settings → Features:
- \`ENABLE_BIAS_MONITORING\`: Enable/disable bias scans (default: true)
- \`ENABLE_AGENT_WHATSAPP\`: Enable WhatsApp integration (default: true)
- \`ENABLE_AUTO_REPORTS\`: Enable scheduled reports (default: true)

## Database Migrations

### Entity Schema Changes

**Process**:
1. Update \`entities/EntityName.json\`
2. Commit and push to repository
3. Base44 automatically applies schema changes
4. No downtime - additive changes are safe
5. Breaking changes require data migration plan

**Safe Changes**:
- Adding new optional fields
- Adding new entities
- Updating field descriptions
- Adding enum values

**Unsafe Changes** (require migration):
- Removing fields
- Changing field types
- Making optional fields required
- Removing enum values

### Data Migration

For breaking changes:
1. Create migration function in \`functions/migrate_*.js\`
2. Deploy function
3. Run migration via Base44 dashboard
4. Verify data integrity
5. Deploy schema changes

Example migration:
\`\`\`javascript
// functions/migrate_add_risk_level.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const records = await base44.asServiceRole.entities.BiasMonitoring.list();
    
    for (const record of records) {
        if (!record.risk_level) {
            await base44.asServiceRole.entities.BiasMonitoring.update(record.id, {
                risk_level: 'medium' // default value
            });
        }
    }
    
    return Response.json({ 
        success: true, 
        migrated: records.length 
    });
});
\`\`\`

## Backend Functions Deployment

### Function Structure

All functions in \`functions/\` directory auto-deploy when pushed.

**Requirements**:
- Must use \`Deno.serve(async (req) => {...})\`
- Must return \`Response.json({...})\`
- Import Base44 SDK: \`npm:@base44/sdk@0.8.6\`

### Function Testing

Before deploying:
\`\`\`bash
# Test locally (if Deno installed)
deno run --allow-net functions/myFunction.js

# Test via Base44 dashboard
# Dashboard → Code → Functions → [Function Name] → Test
\`\`\`

### Function Monitoring

Access logs:
- Base44 Dashboard → Code → Functions → [Function Name] → Logs
- View execution time, errors, response codes

## Rollback Procedures

### Frontend Rollback

**Via Git**:
1. Identify last working commit
2. Create rollback branch
\`\`\`bash
git checkout -b rollback-to-[commit]
git reset --hard [commit-hash]
git push origin rollback-to-[commit]
\`\`\`
3. Deploy rollback branch via Base44 dashboard

### Backend Function Rollback

1. Go to Dashboard → Code → Functions
2. Select function
3. View version history
4. Click "Rollback to version X"

### Database Rollback

**Not recommended** - use forward migrations instead:
1. Create new migration to revert changes
2. Test thoroughly
3. Deploy and execute

## Performance Optimization

### Frontend Optimization

**Build Optimization**:
- Automatic code splitting by route
- Tree shaking of unused code
- CSS purging (Tailwind)
- Image optimization (if using Base44 CDN)

**Runtime Optimization**:
- React Query caching (5-minute default)
- Lazy loading of heavy components
- Debounced search inputs
- Virtualized lists for large datasets

### Backend Optimization

**Function Cold Starts**:
- Keep functions warm with scheduled pings
- Minimize import statements
- Use lightweight libraries

**Database Queries**:
- Index frequently queried fields
- Use filters instead of list + filter client-side
- Batch create/update when possible

## Monitoring & Alerts

### Application Monitoring

**Available Metrics**:
- Page load times
- API response times
- Error rates
- User sessions
- Feature usage

**Access**: Base44 Dashboard → Analytics

### Custom Alerts

Set up via Base44 Dashboard → Alerts:
- Error rate threshold alerts
- Cost threshold alerts
- Usage spike alerts
- Downtime alerts

## Security Hardening

### Production Checklist

- [ ] All secrets set via environment variables
- [ ] No API keys in code or config files
- [ ] HTTPS enforced (automatic with Base44)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection protection (via Base44 ORM)
- [ ] XSS protection (React default)
- [ ] CSRF protection (Base44 handles)
- [ ] Audit logging enabled

### Security Headers

Base44 automatically configures:
- \`Content-Security-Policy\`
- \`X-Frame-Options: DENY\`
- \`X-Content-Type-Options: nosniff\`
- \`Strict-Transport-Security\`

## Backup & Recovery

### Automated Backups

Base44 provides:
- Daily database snapshots (retained 30 days)
- Point-in-time recovery (last 7 days)
- File storage backups (retained 30 days)

### Manual Backups

Export data:
\`\`\`javascript
// Create export function
const data = await base44.entities.EntityName.list('-created_date', 10000);
// Convert to CSV or JSON
// Download via browser
\`\`\`

## Scaling Considerations

### Current Limits

- **Concurrent Users**: 10,000+
- **Database Records**: Unlimited
- **File Storage**: 10GB (upgradeable)
- **Function Executions**: 1M/month (upgradeable)
- **AI API Calls**: Fair use policy

### Scaling Strategy

**Vertical Scaling** (Base44 handles automatically):
- Increased database connections
- More function instances
- CDN edge locations

**Horizontal Scaling** (if needed):
- Implement read replicas for analytics
- Separate databases per tenant (enterprise)
- Dedicated function deployments

## Disaster Recovery

### Recovery Time Objective (RTO)

- **Frontend**: < 5 minutes (rollback deployment)
- **Backend Functions**: < 5 minutes (version rollback)
- **Database**: < 15 minutes (point-in-time restore)

### Recovery Point Objective (RPO)

- **Data Loss Window**: < 5 minutes (continuous replication)
- **Backup Frequency**: Every 24 hours (full snapshot)

### DR Procedure

1. **Identify Issue**: Check Base44 status, logs, alerts
2. **Assess Impact**: Determine affected systems
3. **Execute Recovery**:
   - Frontend: Rollback deployment
   - Functions: Restore previous version
   - Database: Point-in-time recovery
4. **Verify**: Test critical user flows
5. **Communicate**: Notify affected users
6. **Post-Mortem**: Document incident and prevention

## Health Checks

### Automated Checks

Base44 monitors:
- Frontend availability (every 60s)
- Function health (every 5 minutes)
- Database connectivity (continuous)

### Custom Health Endpoint

Create \`functions/health.js\`:
\`\`\`javascript
Deno.serve(async (req) => {
    return Response.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});
\`\`\`

Access: \`https://[app-url]/api/health\`

## Cost Management

### Monitoring Costs

Track via Base44 Dashboard → Billing:
- Function execution costs
- Database usage
- File storage
- AI API costs (via AIUsageLog entity)

### Cost Optimization

**Strategies**:
1. Cache LLM responses (24h for static content)
2. Batch AI calls when possible
3. Use smaller models for simple tasks
4. Implement request throttling
5. Archive old data to cold storage
6. Monitor and alert on budget thresholds

## Compliance

### Data Residency

Configure in Base44 Dashboard → Settings → Data Location:
- US East
- EU West
- Asia Pacific

### Compliance Certifications

Base44 provides:
- SOC 2 Type II
- GDPR compliance
- ISO 27001
- HIPAA (enterprise tier)

### Audit Requirements

- Enable comprehensive audit logging
- Export logs quarterly for compliance review
- Implement data retention policies
- Configure user access reviews

## Troubleshooting

### Common Issues

**Issue**: Functions not deploying
**Solution**: Check Deno syntax, ensure \`Deno.serve\` wrapper

**Issue**: Entity changes not reflecting
**Solution**: Hard refresh browser, check schema validity

**Issue**: Authentication errors
**Solution**: Verify Base44 API key, check user permissions

**Issue**: High AI costs
**Solution**: Review AIUsageLog, implement caching, optimize prompts

### Support Channels

- Base44 Documentation: https://docs.base44.com
- Community Forum: https://community.base44.com
- Email Support: support@base44.com
- Emergency: emergency@base44.com
`;