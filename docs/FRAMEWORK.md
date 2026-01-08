# Framework Documentation

**Version**: 1.0.0  
**Last Updated**: 2026-01-08  
**Owner**: Engineering Team  
**Status**: Active

## Overview

This document describes the core technologies, libraries, and architectural patterns used in the AI Adoption Strategist platform. It serves as a reference for understanding the technical foundation and design decisions.

## Technology Stack

### Frontend Framework

#### React 18.2
**Purpose**: UI component framework

**Key Features Used**:
- Functional components with hooks
- Context API for state management
- Suspense for code splitting
- Concurrent rendering features

**Design Patterns**:
- Component composition
- Higher-order components (HOCs)
- Render props
- Custom hooks for reusable logic

**Example Component Structure**:
```jsx
// Functional component with hooks
import { useState, useEffect } from 'react';

export function AssessmentCard({ assessment }) {
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    // Side effects
  }, [assessment]);
  
  return (
    <div className="assessment-card">
      {/* Component JSX */}
    </div>
  );
}
```

#### React Router 6.26
**Purpose**: Client-side routing

**Features Used**:
- Nested routes
- Route protection and guards
- Lazy loading routes
- URL parameters and query strings

**Routing Structure**:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="assessments" element={<Assessments />} />
      <Route path="assessments/:id" element={<AssessmentDetail />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Styling Framework

#### Tailwind CSS 3.4
**Purpose**: Utility-first CSS framework

**Configuration**: `tailwind.config.js`
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Custom color palette
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

**Design System**:
- CSS variables for theming
- Responsive design with breakpoints
- Dark mode support via `next-themes`
- Animation utilities

**Usage Example**:
```jsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
  Click Me
</button>
```

#### shadcn/ui Components
**Purpose**: Accessible component library built on Radix UI

**Components Used**:
- Buttons, Cards, Dialogs
- Forms (Input, Select, Checkbox)
- Navigation (Tabs, Accordion)
- Overlays (Tooltip, Popover)
- Data Display (Table, Badge)

**Component Customization**:
```jsx
// Custom button variant
import { Button } from '@/components/ui/button';

<Button variant="outline" size="lg">
  Custom Button
</Button>
```

### Type System

#### TypeScript 5.8
**Purpose**: Static type checking

**Configuration**: `jsconfig.json` (JavaScript with JSDoc)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "checkJs": true,
    "allowJs": true
  }
}
```

**Type Safety Practices**:
- Props validation with PropTypes or TypeScript
- API response type definitions
- Custom hook type definitions
- Event handler typing

**Example Type Definitions**:
```javascript
/**
 * @typedef {Object} Assessment
 * @property {string} id - Unique identifier
 * @property {string} name - Assessment name
 * @property {string} status - Current status
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @param {Assessment} assessment
 * @returns {string}
 */
function formatAssessment(assessment) {
  return `${assessment.name} - ${assessment.status}`;
}
```

### Backend Integration

#### Base44 SDK 0.8.3
**Purpose**: Backend-as-a-Service platform integration

**Key Features**:
- Authentication and user management
- Database operations (CRUD)
- Real-time data subscriptions
- File storage
- Serverless functions

**SDK Setup**:
```javascript
import { createClient } from '@base44/sdk';

const client = createClient({
  projectId: import.meta.env.VITE_BASE44_PROJECT_ID,
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
});
```

**Database Operations**:
```javascript
// Create
const assessment = await client
  .from('assessments')
  .insert({ name: 'AI Readiness', status: 'draft' });

// Read
const assessments = await client
  .from('assessments')
  .select('*')
  .eq('status', 'active');

// Update
await client
  .from('assessments')
  .update({ status: 'completed' })
  .eq('id', assessmentId);

// Delete
await client
  .from('assessments')
  .delete()
  .eq('id', assessmentId);
