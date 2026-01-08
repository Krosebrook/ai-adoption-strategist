# Entity Access Rules (RBAC)

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: Security Team  
**Status**: Active

## Overview

This document provides a detailed explanation of role-based access control (RBAC) rules for each database entity in the AI Adoption Strategist platform. It defines who can perform which operations on what data.

## Role Definitions

### Role Hierarchy

```
Super Admin (All permissions across all organizations)
  ↓
Organization Admin (Full access within organization)
  ↓
Assessment Manager (Create/manage assessments)
  ↓
Report Viewer (Read-only access to completed assessments/reports)
  ↓
Basic User (Own assessments only)
```

### Role Descriptions

#### Super Admin
**Purpose**: Platform administration and cross-organization management

**Capabilities**:
- Full access to all data across all organizations
- System configuration and settings
- User role management
- Audit log access
- Platform-wide analytics

**Assignment**: Internal platform administrators only

#### Organization Admin
**Purpose**: Organizational management and oversight

**Capabilities**:
- Full access to organization data
- User management within organization
- Assessment oversight
- Report generation and access
- Organization settings management

**Assignment**: Designated by organization or super admin

#### Assessment Manager
**Purpose**: Assessment creation, management, and analysis

**Capabilities**:
- Create, read, update, delete assessments
- Assign assessments to users
- View all assessments within organization
- Generate reports
- Export assessment data

**Assignment**: Team leads, project managers, consultants

#### Report Viewer
**Purpose**: Read-only access to completed work

**Capabilities**:
- View completed assessments
- Access generated reports
- View organization metrics
- Export reports (read-only)

**Assignment**: Executives, stakeholders, auditors

#### Basic User
**Purpose**: Individual assessment participation

**Capabilities**:
- Create own assessments
- View and edit own assessments
- Complete assigned assessments
- View own reports

**Assignment**: Default role for all users

## Entity Access Rules

### Users Entity

#### Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | All users | All users | All users | All users |
| Org Admin | Users in org | Users in org | Users in org | Users in org |
| Assessment Manager | No | Users in org | No | No |
| Report Viewer | No | Own profile | Own profile | No |
| Basic User | No | Own profile | Own profile | No |

#### Row-Level Security Policies

```sql
-- Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Org admins can read users in their org
CREATE POLICY users_select_org ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'org_admin'
    )
  );

-- Org admins can update users in their org
CREATE POLICY users_update_org ON users
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'org_admin'
    )
  );

-- Users can update their own profile (except role)
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT role FROM users WHERE id = auth.uid())
  );
```

### Organizations Entity

#### Schema
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | ✓ | All orgs | All orgs | All orgs |
| Org Admin | ✗ | Own org | Own org | ✗ |
| Assessment Manager | ✗ | Own org | ✗ | ✗ |
| Report Viewer | ✗ | Own org | ✗ | ✗ |
| Basic User | ✗ | Own org | ✗ | ✗ |

#### Row-Level Security Policies

```sql
-- Users can read their own organization
CREATE POLICY orgs_select_own ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Org admins can update their organization
CREATE POLICY orgs_update_admin ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'org_admin'
    )
  );
```

### Assessments Entity

#### Schema
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  score INTEGER,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | All | All | All | All |
| Org Admin | Within org | All in org | All in org | All in org |
| Assessment Manager | Within org | All in org | All in org | Own created |
| Report Viewer | ✗ | Completed in org | ✗ | ✗ |
| Basic User | Own | Own or assigned | Own | Own |

#### Detailed CRUD Rules

**CREATE**:
- Super Admin: Can create assessments for any organization
- Org Admin: Can create assessments within their organization
- Assessment Manager: Can create assessments within their organization
- Report Viewer: Cannot create assessments
- Basic User: Can create own assessments

**READ**:
- Super Admin: Can read all assessments
- Org Admin: Can read all assessments in their organization
- Assessment Manager: Can read all assessments in their organization
- Report Viewer: Can read only completed assessments in their organization
- Basic User: Can read only their own assessments or assessments assigned to them

**UPDATE**:
- Super Admin: Can update all assessments
- Org Admin: Can update all assessments in their organization
- Assessment Manager: Can update all assessments in their organization
- Report Viewer: Cannot update assessments
- Basic User: Can update only their own assessments (created by them)

**DELETE**:
- Super Admin: Can delete all assessments
- Org Admin: Can delete all assessments in their organization
- Assessment Manager: Can delete only assessments they created
- Report Viewer: Cannot delete assessments
- Basic User: Can delete only their own assessments

#### Row-Level Security Policies

```sql
-- Users can read their own assessments
CREATE POLICY assessments_select_own ON assessments
  FOR SELECT
  USING (
    created_by = auth.uid() OR 
    assigned_to = auth.uid()
  );

-- Managers can read all assessments in org
CREATE POLICY assessments_select_org ON assessments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('org_admin', 'assessment_manager')
    )
  );

-- Report viewers can read completed assessments in org
CREATE POLICY assessments_select_completed ON assessments
  FOR SELECT
  USING (
    status = 'completed' AND
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'report_viewer'
    )
  );

-- Users can update their own assessments
CREATE POLICY assessments_update_own ON assessments
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Managers can update assessments in org
CREATE POLICY assessments_update_org ON assessments
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('org_admin', 'assessment_manager')
    )
  );

-- Users can delete their own assessments
CREATE POLICY assessments_delete_own ON assessments
  FOR DELETE
  USING (created_by = auth.uid());

-- Org admins can delete assessments in org
CREATE POLICY assessments_delete_org ON assessments
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'org_admin'
    )
  );

-- Managers can delete assessments they created
CREATE POLICY assessments_delete_created ON assessments
  FOR DELETE
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'assessment_manager'
    )
  );
```

