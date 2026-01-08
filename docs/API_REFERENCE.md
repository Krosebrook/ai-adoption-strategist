# API Reference

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: API Team  
**Status**: Active

## Overview

This document provides a comprehensive reference for all available API endpoints in the AI Adoption Strategist platform and how to interact with them. The API is built on the Base44 backend platform and follows RESTful principles.

## Base URL

### Production
```
https://api.base44.com/v1/projects/{project_id}
```

### Development
```
https://api-dev.base44.com/v1/projects/{project_id}
```

## Authentication

### Authentication Methods

#### Bearer Token Authentication
All API requests require a valid JWT bearer token in the Authorization header.

```http
GET /api/v1/assessments HTTP/1.1
Host: api.base44.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### API Key Authentication
For server-to-server communication, use API key authentication.

```http
GET /api/v1/assessments HTTP/1.1
Host: api.base44.com
X-API-Key: your_api_key_here
```

### Obtaining Access Tokens

#### User Authentication Flow
```javascript
import { createClient } from '@base44/sdk';

const client = createClient({
  projectId: 'your_project_id',
  apiKey: 'your_api_key',
});

// Sign in
const { data, error } = await client.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Access token available at: data.session.access_token
```

#### Token Refresh
```javascript
const { data, error } = await client.auth.refreshSession();
// New access token: data.session.access_token
```

## Common Request/Response Patterns

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer {access_token}
Accept: application/json
```

### Success Response Format

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2026-01-08T15:30:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-08T15:30:00Z",
    "requestId": "req_123456"
  }
}
```

### Pagination

List endpoints support cursor-based pagination:

```http
GET /api/v1/assessments?limit=20&cursor=eyJpZCI6MTIzfQ
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTQzfQ",
    "limit": 20
  }
}
```

## API Endpoints

### Assessments

#### List Assessments

```http
GET /api/v1/assessments
```

**Query Parameters**:
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| limit | integer | Number of results (1-100) | 20 |
| cursor | string | Pagination cursor | - |
| status | string | Filter by status | - |
| sortBy | string | Sort field | created_at |
| sortOrder | string | Sort order (asc/desc) | desc |

**Example Request**:
```javascript
const assessments = await client
  .from('assessments')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "ast_123456",
      "name": "Enterprise AI Readiness Assessment",
      "status": "in_progress",
      "score": 75,
      "created_at": "2026-01-08T10:00:00Z",
      "updated_at": "2026-01-08T14:30:00Z",
      "created_by": "user_123"
    }
  ],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTIzfQ",
    "limit": 20
  }
}
```

#### Get Assessment

```http
GET /api/v1/assessments/{id}
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Assessment ID |

**Example Request**:
```javascript
const assessment = await client
  .from('assessments')
  .select('*')
  .eq('id', 'ast_123456')
  .single();
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "ast_123456",
    "name": "Enterprise AI Readiness Assessment",
    "description": "Comprehensive assessment of AI readiness",
    "status": "in_progress",
    "score": 75,
    "sections": [
      {
        "id": "sec_1",
        "name": "Data Infrastructure",
        "score": 80,
        "questions": [...]
      }
    ],
    "created_at": "2026-01-08T10:00:00Z",
    "updated_at": "2026-01-08T14:30:00Z",
    "created_by": "user_123"
  }
}
```

**Error Responses**:
- `404 Not Found`: Assessment not found
- `403 Forbidden`: No permission to access assessment

#### Create Assessment

```http
POST /api/v1/assessments
```

**Request Body**:
```json
{
  "name": "New Assessment",
  "description": "Assessment description",
  "template_id": "tpl_basic",
  "organization_id": "org_123"
}
```

**Example Request**:
```javascript
const { data, error } = await client
  .from('assessments')
  .insert({
    name: 'New Assessment',
    description: 'Assessment description',
    template_id: 'tpl_basic',
    organization_id: 'org_123'
  })
  .select()
  .single();
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "ast_789012",
    "name": "New Assessment",
    "status": "draft",
    "created_at": "2026-01-08T15:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `403 Forbidden`: No permission to create assessment
- `422 Unprocessable Entity`: Validation errors

#### Update Assessment

```http
PATCH /api/v1/assessments/{id}
```

**Request Body**:
```json
{
  "name": "Updated Assessment Name",
  "status": "completed",
  "score": 85
}
```

**Example Request**:
```javascript
const { data, error } = await client
  .from('assessments')
  .update({
    name: 'Updated Assessment Name',
    status: 'completed',
    score: 85
  })
  .eq('id', 'ast_123456')
  .select()
  .single();
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "ast_123456",
    "name": "Updated Assessment Name",
    "status": "completed",
    "score": 85,
    "updated_at": "2026-01-08T15:30:00Z"
  }
}
```

#### Delete Assessment

```http
DELETE /api/v1/assessments/{id}
```

**Example Request**:
```javascript
const { error } = await client
  .from('assessments')
  .delete()
  .eq('id', 'ast_123456');
```

**Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: Assessment not found
- `403 Forbidden`: No permission to delete assessment

### Reports

#### Generate Report

```http
POST /api/v1/reports
```

**Request Body**:
```json
{
  "assessment_id": "ast_123456",
  "format": "pdf",
  "options": {
    "include_charts": true,
    "include_recommendations": true
  }
}
```

**Example Request**:
```javascript
const { data, error } = await client
  .from('reports')
  .insert({
    assessment_id: 'ast_123456',
    format: 'pdf',
    options: {
      include_charts: true,
      include_recommendations: true
    }
  })
  .select()
  .single();