```

**Real-time Subscriptions**:
```javascript
const subscription = client
  .from('assessments')
  .on('*', (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

#### TanStack Query 5.84 (React Query)
**Purpose**: Data fetching and caching library

**Key Features**:
- Automatic caching and background updates
- Request deduplication
- Optimistic updates
- Infinite scroll support

**Usage Pattern**:
```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['assessments'],
  queryFn: () => client.from('assessments').select('*'),
});

// Mutate data
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (newAssessment) => 
    client.from('assessments').insert(newAssessment),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
  },
});
```

### State Management

#### React Context API
**Purpose**: Global state management for theme, auth, etc.

**Context Example**:
```javascript
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

#### Local State (useState, useReducer)
**Purpose**: Component-level state

**When to Use**:
- Form inputs and validation
- UI state (modals, dropdowns)
- Component-specific data

### Form Management

#### React Hook Form 7.54
**Purpose**: Performant form handling with validation

**Features**:
- Minimal re-renders
- Built-in validation
- Schema validation with Zod
- Easy error handling

**Form Example**:
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* More fields */}
    </form>
  );
}
```

### UI Component Libraries

#### Radix UI
**Purpose**: Unstyled, accessible component primitives

**Components**:
- Dialog, Dropdown Menu, Popover
- Accordion, Tabs, Collapsible
- Tooltip, Hover Card
- Select, Checkbox, Radio Group

**Benefits**:
- Full accessibility (ARIA)
- Keyboard navigation
- Focus management
- Screen reader support

#### Lucide React 0.475
**Purpose**: Icon library

**Usage**:
```jsx
import { Check, X, AlertCircle } from 'lucide-react';

<AlertCircle className="h-4 w-4 text-destructive" />
```

### Data Visualization

#### Recharts 2.15
**Purpose**: Charting library built on React

**Chart Types**:
- Line, Bar, Area charts
- Pie, Radar charts
- Composed charts

**Example**:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#8884d8" />
</LineChart>
```

### Animation

#### Framer Motion 11.16
**Purpose**: Animation library for React

**Features**:
- Declarative animations
- Gestures (drag, hover, tap)
- Layout animations
- Scroll animations

**Example**:
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Build Tools

#### Vite 6.1
**Purpose**: Fast build tool and dev server

**Features**:
- Hot Module Replacement (HMR)
- Optimized builds
- Plugin system
- Environment variables

**Configuration**: `vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { base44 } from '@base44/vite-plugin';

export default defineConfig({
  plugins: [react(), base44()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### Code Quality

#### ESLint 9.19
**Purpose**: JavaScript/TypeScript linting

**Configuration**: `eslint.config.js`
```javascript
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    rules: {
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
```

**Linting Commands**:
```bash
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
```

### Utility Libraries

#### Lodash 4.17
**Purpose**: JavaScript utility library

**Common Usage**:
- `debounce`, `throttle` for performance
- `groupBy`, `sortBy` for data manipulation
- `merge`, `cloneDeep` for object operations

#### date-fns 3.6
**Purpose**: Date manipulation library

**Usage**:
```javascript
import { format, parseISO, addDays, differenceInDays } from 'date-fns';

const formatted = format(new Date(), 'yyyy-MM-dd');
const future = addDays(new Date(), 7);
```

#### clsx 2.1 & tailwind-merge
**Purpose**: Conditional class name utilities

**Usage**:
```javascript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />
```

## Architectural Patterns

### Component Architecture

#### Atomic Design Principles
- **Atoms**: Basic UI elements (Button, Input)
- **Molecules**: Simple component groups (FormField)
- **Organisms**: Complex components (AssessmentForm)
- **Templates**: Page layouts
- **Pages**: Complete pages

#### Component Organization
```
components/
├── ui/              # Reusable UI components (atoms/molecules)
├── dashboard/       # Dashboard-specific components
├── assessment/      # Assessment feature components
├── shared/          # Shared organisms
└── layout/          # Layout components
```

### Data Flow Architecture

#### Unidirectional Data Flow
```
User Action → Event Handler → API Call → State Update → Re-render
```

#### API Layer Pattern
```javascript
// src/api/assessments.js
export const assessmentsAPI = {
  getAll: () => client.from('assessments').select('*'),
  getById: (id) => client.from('assessments').select('*').eq('id', id).single(),
  create: (data) => client.from('assessments').insert(data),
  update: (id, data) => client.from('assessments').update(data).eq('id', id),
  delete: (id) => client.from('assessments').delete().eq('id', id),
};
```

### Error Handling Pattern

#### Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

#### API Error Handling
```javascript
try {
  const data = await assessmentsAPI.getAll();
  return data;
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
  } else if (error.status === 403) {
    // Handle authorization error
  } else {
    // Handle general error
  }
  throw error;
}
```

### Performance Optimization

#### Code Splitting
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

#### Memoization
```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize component
const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  return <div>{/* Render */}</div>;
});

// Memoize value
const processedData = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Memoize callback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## Progressive Web App (PWA)

### Service Worker
**Purpose**: Offline support and caching

**Cache Strategy**:
- **Static Assets**: Cache-first
- **API Calls**: Network-first with cache fallback
- **Images**: Cache-first with 30-day expiration

**Implementation**: See `/public/sw.js`

### Web App Manifest
**Purpose**: App installation and appearance

**Configuration**: `/public/manifest.json`
```json
{
  "name": "AI Adoption Strategist",
  "short_name": "AI Strategist",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

## Environment Configuration

### Environment Variables
```bash
# .env.local
VITE_BASE44_PROJECT_ID=your_project_id
VITE_BASE44_API_KEY=your_api_key
VITE_APP_NAME=AI Adoption Strategist
```

### Build Configurations

#### Development
```bash
npm run dev
# - Hot reload enabled
# - Source maps enabled
# - No service worker
```

#### Production
```bash
npm run build
# - Minification enabled
# - Tree shaking
# - Service worker active
# - Optimized chunks
```

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing with renderHook
- Utility function testing

### Integration Testing
- Feature flow testing
- API integration testing
- Form submission testing

### E2E Testing
- Critical user journeys
- Cross-browser testing
- PWA functionality

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [SECURITY.md](./SECURITY.md) - Security practices

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | Engineering Team | Initial version |
