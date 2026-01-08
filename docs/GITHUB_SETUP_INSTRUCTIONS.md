# GitHub Setup Instructions

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: DevOps Team  
**Status**: Active

## Overview

This document provides manual steps for setting up the GitHub repository and GitHub Actions for CI/CD pipelines for the AI Adoption Strategist platform.

## Repository Setup

### Initial Repository Configuration

#### 1. Create Repository

**Via GitHub Web Interface**:
1. Navigate to https://github.com/new
2. Enter repository name: `ai-adoption-strategist`
3. Add description: "Enterprise AI adoption assessment and implementation planning platform"
4. Choose visibility: Private (or Public)
5. Initialize with README: Yes
6. Add .gitignore: Node
7. Choose license: MIT (or your preferred license)
8. Click "Create repository"

**Via GitHub CLI**:
```bash
gh repo create ai-adoption-strategist \
  --description "Enterprise AI adoption assessment platform" \
  --private \
  --clone \
  --gitignore Node \
  --license MIT
```

#### 2. Clone Repository Locally

```bash
git clone git@github.com:yourusername/ai-adoption-strategist.git
cd ai-adoption-strategist
```

#### 3. Initial Project Setup

```bash
# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react

# Copy project files
# ... (copy your existing project structure)

# Initial commit
git add .
git commit -m "Initial project setup"
git push origin main
```

### Branch Protection Rules

#### 1. Enable Branch Protection for `main`

**Via GitHub Web Interface**:
1. Navigate to repository → Settings → Branches
2. Click "Add rule" under "Branch protection rules"
3. Branch name pattern: `main`
4. Configure the following settings:

**Required Settings**:
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Status checks: `lint`, `build`, `test` (add after workflow setup)
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (optional but recommended)
- ✅ Require linear history
- ✅ Include administrators (enforce rules for admins too)
- ✅ Restrict who can push to matching branches
  - Add allowed users/teams
- ✅ Allow force pushes: ❌ (disabled)
- ✅ Allow deletions: ❌ (disabled)

5. Click "Create" to save the protection rules

#### 2. Additional Branch Patterns

Create similar rules for:
- `develop` (for development branch if using GitFlow)
- `release/*` (for release branches)
- `hotfix/*` (for hotfix branches)

### Repository Settings

#### General Settings

Navigate to Settings → General:

**Features**:
- ✅ Issues
- ✅ Projects (if using GitHub Projects)
- ✅ Wiki (optional)
- ✅ Discussions (optional)

**Pull Requests**:
- ✅ Allow squash merging
- ✅ Allow merge commits
- ❌ Allow rebase merging (personal preference)
- ✅ Automatically delete head branches

**Archives**:
- ✅ Include Git LFS objects in archives

#### Collaborators and Teams

Navigate to Settings → Collaborators and teams:

1. Add team members with appropriate roles:
   - **Admin**: Full access, can configure repository
   - **Write**: Can push to non-protected branches
   - **Read**: Can view and clone repository

2. Example team structure:
   - `@core-team`: Admin access
   - `@developers`: Write access
   - `@contractors`: Write access (time-limited)

### Security Settings

#### 1. Enable Security Features

Navigate to Settings → Security → Code security and analysis:

- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Grouped security updates (weekly)
- ✅ Dependabot version updates (optional)
- ✅ Code scanning (GitHub Advanced Security)
- ✅ Secret scanning
- ✅ Push protection

#### 2. Configure Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "core-team"
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore"
      include: "scope"
    
  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "github-actions"
```

#### 3. Configure Code Scanning

Create `.github/workflows/codeql.yml` (see GitHub Actions section below).

### Secrets Management

#### 1. Repository Secrets

Navigate to Settings → Secrets and variables → Actions:

**Required Secrets**:
```
VITE_BASE44_PROJECT_ID=your_project_id
VITE_BASE44_API_KEY=your_api_key
DEPLOYMENT_TOKEN=your_deployment_token
```

**Adding Secrets**:
1. Click "New repository secret"
2. Enter name (e.g., `VITE_BASE44_PROJECT_ID`)
3. Enter value
4. Click "Add secret"

**Important**: 
- Never commit secrets to the repository
- Rotate secrets regularly
- Use different secrets for staging/production

#### 2. Environment Secrets

For environment-specific secrets:

1. Navigate to Settings → Environments
2. Click "New environment"
3. Name: `production` (or `staging`, `development`)
4. Configure protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches
5. Add environment-specific secrets

Example environments:
- **production**: Production deployment secrets
- **staging**: Staging deployment secrets
- **preview**: Preview deployment secrets

### Issue Templates

Create issue templates for consistent issue reporting.

#### 1. Bug Report Template

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Device [e.g. Desktop, iPhone 12]

**Additional context**
Add any other context about the problem here.
```