```

**Response**: `202 Accepted`
```json
{
  "data": {
    "id": "rpt_123456",
    "status": "processing",
    "assessment_id": "ast_123456",
    "format": "pdf",
    "created_at": "2026-01-08T15:00:00Z"
  }
}
```

#### Get Report

```http
GET /api/v1/reports/{id}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "rpt_123456",
    "status": "completed",
    "assessment_id": "ast_123456",
    "format": "pdf",
    "download_url": "https://cdn.base44.com/reports/rpt_123456.pdf",
    "expires_at": "2026-01-15T15:00:00Z",
    "created_at": "2026-01-08T15:00:00Z"
  }
}
```

#### Download Report

```http
GET /api/v1/reports/{id}/download
```

**Response**: `302 Found` (redirect to download URL)

### Organizations

#### Get Organization

```http
GET /api/v1/organizations/{id}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "org_123",
    "name": "Acme Corporation",
    "industry": "Technology",
    "size": "enterprise",
    "settings": {
      "timezone": "UTC",
      "currency": "USD"
    },
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

#### Update Organization

```http
PATCH /api/v1/organizations/{id}
```

**Request Body**:
```json
{
  "name": "Updated Organization Name",
  "settings": {
    "timezone": "America/New_York"
  }
}
```

**Response**: `200 OK`

### Users

#### Get Current User

```http
GET /api/v1/users/me
```

**Example Request**:
```javascript
const { data: { user } } = await client.auth.getUser();
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "assessor",
    "organization_id": "org_123",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

#### Update User Profile

```http
PATCH /api/v1/users/me
```

**Request Body**:
```json
{
  "name": "Jane Doe",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

**Response**: `200 OK`

## Real-time Subscriptions

### Subscribe to Changes

The Base44 SDK supports real-time subscriptions to database changes.

**Example**:
```javascript
// Subscribe to assessment updates
const subscription = client
  .from('assessments')
  .on('*', (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

**Subscription Events**:
- `INSERT`: New record created
- `UPDATE`: Existing record updated
- `DELETE`: Record deleted
- `*`: All events

## Rate Limiting

### Limits

| Tier | Requests per Minute | Burst |
|------|---------------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 100 |
| Enterprise | 6000 | 1000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1704812400
```

### Rate Limit Exceeded Response

**Response**: `429 Too Many Requests`
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 60 seconds.",
    "retry_after": 60
  }
}
```

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Request successful, no content |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Temporary unavailability |

### Application Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| AUTHENTICATION_ERROR | Authentication failed |
| AUTHORIZATION_ERROR | Insufficient permissions |
| RESOURCE_NOT_FOUND | Requested resource not found |
| DUPLICATE_RESOURCE | Resource already exists |
| RATE_LIMIT_EXCEEDED | Rate limit exceeded |
| INTERNAL_ERROR | Internal server error |

## Webhooks

### Webhook Events

Configure webhooks to receive real-time notifications for events.

**Available Events**:
- `assessment.created`
- `assessment.updated`
- `assessment.completed`
- `assessment.deleted`
- `report.generated`

**Webhook Payload**:
```json
{
  "event": "assessment.completed",
  "data": {
    "id": "ast_123456",
    "name": "Enterprise AI Readiness Assessment",
    "status": "completed",
    "score": 85
  },
  "timestamp": "2026-01-08T15:00:00Z",
  "signature": "sha256=..."
}
```

### Webhook Signature Verification

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

## SDK Usage Examples

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @base44/sdk
```

#### Basic Usage
```javascript
import { createClient } from '@base44/sdk';

// Initialize client
const client = createClient({
  projectId: process.env.VITE_BASE44_PROJECT_ID,
  apiKey: process.env.VITE_BASE44_API_KEY,
});

// Query data
const { data, error } = await client
  .from('assessments')
  .select('*')
  .eq('status', 'active');

// Insert data
const { data, error } = await client
  .from('assessments')
  .insert({ name: 'New Assessment' });

// Update data
const { data, error } = await client
  .from('assessments')
  .update({ status: 'completed' })
  .eq('id', 'ast_123');

// Delete data
const { error } = await client
  .from('assessments')
  .delete()
  .eq('id', 'ast_123');
```

## Best Practices

### 1. Error Handling
Always check for errors and handle them appropriately:

```javascript
const { data, error } = await client
  .from('assessments')
  .select('*');

if (error) {
  console.error('Error fetching assessments:', error);
  // Handle error
  return;
}

// Use data
console.log('Assessments:', data);
```

### 2. Request Optimization
- Use `select()` to fetch only needed fields
- Implement pagination for large datasets
- Cache responses when appropriate
- Use real-time subscriptions for live data

### 3. Security
- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Validate all inputs before sending to API
- Implement proper authentication checks

### 4. Performance
- Batch requests when possible
- Use cursor-based pagination
- Implement request debouncing
- Cache frequently accessed data

## Versioning

### API Versioning Strategy

The API uses URL-based versioning:
```
/api/v1/assessments
/api/v2/assessments
```

### Deprecation Policy

- **Notice Period**: 6 months minimum
- **Support Period**: Previous version supported for 12 months
- **Migration Guide**: Provided for all breaking changes

## Related Documents

- [SECURITY.md](./SECURITY.md) - API security practices
- [ENTITY_ACCESS_RULES.md](./ENTITY_ACCESS_RULES.md) - Access control
- [FRAMEWORK.md](./FRAMEWORK.md) - SDK and integration details

## Support

### API Support Channels
- **Documentation**: https://docs.example.com
- **Email**: api-support@example.com
- **Status Page**: https://status.example.com
- **GitHub Issues**: https://github.com/username/repo/issues

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | API Team | Initial version |
