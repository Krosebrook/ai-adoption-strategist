# Semantic Versioning and Changelog Documentation

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: Release Management Team  
**Status**: Active

## Overview

This document explains the semantic versioning approach used for releases and how changes are documented in the AI Adoption Strategist platform. It establishes standards for version numbering, changelog maintenance, and release communication.

## Semantic Versioning (SemVer)

### Version Format

The project follows [Semantic Versioning 2.0.0](https://semver.org/) with the format:

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

**Example**: `2.3.1-beta.1+20260108`

### Version Components

#### MAJOR Version (X.0.0)
**Increment when**: Making incompatible API changes or breaking changes

**Examples**:
- Removing or renaming public API endpoints
- Changing data formats that break existing clients
- Removing features or functionality
- Major architectural changes requiring migration

**Communication**:
- Advance notice (2+ weeks)
- Migration guide required
- Deprecation warnings in previous version
- Major release notes

#### MINOR Version (0.X.0)
**Increment when**: Adding functionality in a backward-compatible manner

**Examples**:
- Adding new API endpoints
- Adding new features or components
- Enhancing existing features without breaking changes
- Adding optional parameters to APIs
- Performance improvements

**Communication**:
- Release notes with feature descriptions
- Updated documentation
- Usage examples

#### PATCH Version (0.0.X)
**Increment when**: Making backward-compatible bug fixes

**Examples**:
- Bug fixes
- Security patches
- Performance optimizations
- Documentation corrections
- Dependency updates (non-breaking)

**Communication**:
- Brief release notes
- Bug tracking reference

### Pre-release Versions

#### Alpha (-alpha.X)
**Purpose**: Early testing, unstable, significant changes expected

**Characteristics**:
- Internal testing only
- Features may be incomplete
- Breaking changes between alpha versions acceptable
- Not production-ready

**Example**: `2.0.0-alpha.1`

#### Beta (-beta.X)
**Purpose**: Feature complete, testing for bugs and edge cases

**Characteristics**:
- Feature freeze (no new features)
- External testing/preview
- API should be stable
- Known issues may exist
- Near production-ready

**Example**: `2.0.0-beta.2`

#### Release Candidate (-rc.X)
**Purpose**: Final testing before production release

**Characteristics**:
- All known issues resolved
- No changes except critical bug fixes
- Production-ready pending final validation
- Extensive testing completed

**Example**: `2.0.0-rc.1`

### Build Metadata

**Format**: `+YYYYMMDD` or `+YYYYMMDD.BUILDNUMBER`

**Purpose**: Additional build information (does not affect version precedence)

**Example**: `2.0.0+20260108` or `2.0.0-beta.1+20260108.457`

## Changelog Maintenance

### Changelog Format

The project uses [Keep a Changelog](https://keepachangelog.com/) format.

#### Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [1.2.0] - 2026-01-08

### Added
- Feature description with details

[Unreleased]: https://github.com/username/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/username/repo/compare/v1.1.0...v1.2.0
```

### Change Categories

#### Added
**Description**: New features or capabilities

**Guidelines**:
- User-facing features
- New API endpoints
- New configuration options
- New dependencies (if relevant to users)

**Example**:
```markdown
### Added
- **Assessment Templates**: Pre-built assessment templates for common AI use cases
- **Export Functionality**: Ability to export assessments as PDF or CSV
- API endpoint `/api/v1/assessments/export` for programmatic exports
```

#### Changed
**Description**: Changes to existing functionality

**Guidelines**:
- Modifications to existing features
- UI/UX improvements
- Performance enhancements
- Updated dependencies (if behavior changes)

**Example**:
```markdown
### Changed
- **Dashboard Layout**: Improved responsive design for mobile devices
- Assessment creation flow now includes validation steps
- Updated Recharts from 2.12 to 2.15 for better chart performance
```

#### Deprecated
**Description**: Features marked for future removal

**Guidelines**:
- Mark features with deprecation notices
- Provide timeline for removal
- Suggest alternatives
- Include migration path

**Example**:
```markdown
### Deprecated
- `/api/v1/assessments/legacy` endpoint (use `/api/v2/assessments` instead)
  - Will be removed in version 3.0.0
  - Migration guide: [Link to documentation]
```

#### Removed
**Description**: Features that have been removed

**Guidelines**:
- Previously deprecated features
- Clear indication of alternatives
- Migration guide if complex

**Example**:
```markdown
### Removed
- Legacy dashboard widgets (deprecated in v2.0.0)
- Support for Internet Explorer 11
- Old API endpoints from v1 (use v2 endpoints)
```

#### Fixed
**Description**: Bug fixes

**Guidelines**:
- Describe the issue fixed
- Reference issue/ticket number
- Indicate severity if critical

**Example**:
```markdown
### Fixed
- Assessment saving now properly handles special characters (#123)
- Fixed race condition in real-time updates causing duplicate entries
- Resolved memory leak in dashboard widget refresh
```

#### Security
**Description**: Security-related fixes and improvements

**Guidelines**:
- Prioritize at top of changelog
- Include CVE numbers if applicable
- Indicate severity
- Provide upgrade urgency

**Example**:
```markdown
### Security
- **CRITICAL**: Fixed XSS vulnerability in assessment notes (CVE-2026-12345)
  - All users should upgrade immediately
- Updated dependencies to patch security vulnerabilities
- Enhanced authentication token validation
```

### Writing Guidelines

#### Clarity and Detail
- **Target Audience**: Write for users and developers
- **Be Specific**: Include enough detail to understand the change
- **Use Active Voice**: "Added feature X" not "Feature X was added"
- **Include Context**: Why the change matters

#### Good Examples

✅ **Good**:
```markdown
### Added
- **Multi-language Support**: The application now supports English, Spanish, and French. Users can switch languages from their profile settings. This enables international teams to collaborate more effectively.
```

✅ **Good**:
```markdown
### Fixed
- Fixed critical bug where unsaved assessment data was lost when navigating away from the page. The application now auto-saves every 30 seconds and prompts users before navigating away from unsaved changes. (#456)
```

#### Bad Examples

❌ **Bad** (too vague):
```markdown
### Added
- New feature
```

❌ **Bad** (too technical):
```markdown
### Fixed
- Refactored AssessmentService.prototype.save() to use async/await and added try-catch for error handling
```

❌ **Bad** (missing context):
```markdown
### Changed
- Updated button styles
```

## Release Process

### Version Decision Matrix

| Change Type | Example | Version Bump |
|-------------|---------|--------------|
| Breaking API change | Remove endpoint | MAJOR |
| New feature | Add dashboard widget | MINOR |
| Bug fix | Fix calculation error | PATCH |
| Security fix | Patch vulnerability | PATCH (or MINOR/MAJOR if breaking) |
| Performance improvement | Optimize queries | PATCH or MINOR |
| Documentation | Update README | No version change |

### Release Workflow

#### 1. Preparation Phase
```bash
# Create release branch
git checkout -b release/v2.1.0

# Update version number in package.json
npm version 2.1.0 --no-git-tag-version

# Update CHANGELOG.md
# - Move "Unreleased" items to "[2.1.0] - YYYY-MM-DD"
# - Add comparison links
# - Review all entries for accuracy

# Commit changes
git commit -am "chore: prepare release v2.1.0"
```

#### 2. Testing Phase
- Run full test suite
- Perform manual testing
- Security scan
- Performance testing
- Accessibility audit

#### 3. Release Phase
```bash
# Merge to main
git checkout main
git merge release/v2.1.0

# Create git tag
git tag -a v2.1.0 -m "Release version 2.1.0"

# Push changes and tag
git push origin main
git push origin v2.1.0

# Trigger deployment pipeline
```

#### 4. Post-Release Phase
- Monitor for issues
- Update documentation site
- Send release announcement
- Update project boards
- Close related issues

### Release Cadence

#### Regular Releases
- **Minor Versions**: Monthly or as features complete
- **Patch Versions**: As needed for bugs/security
- **Major Versions**: Annually or for significant changes

#### Hotfix Releases
For critical bugs or security issues:
```bash
# Create hotfix from main
git checkout -b hotfix/v2.1.1 main

# Fix the issue
# ... make changes ...

# Update version and changelog
npm version patch
# Update CHANGELOG.md

# Merge back to main
git checkout main
git merge hotfix/v2.1.1
git tag v2.1.1
git push origin main v2.1.1
```

## Communication Strategy

### Release Notes

#### Format
```markdown
# Release Notes - Version 2.1.0

**Release Date**: January 8, 2026  
**Type**: Minor Release

## Highlights

🎉 **Major New Features**
- Feature 1: Brief description
- Feature 2: Brief description

⚡ **Performance Improvements**
- Improvement details

🐛 **Bug Fixes**
- Critical bugs fixed

## What's New

### Assessment Templates
[Detailed description of the feature]

### Export Functionality
[Detailed description of the feature]

## Breaking Changes

⚠️ None in this release

## Upgrade Notes

1. Update to latest version: `npm update`
2. Review updated documentation
3. Test critical workflows

## Full Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## Need Help?

- Documentation: [link]
- Support: support@example.com
- Report Issues: [GitHub Issues]
```

#### Distribution Channels
- Email to all users
- In-app notification
- Blog post for major releases
- Social media announcement
- Documentation site update

### Breaking Change Communication

#### Timeline
1. **Deprecation Notice** (Version N): Announce upcoming removal
2. **Warning Period** (Version N+1): Maintain with deprecation warnings
3. **Removal** (Version N+2): Remove in next major version

#### Deprecation Notice Format
```markdown
### Deprecated in v2.0.0
⚠️ **`/api/v1/assessments/legacy` will be removed in v3.0.0**

**Reason**: Replaced by more efficient v2 API
**Migration**: Use `/api/v2/assessments` instead
**Documentation**: [Migration Guide](link)
**Timeline**: Removal planned for Q2 2026
```

## Versioning Best Practices

### Do's ✅
- Increment version with every release
- Keep changelog up-to-date with every PR
- Use pre-release versions for testing
- Document breaking changes clearly
- Provide migration guides
- Test thoroughly before releases

### Don'ts ❌
- Don't skip version numbers
- Don't make breaking changes in PATCH or MINOR versions
- Don't release without updating changelog
- Don't use ambiguous descriptions
- Don't remove features without deprecation period
- Don't release without testing

## Tools and Automation

### Automated Version Bumping
```json
// package.json scripts
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major",
    "version:prerelease": "npm version prerelease --preid=beta"
  }
}
```

### Changelog Generation
Consider tools like:
- `conventional-changelog`
- `standard-version`
- Manual updates for clarity

### Release Automation
- GitHub Actions for automated releases
- Semantic release tools
- Automated changelog updates

## Monitoring and Rollback

### Post-Release Monitoring
- Error tracking (first 24 hours critical)
- Performance metrics
- User feedback
- API usage patterns

### Rollback Criteria
Rollback if:
- Critical bug affecting > 10% of users
- Security vulnerability discovered
- Data integrity issue
- Performance degradation > 50%

### Rollback Process
```bash
# Quick rollback
git revert v2.1.0
git tag v2.1.1  # New patch version
git push origin main v2.1.1

# Update changelog with rollback notice
```

## Related Documents

- [DOC_POLICY.md](./DOC_POLICY.md) - Documentation standards
- [GITHUB_SETUP_INSTRUCTIONS.md](./GITHUB_SETUP_INSTRUCTIONS.md) - CI/CD setup
- [API_REFERENCE.md](./API_REFERENCE.md) - API versioning

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | Release Team | Initial version |
