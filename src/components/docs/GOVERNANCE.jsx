export const GOVERNANCE = `# AI Governance Documentation

## Overview

The AI Governance module provides comprehensive monitoring, policy enforcement, and compliance tracking for all AI interactions within the INT Inc. AI Platform.

## Core Capabilities

### 1. Usage Analytics

**Purpose**: Track and analyze AI usage patterns across the organization.

**Metrics Tracked**:
- Total interactions by agent/model
- Usage by type (chat, assessment, strategy, report, analysis)
- Cost per interaction and total spend
- Average latency and performance metrics
- Daily/weekly/monthly trends
- User-level and team-level aggregation

**Visualizations**:
- Interactions by agent (bar chart)
- Usage by type (pie chart)
- Daily usage trends (line chart)
- Cost analysis per agent

**Business Value**:
- Identify most valuable AI use cases
- Optimize AI spending
- Detect usage anomalies
- Plan capacity and budgets

### 2. Policy Management

**Policy Types**:

**Usage Policies**:
- Acceptable use guidelines
- Content restrictions
- Rate limiting rules

**Privacy Policies**:
- PII detection and blocking
- Data minimization requirements
- Consent management

**Fairness Policies**:
- Bias detection triggers
- Inclusive language requirements
- Demographic fairness standards

**Transparency Policies**:
- Explainability requirements
- User notification rules
- Disclosure standards

**Security Policies**:
- Access control rules
- Credential protection
- Secure data handling

**Compliance Policies**:
- Regulatory requirement mapping
- Industry-specific standards
- Geographic restrictions

**Policy Configuration**:

\`\`\`javascript
{
    "policy_name": "Data Privacy Protection",
    "policy_type": "privacy",
    "description": "Ensure no PII in AI interactions",
    "rules": [
        {
            "rule_id": "privacy-001",
            "rule_description": "No credit card numbers",
            "severity": "critical",
            "enforcement": "block"
        }
    ],
    "applicable_agents": ["all"],
    "status": "active",
    "version": "1.0"
}
\`\`\`

**Enforcement Modes**:
- **Block**: Prevent interaction from proceeding
- **Warn**: Allow but flag for review
- **Log**: Record for audit purposes

**Policy Lifecycle**:
1. Draft policy
2. Review by compliance team
3. Activate policy
4. Monitor compliance
5. Periodic review (configurable frequency)
6. Update or archive

### 3. Automated Bias Detection

**Scanning Mechanism**:

**Scheduled Scans**:
- Daily, weekly, bi-weekly, or monthly frequency
- Configurable per agent/model
- Automatic execution in background

**Manual Scans**:
- On-demand testing
- Post-deployment validation
- Incident investigation

**Scan Process**:
1. Fetch recent usage logs (configurable lookback period)
2. Extract prompts and responses
3. Analyze for bias patterns using LLM
4. Calculate bias scores across dimensions
5. Identify specific issues with examples
6. Generate mitigation strategies
7. Create policy recommendations
8. Flag high-risk interactions
9. Send alerts if critical issues found

**Bias Metrics** (0-100 scale):
- **Gender Bias**: Stereotyping, gendered language, assumptions
- **Racial/Ethnic Bias**: Cultural assumptions, stereotypes, representation
- **Age Bias**: Generational assumptions, age-related stereotypes
- **Language/Cultural Bias**: Anglophone bias, cultural norms, idioms
- **Overall Fairness Score**: Composite metric (0-100, higher is better)

**Detected Issue Structure**:
\`\`\`javascript
{
    "issue_type": "Gender Bias",
    "severity": "high",
    "description": "Gendered assumptions in role descriptions",
    "examples": [
        "Using 'he' as default pronoun for engineers",
        "Assuming nurses are female"
    ],
    "recommendation": "Use gender-neutral language",
    "mitigation_strategies": [
        {
            "strategy": "Update prompt templates to use 'they/them'",
            "priority": "high",
            "estimated_effort": "2 hours",
            "expected_impact": "90% reduction in gender bias"
        }
    ]
}
\`\`\`

**Automated Actions**:

When bias detected:
1. **Flag Usage Logs**: Add bias_flags to affected interactions
2. **Generate Mitigations**: AI creates actionable strategies
3. **Recommend Policies**: Suggest new or updated policies
4. **Alert Admins**: Email critical issues to administrators
5. **Update Dashboard**: Display findings in Governance UI

**Configuration Options**:
- Auto-flag high-risk interactions: On/Off
- Send critical alerts: On/Off
- Auto-generate mitigation strategies: On/Off
- Suggest policy updates: On/Off

### 4. Mitigation Strategies

**AI-Generated Mitigations**:

For each detected issue, AI generates:
- **Strategy**: Specific action to address the issue
- **Priority**: Low, medium, high, critical
- **Estimated Effort**: Time/resources required
- **Expected Impact**: Predicted effectiveness

**Example Strategies**:
\`\`\`
Issue: Gender Bias in Technical Descriptions

Strategy 1 (High Priority):
- Update all agent prompts to use gender-neutral pronouns
- Effort: 4 hours
- Impact: 85% reduction in gender bias

Strategy 2 (Medium Priority):
- Implement bias detection in real-time
- Effort: 1 week
- Impact: 95% reduction + ongoing monitoring

Strategy 3 (Low Priority):
- Conduct team training on inclusive language
- Effort: 2 days
- Impact: Long-term cultural change
\`\`\`

**Implementation Tracking**:
- Mark strategies as "Implemented"
- Track effectiveness post-implementation
- Measure bias score reduction

### 5. Policy Recommendations

**AI-Generated Policy Updates**:

Based on bias scans, AI suggests:
- **Create**: New policies for uncovered areas
- **Update**: Strengthen existing policies
- **Strengthen**: Add rules to existing policies

**Recommendation Structure**:
\`\`\`javascript
{
    "action": "create",
    "policy_name": "Inclusive Language Standard",
    "policy_type": "fairness",
    "rationale": "Detected gender bias in 15% of interactions",
    "suggested_rules": [
        {
            "rule_description": "Use gender-neutral pronouns",
            "severity": "high",
            "enforcement": "warn"
        },
        {
            "rule_description": "Avoid gendered role assumptions",
            "severity": "medium",
            "enforcement": "warn"
        }
    ]
}
\`\`\`

**Workflow**:
1. AI generates recommendation
2. Compliance team reviews
3. Approve, modify, or reject
4. Activate policy
5. Monitor effectiveness

### 6. Audit Logging

**Logged Data** (for every AI interaction):
- Timestamp
- User email
- Agent/model name
- Interaction type
- Full prompt
- Full response
- Tokens consumed
- Cost (USD)
- Latency (ms)
- Policy compliance status
- Bias flags (if any)
- Context data

**Audit Trail Features**:
- **Search**: Filter by user, agent, date range, compliance status
- **Export**: Download as CSV for compliance reporting
- **Retention**: Configurable (default 90 days)
- **Immutable**: Logs cannot be modified, only read

**Compliance Reporting**:
\`\`\`javascript
// Generate quarterly compliance report
const logs = await base44.entities.AIUsageLog.filter({
    created_date: { $gte: quarterStartDate }
});

const report = {
    total_interactions: logs.length,
    policy_violations: logs.filter(l => !l.policy_compliance?.compliant).length,
    bias_incidents: logs.filter(l => l.bias_flags?.length > 0).length,
    average_cost: calculateAverage(logs, 'cost'),
    compliance_rate: calculateComplianceRate(logs)
};
\`\`\`

## Backend Function: Automated Bias Scan

### Function: \`automatedBiasScan\`

**Purpose**: Perform automated bias detection on recent AI interactions.

**Inputs**:
\`\`\`javascript
{
    "agent_name": "StrategyAdvisor" | "all",
    "lookback_days": 7  // How far back to analyze
}
\`\`\`

**Process**:
1. Authenticate request (service role for automation)
2. Fetch recent usage logs within lookback period
3. Filter by agent (if specified)
4. Analyze logs with AI for bias patterns
5. Calculate bias scores across dimensions
6. Identify specific issues with examples
7. Generate mitigation strategies
8. Recommend policy updates
9. Create BiasMonitoring record
10. Flag high-risk usage logs
11. Send critical alerts to admins (if needed)

**Outputs**:
\`\`\`javascript
{
    "success": true,
    "scan_id": "scan_abc123",
    "agent_name": "StrategyAdvisor",
    "sample_size": 342,
    "status": "needs_attention",
    "risk_level": "medium",
    "issues_detected": 3,
    "logs_flagged": 12,
    "notification_sent": false,
    "policy_recommendations": 2,
    "summary": {
        "bias_metrics": {...},
        "automated_actions": [...]
    }
}
\`\`\`

**Error Handling**:
- No logs to analyze: Return informative message
- LLM API failure: Retry up to 3 times
- Schema validation failure: Log and notify admins

**Scheduling**:
Can be called:
- Via cron job (not yet implemented in Base44)
- Manually via Dashboard → Code → Functions
- From frontend via automated scan configuration

## Best Practices

### For Compliance Teams

1. **Regular Reviews**:
   - Review bias scans weekly
   - Audit policy effectiveness monthly
   - Update policies quarterly

2. **Incident Response**:
   - Acknowledge critical alerts within 24h
   - Investigate high-risk logs within 48h
   - Implement mitigations within 1 week

3. **Documentation**:
   - Document all policy changes
   - Maintain incident log
   - Archive compliance reports

### For Administrators

1. **Proactive Monitoring**:
   - Enable automated scans for all agents
   - Set up critical alert notifications
   - Review usage analytics weekly

2. **Policy Management**:
   - Start with default policies
   - Customize for organizational needs
   - Version control all changes

3. **User Education**:
   - Train users on policies
   - Share compliance reports
   - Highlight bias mitigation wins

### For Developers

1. **Integration**:
   - Log all AI interactions
   - Include context data in logs
   - Handle policy violations gracefully

2. **Testing**:
   - Test bias detection before deployment
   - Validate policy enforcement
   - Monitor performance impact

3. **Optimization**:
   - Cache frequent LLM calls
   - Batch log writes when possible
   - Use async logging to avoid blocking UI

## Metrics & KPIs

### Governance Health Metrics

- **Policy Compliance Rate**: % of interactions compliant
- **Bias Incident Rate**: Bias flags per 1000 interactions
- **Average Fairness Score**: Overall fairness across agents
- **Mean Time to Resolution**: Time from detection to mitigation
- **Policy Coverage**: % of use cases with policies

### Cost Metrics

- **Total AI Spend**: Monthly/quarterly spend
- **Cost per Interaction**: Average cost
- **Cost by Agent**: Spend distribution
- **Cost Trend**: Month-over-month change

### Performance Metrics

- **Average Latency**: Response time across agents
- **Availability**: Uptime percentage
- **Error Rate**: Failed interactions per total

## Future Enhancements

### Planned Features

- **Real-Time Bias Detection**: Flag bias during interaction, not post-hoc
- **Federated Learning**: Train bias models on organizational data
- **Custom Bias Dimensions**: Define org-specific bias categories
- **Automated Remediation**: Auto-correct biased outputs
- **Explainable AI**: Detailed explanation of bias detection
- **Multi-Language Support**: Bias detection in 20+ languages
- **Regulatory Templates**: Pre-built policies for GDPR, HIPAA, etc.

### Research Areas

- Adversarial testing for bias detection
- Causal analysis of bias sources
- Fairness-aware fine-tuning
- Stakeholder-specific fairness metrics
`;