### Assessment Responses Entity

#### Schema
```sql
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  question_id UUID NOT NULL,
  response JSONB NOT NULL,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | All | All | All | All |
| Org Admin | Via assessment | Via assessment | Via assessment | Via assessment |
| Assessment Manager | Via assessment | Via assessment | Via assessment | Via assessment |
| Report Viewer | ✗ | Via completed assessment | ✗ | ✗ |
| Basic User | Own assessment | Own assessment | Own assessment | Own assessment |

**Note**: Access to responses follows the access rules of the parent assessment.

#### Row-Level Security Policies

```sql
-- Users can manage responses for assessments they can access
CREATE POLICY responses_access ON assessment_responses
  FOR ALL
  USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE /* assessment policies apply */
    )
  );
```

### Reports Entity

#### Schema
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  format TEXT NOT NULL,
  status TEXT NOT NULL,
  file_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | All | All | All | All |
| Org Admin | Within org | All in org | All in org | All in org |
| Assessment Manager | Within org | All in org | Own | Own |
| Report Viewer | ✗ | All in org | ✗ | ✗ |
| Basic User | Own assessments | Own | Own | Own |

#### Row-Level Security Policies

```sql
-- Users can read reports for assessments they can access
CREATE POLICY reports_select_via_assessment ON reports
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE /* assessment SELECT policies apply */
    )
  );

-- Users can create reports for assessments they own
CREATE POLICY reports_insert_own ON reports
  FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments WHERE created_by = auth.uid()
    )
  );

-- Managers can create reports for org assessments
CREATE POLICY reports_insert_org ON reports
  FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() 
        AND role IN ('org_admin', 'assessment_manager')
      )
    )
  );
```

### Templates Entity

#### Schema
```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  content JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Access Rules

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Super Admin | All | All | All | All |
| Org Admin | Within org | Public + org | Within org | Within org |
| Assessment Manager | Within org | Public + org | Own | Own |
| Report Viewer | ✗ | Public + org | ✗ | ✗ |
| Basic User | ✗ | Public | ✗ | ✗ |

#### Row-Level Security Policies

```sql
-- Users can read public templates
CREATE POLICY templates_select_public ON templates
  FOR SELECT
  USING (is_public = true);

-- Users can read templates in their org
CREATE POLICY templates_select_org ON templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Managers can create templates in their org
CREATE POLICY templates_insert_manager ON templates
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('org_admin', 'assessment_manager')
    )
  );
```

## Field-Level Access Control

### Sensitive Fields

#### Users Table
**Restricted Fields**:
- `role`: Only super admin and org admin can modify
- `organization_id`: Only super admin can modify

**Implementation**:
```sql
-- Prevent role escalation
CREATE POLICY users_prevent_role_change ON users
  FOR UPDATE
  WITH CHECK (
    role = (SELECT role FROM users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'org_admin')
    )
  );
```

#### Assessments Table
**Restricted Fields**:
- `score`: Calculated field, not directly editable
- `organization_id`: Cannot be changed after creation

#### Reports Table
**Restricted Fields**:
- `file_url`: Generated by system
- `status`: Managed by system

## Special Access Scenarios

### Shared Assessments
When an assessment is assigned to another user:
- Both creator and assignee have read access
- Only creator can update or delete
- Assignee can submit responses

### Collaborative Assessments (Future)
- Multiple users can collaborate
- Permission levels: Owner, Editor, Viewer
- Granular sharing controls

### Audit Log Access
- Super Admin: All audit logs
- Org Admin: Organization audit logs
- Other roles: No direct access

## Permission Evaluation Order

1. **Super Admin Check**: If user is super admin, grant full access
2. **Resource Ownership**: Check if user owns the resource
3. **Organization Membership**: Check if resource belongs to user's org
4. **Role-Based Rules**: Apply role-specific rules
5. **Explicit Grants**: Check for explicit permissions
6. **Default Deny**: If no rule matches, deny access

## Testing Access Rules

### Test Scenarios

#### Scenario 1: User Access
```javascript
// Basic user tries to access another user's assessment
const { data, error } = await client
  .from('assessments')
  .select('*')
  .eq('id', 'other_user_assessment_id');

// Expected: Empty result or error
```

#### Scenario 2: Org Admin Access
```javascript
// Org admin tries to access assessments in their org
const { data, error } = await client
  .from('assessments')
  .select('*');

// Expected: All assessments in their organization
```

#### Scenario 3: Cross-Org Access
```javascript
// User tries to access data from another organization
const { data, error } = await client
  .from('assessments')
  .select('*')
  .eq('organization_id', 'other_org_id');

// Expected: Empty result or error
```

## Access Rule Updates

### Process
1. Propose access rule change
2. Security team review
3. Document in this file
4. Implement RLS policy changes
5. Test thoroughly
6. Deploy with monitoring
7. Audit access patterns

### Change Log
All changes to access rules must be documented with:
- Date of change
- Justification
- Security review approval
- Test results

## Related Documents

- [SECURITY.md](./SECURITY.md) - Overall security architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - API authorization
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | Security Team | Initial version |