#### 2. Feature Request Template

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)
```

## GitHub Actions Setup

### Directory Structure

Create the GitHub Actions workflow directory:

```bash
mkdir -p .github/workflows
```

### Workflow Files

#### 1. CI/CD Pipeline

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: lint
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_BASE44_PROJECT_ID: ${{ secrets.VITE_BASE44_PROJECT_ID }}
          VITE_BASE44_API_KEY: ${{ secrets.VITE_BASE44_API_KEY }}
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 1

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info
          flags: unittests

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, test]
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/
          
      - name: Deploy to staging
        run: |
          # Add your deployment command here
          # e.g., deploy to Netlify, Vercel, AWS S3, etc.
        env:
          DEPLOYMENT_TOKEN: ${{ secrets.STAGING_DEPLOYMENT_TOKEN }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: dist/
          
      - name: Deploy to production
        run: |
          # Add your deployment command here
        env:
          DEPLOYMENT_TOKEN: ${{ secrets.PRODUCTION_DEPLOYMENT_TOKEN }}
```

#### 2. CodeQL Security Scanning

Create `.github/workflows/codeql.yml`:

```yaml
name: CodeQL Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  analyze:
    name: Analyze Code
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

#### 3. Dependency Review

Create `.github/workflows/dependency-review.yml`:

```yaml
name: Dependency Review

on:
  pull_request:
    branches: [main, develop]

permissions:
  contents: read
  pull-requests: write

jobs:
  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        with:
          fail-on-severity: moderate
          comment-summary-in-pr: always
```

#### 4. Auto-assign PR Reviewers

Create `.github/workflows/auto-assign.yml`:

```yaml
name: Auto Assign Reviewers

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  add-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: Auto assign reviewers
        uses: kentaro-m/auto-assign-action@v1.2.5
        with:
          configuration-path: .github/auto-assign.yml
```

Create `.github/auto-assign.yml`:

```yaml
# Auto-assign reviewers configuration
addReviewers: true
addAssignees: false
numberOfReviewers: 2
reviewers:
  - user1
  - user2
  - user3
skipKeywords:
  - wip
  - draft
```

### Workflow Badges

Add status badges to your README.md:

```markdown
# AI Adoption Strategist

[![CI/CD Pipeline](https://github.com/username/ai-adoption-strategist/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/username/ai-adoption-strategist/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/username/ai-adoption-strategist/actions/workflows/codeql.yml/badge.svg)](https://github.com/username/ai-adoption-strategist/actions/workflows/codeql.yml)
```

## Git Configuration

### Git Hooks with Husky

Install and configure Husky for pre-commit hooks:

```bash
# Install Husky
npm install -D husky lint-staged

# Initialize Husky
npx husky-init

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Configure in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

### Commit Message Convention

Install commitlint:

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

Create `.commitlintrc.json`:

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci"
      ]
    ]
  }
}
```

Add commit-msg hook:

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## Monitoring and Notifications

### Slack Integration

1. Go to Settings → Integrations → Slack
2. Install GitHub app in Slack workspace
3. Subscribe to repository notifications:
   ```
   /github subscribe owner/repo
   /github subscribe owner/repo reviews comments branches commits:main
   ```

### Email Notifications

Configure in personal settings:
1. Go to Settings → Notifications
2. Configure email preferences for:
   - Pull request reviews
   - CI/CD failures
   - Security alerts

## Documentation

### Update Repository Documentation

Create/update the following files:

- `README.md`: Project overview and quick start
- `CONTRIBUTING.md`: Contribution guidelines
- `CODE_OF_CONDUCT.md`: Code of conduct
- `LICENSE`: License information
- `SECURITY.md`: Security policy

## Verification Checklist

After setup, verify:

- [ ] Repository is created and accessible
- [ ] Branch protection rules are active
- [ ] Secrets are configured
- [ ] GitHub Actions workflows run successfully
- [ ] Issue templates work
- [ ] PR template appears on new PRs
- [ ] Dependabot is scanning dependencies
- [ ] CodeQL is running security scans
- [ ] Team members have appropriate access
- [ ] Deployment pipelines work
- [ ] Notifications are configured

## Troubleshooting

### Common Issues

**Issue**: GitHub Actions failing due to missing secrets
**Solution**: Verify all required secrets are added in repository settings

**Issue**: Branch protection blocking admins
**Solution**: Review branch protection settings, consider excluding admins if needed

**Issue**: Deployment fails
**Solution**: Check deployment tokens and environment configuration

## Related Documents

- [DOC_POLICY.md](./DOC_POLICY.md) - Documentation standards
- [CHANGELOG_SEMANTIC.md](./CHANGELOG_SEMANTIC.md) - Release process
- [SECURITY.md](./SECURITY.md) - Security practices

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | DevOps Team | Initial version |
