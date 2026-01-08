# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **PWA Support**: Application now functions as a Progressive Web App
  - Manifest.json with app metadata, theme colors, and shortcuts
  - Service worker with intelligent caching strategies for offline support
  - Cache-first strategy for static assets (JS, CSS, images, fonts)
  - Network-first strategy for API calls with 5-minute cache fallback
  - Automatic service worker registration in production builds
  - Install prompt component for easy app installation
  - Offline access to previously loaded content
  - Fast repeat visits through aggressive asset caching

### Changed
- Updated README.md with comprehensive PWA documentation and testing instructions
- Service worker only activates in production builds to avoid development caching issues

### Technical Details
- Service worker version: 1.0.0
- Cache name: ai-strategist-v1 (static assets), ai-strategist-api-v1 (API responses)
- API cache expiration: 5 minutes
- Precached assets: index.html, manifest.json
- Runtime caching: All static assets and API responses

## [0.0.0] - 2026-01-07

### Added
- Initial application setup with Base44 SDK integration
- AI-powered assessment and implementation planning features
- Executive dashboard with real-time metrics
- Platform comparison tools
- Comprehensive UI component library with Radix UI and Tailwind CSS
