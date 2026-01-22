export const DEVELOPER_GUIDE = `# Developer Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Base44 account and API key
- Modern browser (Chrome, Firefox, Safari, Edge)

### Environment Setup

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
Create \`.env\` file:
\`\`\`env
BASE44_APP_ID=your_app_id
BASE44_API_KEY=your_api_key
\`\`\`

4. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
int-inc-ai-platform/
├── pages/                  # Top-level route pages
│   ├── Home.js
│   ├── Assessment.js
│   ├── AIGovernance.js
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── assessment/       # Assessment-specific
│   ├── governance/       # Governance-specific
│   ├── agents/           # AI agent components
│   └── docs/             # Documentation content
├── entities/             # Data model definitions (JSON schemas)
│   ├── Assessment.json
│   ├── AIUsageLog.json
│   └── ...
├── functions/            # Backend serverless functions
│   └── automatedBiasScan.js
├── agents/               # AI agent configurations
│   ├── StrategyAdvisor.json
│   └── ...
├── Layout.js             # App layout wrapper
└── globals.css           # Global styles

\`\`\`

## Development Workflow

### Adding a New Feature

1. **Define Entity (if needed)**
\`\`\`json
// entities/NewEntity.json
{
  "name": "NewEntity",
  "type": "object",
  "properties": {
    "field_name": {
      "type": "string",
      "description": "Field description"
    }
  },
  "required": ["field_name"]
}
\`\`\`

2. **Create Page Component**
\`\`\`javascript
// pages/NewFeature.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NewFeature() {
    const { data } = useQuery({
        queryKey: ['newEntity'],
        queryFn: () => base44.entities.NewEntity.list()
    });
    
    return <div>Feature content</div>;
}
\`\`\`

3. **Add Navigation**
\`\`\`javascript
// Layout.js - add to navigation array
{ name: 'New Feature', icon: IconName, page: 'NewFeature' }
\`\`\`

### Working with Entities

**Create**
\`\`\`javascript
const mutation = useMutation({
    mutationFn: (data) => base44.entities.EntityName.create(data),
    onSuccess: () => queryClient.invalidateQueries(['entityName'])
});

mutation.mutate({ field: 'value' });
\`\`\`

**Read**
\`\`\`javascript
// List all
const { data } = useQuery({
    queryKey: ['entityName'],
    queryFn: () => base44.entities.EntityName.list()
});

// Filter
const { data } = useQuery({
    queryKey: ['entityName', filters],
    queryFn: () => base44.entities.EntityName.filter({ status: 'active' })
});
\`\`\`

**Update**
\`\`\`javascript
await base44.entities.EntityName.update(id, { field: 'new value' });
\`\`\`

**Delete**
\`\`\`javascript
await base44.entities.EntityName.delete(id);
\`\`\`

### AI Integration Patterns

**Simple LLM Call**
\`\`\`javascript
const response = await base44.integrations.Core.InvokeLLM({
    prompt: "Analyze the following data...",
    response_json_schema: {
        type: "object",
        properties: {
            analysis: { type: "string" },
            score: { type: "number" }
        }
    }
});
\`\`\`

**With Web Context**
\`\`\`javascript
const response = await base44.integrations.Core.InvokeLLM({
    prompt: "What are the latest trends in AI?",
    add_context_from_internet: true
});
\`\`\`

**With File Upload**
\`\`\`javascript
// First upload file
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Then use in LLM call
const response = await base44.integrations.Core.InvokeLLM({
    prompt: "Analyze this document",
    file_urls: [file_url]
});
\`\`\`

### Creating Backend Functions

**Function Template**
\`\`\`javascript
// functions/myFunction.js
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { param } = await req.json();
        
        // Your logic here
        const result = await base44.entities.Something.list();
        
        return Response.json({ success: true, data: result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});
\`\`\`

**Calling from Frontend**
\`\`\`javascript
const response = await base44.functions.invoke('myFunction', { 
    param: 'value' 
});
console.log(response.data);
\`\`\`

### Styling Guidelines

**Use Brand Colors**
\`\`\`css
/* Available via CSS variables */
var(--color-primary)        /* #E88A1D - Primary orange */
var(--color-text)           /* Main text color */
var(--color-background)     /* Page background */
var(--color-surface)        /* Card/surface background */
var(--color-border)         /* Border color */
\`\`\`

**Component Structure**
\`\`\`javascript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
\`\`\`

## Testing

### Manual Testing Checklist

- [ ] Feature works in Chrome, Firefox, Safari
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] Loading states display correctly
- [ ] Error handling works (network errors, validation)
- [ ] Real-time updates work (if applicable)
- [ ] Authentication flows work (login, logout)
- [ ] RBAC enforced (admin vs user)

### Testing AI Features

\`\`\`javascript
// Test with mock data first
const mockResponse = {
    analysis: "Test analysis",
    score: 85
};

// Then test with actual LLM
const realResponse = await base44.integrations.Core.InvokeLLM({...});
\`\`\`

## Common Patterns

### Loading States
\`\`\`javascript
if (isLoading) return <Loader2 className="animate-spin" />;
if (error) return <div>Error: {error.message}</div>;
if (!data) return null;
\`\`\`

### Form Handling
\`\`\`javascript
const [formData, setFormData] = useState({});

const handleSubmit = async (e) => {
    e.preventDefault();
    await mutation.mutateAsync(formData);
};
\`\`\`

### Real-Time Updates
\`\`\`javascript
useEffect(() => {
    const unsubscribe = base44.entities.Entity.subscribe((event) => {
        queryClient.invalidateQueries(['entity']);
    });
    return unsubscribe;
}, []);
\`\`\`

## Debugging

### Frontend Debugging
- React DevTools for component inspection
- TanStack Query DevTools for data state
- Browser console for errors
- Network tab for API calls

### Backend Debugging
- Deno Deploy logs for function execution
- Test functions via Dashboard → Code → Functions
- Use \`console.log()\` liberally in development

### Common Issues

**Issue**: "Unauthorized" errors
**Solution**: Check \`base44.auth.me()\` returns valid user

**Issue**: Entity not updating in UI
**Solution**: Invalidate React Query cache after mutations

**Issue**: LLM calls failing
**Solution**: Check prompt format and schema structure

## Performance Optimization

### React Query Optimization
\`\`\`javascript
// Prefetch data
queryClient.prefetchQuery(['key'], fetchFn);

// Stale time for less frequent updates
{ staleTime: 5 * 60 * 1000 } // 5 minutes
\`\`\`

### Code Splitting
\`\`\`javascript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loader />}>
    <HeavyComponent />
</Suspense>
\`\`\`

## Best Practices

1. **Always use TypeScript types** (when available)
2. **Validate user input** before API calls
3. **Handle loading and error states** explicitly
4. **Keep components small** (< 300 lines)
5. **Extract reusable logic** into custom hooks
6. **Document complex logic** with comments
7. **Use semantic HTML** for accessibility
8. **Test edge cases** (empty data, errors, etc.)
9. **Clean up subscriptions** in useEffect
10. **Follow existing code patterns** in the project

## Code Review Checklist

- [ ] Code follows existing patterns
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Mobile responsive
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] No hardcoded sensitive data
- [ ] Comments explain "why" not "what"
- [ ] Variable names are descriptive
- [ ] Function names are action-oriented
`;