# Documentation Index

**Last Updated**: 2026-01-21  
**Documentation Maturity**: Level 2 of 5 (Developing)  
**Audit Report**: [DOCUMENTATION_AUDIT.md](../DOCUMENTATION_AUDIT.md)

This index provides a comprehensive overview of all project documentation to help developers and AI systems quickly identify relevant sections within the full documentation.

## ⚠️ Critical Documentation Gaps

**Production Blockers** - The following documents are **required before production deployment**:

- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - [Not Started] - P0 Critical
- [DEPLOYMENT.md](./DEPLOYMENT.md) - [Not Started] - P0 Critical
- [CI_CD.md](./CI_CD.md) - [Not Started] - P0 Critical
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - [Not Started] - P0 Critical
- [OBSERVABILITY.md](./OBSERVABILITY.md) - [Not Started] - P0 Critical
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - [Not Started] - P0 Critical

See [DOCUMENTATION_AUDIT.md](../DOCUMENTATION_AUDIT.md) for complete audit findings and remediation plan.

## Core Documentation Files

### 1. [DOC_POLICY.md](./DOC_POLICY.md)
**Purpose**: Outlines the governance, versioning, and approval process for all project documentation.

**Key Topics**:
- Documentation lifecycle management
- Version control and change tracking
- Review and approval workflows
- Documentation standards and templates
- Maintenance responsibilities

### 2. [AGENTS_DOCUMENTATION_AUTHORITY.md](./AGENTS_DOCUMENTATION_AUTHORITY.md)
**Purpose**: Details the architecture and implementation of the AI-driven Documentation Authority system.

**Key Topics**:
- AI agent roles and responsibilities
- Documentation generation workflows
- Quality assurance mechanisms
- Integration with development processes
- Agent coordination patterns

### 3. [SECURITY.md](./SECURITY.md)
**Purpose**: Comprehensive overview of the application's security architecture, data handling, and compliance measures.

**Key Topics**:
- Security architecture and design principles
- Authentication and authorization mechanisms
- Data encryption and protection
- Compliance requirements (GDPR, SOC2, etc.)
- Vulnerability reporting and incident response

### 4. [FRAMEWORK.md](./FRAMEWORK.md)
**Purpose**: Describes the core technologies, libraries, and architectural patterns used in the project.

**Key Topics**:
- React framework and component architecture
- Tailwind CSS styling approach
- TypeScript implementation patterns
- Base44 backend integration
- Third-party libraries and dependencies

### 5. [CHANGELOG_SEMANTIC.md](./CHANGELOG_SEMANTIC.md)
**Purpose**: Explains the semantic versioning approach for releases and how changes are documented.

**Key Topics**:
- Semantic versioning (SemVer) principles
- Version numbering scheme
- Release types (major, minor, patch)
- Changelog format and maintenance
- Breaking change communication

### 6. [API_REFERENCE.md](./API_REFERENCE.md)
**Purpose**: Provides a reference for available API endpoints and how to interact with them.

**Key Topics**:
- API endpoint catalog
- Request/response formats
- Authentication requirements
- Rate limiting and quotas
- Error handling and status codes

### 7. [ARCHITECTURE.md](./ARCHITECTURE.md)
**Purpose**: High-level architectural overview of the entire system.

**Key Topics**:
- System architecture diagram
- Component relationships
- Data flow and state management
- Frontend/backend separation
- Scalability considerations

### 8. [ENTITY_ACCESS_RULES.md](./ENTITY_ACCESS_RULES.md)
**Purpose**: Detailed explanation of role-based access control (RBAC) rules for each database entity.

**Key Topics**:
- User roles and permissions
- Entity-level access controls
- CRUD operation permissions
- Data visibility rules
- Permission inheritance

### 9. [GITHUB_SETUP_INSTRUCTIONS.md](./GITHUB_SETUP_INSTRUCTIONS.md)
**Purpose**: Manual steps for setting up the GitHub repository and Actions for CI/CD.

**Key Topics**:
- Repository configuration
- GitHub Actions workflows
- Environment secrets and variables
- Deployment pipelines
- Branch protection rules

### 10. [PRD_MASTER.md](./PRD_MASTER.md)
**Purpose**: The overarching Product Requirements Document for the platform.

**Key Topics**:
- Product vision and objectives
- Feature requirements and specifications
- User stories and acceptance criteria
- Success metrics and KPIs
- Roadmap and milestones

## Quick Reference

### For Development
- **Getting Started**: See [FRAMEWORK.md](./FRAMEWORK.md) and [GITHUB_SETUP_INSTRUCTIONS.md](./GITHUB_SETUP_INSTRUCTIONS.md)
- **API Integration**: Refer to [API_REFERENCE.md](./API_REFERENCE.md)
- **Architecture Decisions**: Check [ARCHITECTURE.md](./ARCHITECTURE.md)

### For Security
- **Security Practices**: Review [SECURITY.md](./SECURITY.md)
- **Access Control**: See [ENTITY_ACCESS_RULES.md](./ENTITY_ACCESS_RULES.md)

### For Documentation Maintenance
- **Documentation Standards**: Follow [DOC_POLICY.md](./DOC_POLICY.md)
- **AI Documentation**: Understand [AGENTS_DOCUMENTATION_AUTHORITY.md](./AGENTS_DOCUMENTATION_AUTHORITY.md)

### For Product Management
- **Product Requirements**: Review [PRD_MASTER.md](./PRD_MASTER.md)
- **Release Process**: Check [CHANGELOG_SEMANTIC.md](./CHANGELOG_SEMANTIC.md)

## Document Status

All documentation files are maintained according to the standards defined in [DOC_POLICY.md](./DOC_POLICY.md). Each document includes:
- Version number
- Last updated date
- Document owner
- Review status

## New Documentation (Placeholders)

The following placeholder documents have been created as part of the 2026-01-21 documentation audit:

### Critical (P0)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Testing approach and frameworks
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures for all environments
- [CI_CD.md](./CI_CD.md) - CI/CD pipeline documentation
- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) - Environment variables and configuration
- [OBSERVABILITY.md](./OBSERVABILITY.md) - Logging, monitoring, and alerting
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Incident management procedures

### High Priority (P1)
- [EDGE_CASES.md](./EDGE_CASES.md) - Edge cases and failure modes
- [INTEGRATIONS.md](./INTEGRATIONS.md) - 17 serverless function integrations
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [features/FEATURES_INDEX.md](./features/FEATURES_INDEX.md) - Feature documentation index

### Supporting Documents
- [docs/README.md](./README.md) - Documentation directory overview and roadmap

## Contributing to Documentation

Please refer to [DOC_POLICY.md](./DOC_POLICY.md) for guidelines on updating or creating new documentation.

For the complete audit report and remediation priorities, see [DOCUMENTATION_AUDIT.md](../DOCUMENTATION_AUDIT.md).
