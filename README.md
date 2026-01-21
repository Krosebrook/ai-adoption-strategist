# AI Adoption Strategist

Enterprise AI adoption assessment and implementation planning platform built with React and Vite.

## Features

- **AI-Powered Assessments**: Comprehensive evaluation of AI platform readiness
- **Implementation Planning**: Automated roadmap generation with risk management
- **Executive Dashboard**: Real-time metrics and adoption trends
- **Platform Comparison**: Side-by-side comparison of enterprise AI platforms
- **Progressive Web App**: Install on any device for offline access

## PWA (Progressive Web App) Support

This application is a fully-featured Progressive Web App that can be installed on any device:

### Benefits
- **Offline Access**: Continue working even without internet connection
- **Fast Loading**: Cached assets provide near-instant load times
- **App-Like Experience**: Runs in standalone mode without browser chrome
- **Auto-Updates**: Automatically receives updates when available

### Installation
1. Visit the application in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt (usually appears automatically)
3. Click "Install" or use the browser's "Install App" option from the menu
4. The app will be added to your home screen/desktop

### Technical Details
- Service Worker caches static assets for offline use
- Network-first strategy for API calls ensures fresh data
- Cache-first strategy for static resources improves performance
- Automatic cache invalidation on app updates

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Project Structure
```
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── api/            # API client setup
│   ├── lib/            # Utilities and context providers
│   ├── hooks/          # Custom React hooks
│   └── public/         # PWA assets (manifest, service worker)
├── public/             # Static assets served by Vite
└── functions/          # Serverless function integrations
```

## Testing PWA Functionality

### Manual Testing
1. Run the development server: `npm run dev`
2. Open Chrome DevTools → Application tab
3. Check "Manifest" section for PWA manifest validation
4. Check "Service Workers" section to verify registration
5. Test offline mode by stopping the server and refreshing

### Production Testing
1. Build the app: `npm run build`
2. Serve the production build: `npm run preview`
3. Open Application tab in DevTools
4. Use "Add to Home Screen" to install the PWA
5. Test offline functionality

### Lighthouse Audit
Run a Lighthouse PWA audit in Chrome DevTools to verify:
- Installability
- Offline functionality
- Performance metrics
- Best practices compliance

## Documentation

⚠️ **Documentation Status**: Level 2 of 5 (Developing) - See [DOCUMENTATION_AUDIT.md](./DOCUMENTATION_AUDIT.md) for details.

### Complete Documentation

Comprehensive production-ready documentation is available:

- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** - Complete overview of all documentation
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and design
- **[Framework](./docs/FRAMEWORK.md)** - Technology stack and patterns
- **[API Reference](./docs/API_REFERENCE.md)** - API endpoints and usage
- **[Security](./docs/SECURITY.md)** - Security architecture and compliance
- **[Product Requirements](./docs/PRD_MASTER.md)** - Product vision and requirements

### Critical Gaps (Production Blockers)

The following documentation is **required before production deployment**:

- **[Testing Strategy](./docs/TESTING_STRATEGY.md)** - [Not Started] - P0 Critical
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - [Not Started] - P0 Critical
- **[CI/CD Pipeline](./docs/CI_CD.md)** - [Not Started] - P0 Critical
- **[Environment Config](./docs/ENVIRONMENT_CONFIG.md)** - [Not Started] - P0 Critical
- **[Observability](./docs/OBSERVABILITY.md)** - [Not Started] - P0 Critical
- **[Incident Response](./docs/INCIDENT_RESPONSE.md)** - [Not Started] - P0 Critical

See [DOCUMENTATION_AUDIT.md](./DOCUMENTATION_AUDIT.md) for the complete audit report and remediation plan.

For all documentation including standards, feature docs, and operational guides, see the [docs directory](./docs/README.md).

## License

Proprietary - All rights reserved
