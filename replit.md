# Overview

Fire Safety KZ is a comprehensive web portal focused on fire safety information and professional services in Kazakhstan. The application serves as a centralized platform for normative documents, educational materials, professional literature, marketplace for fire safety services, and interactive educational games suite. Built with a modern tech stack, it features multilingual support (Russian/Kazakh), role-based access control, extensive content management capabilities, and advanced performance optimization with server-side caching.

## Recent Changes (January 2025)

### 🔧 **AUDIT & STABILIZATION COMPLETED** (January 28, 2025)
**Status**: ✅ PRODUCTION READY
- ✓ **Security Headers** - Helmet, CORS, trust proxy configuration
- ✓ **Database Dual-Driver** - Neon Serverless + PostgreSQL support 
- ✓ **Error Handling** - Global Error Boundary, improved error states
- ✓ **Testing Framework** - Vitest integration with smoke tests
- ✓ **SEO Foundation** - Basic meta tags, canonical URLs in index.html
- ✓ **Environment Config** - Complete .env.example with all variables
- ✓ **Build Stability** - Successful production builds (175KB server bundle)
- ✓ **CSP Security** - Proper Content Security Policy for dev/prod environments

**Performance Issues Identified**:
- ⚠️ Fire3DTraining bundle: 667KB (exceeds 500KB recommendation)
- 📊 Total frontend bundle: 293KB + 3D engine overhead
- 🎯 Lighthouse scores need baseline measurement

**Next Priority**: Bundle size optimization and performance monitoring

## Recent Changes (January 2025)

### 🎯 **3D IMMERSIVE GAMES TRANSFORMATION** 
**Stage 1 ✅ COMPLETED**: 3D Immersive Games Engine
- ✓ **Three.js & Cannon.js Integration** - Realistic 3D physics and particle systems
- ✓ **Fire Physics Engine** - Dynamic fire spread simulation with realistic smoke/flame particles
- ✓ **First-Person 3D Game** - WASD navigation, mouse controls, immersive camera system
- ✓ **4 Training Scenarios** - Office, hospital, factory, residential with unique challenges
- ✓ **Realistic Fire Tools** - Water, foam, CO2, powder extinguishers with physics accuracy

**Stage 2 ✅ COMPLETED**: Gamification & Progression System
- ✓ **Player Profiles** - Level system (1-100), XP tracking, titles, achievements storage
- ✓ **Game Sessions API** - Start/end session tracking, real-time stats, reward calculation
- ✓ **Achievement System** - 12+ predefined achievements with XP rewards and unlocks
- ✓ **Performance Analytics** - Accuracy tracking, time metrics, fire extinguished count
- ✓ **Database Schema** - player_profiles, game_sessions, daily_challenges tables
- ✓ **Gamification UI** - Profile dashboard, progress bars, achievement badges, leaderboards
- ✓ **Session Management** - Live game tracking with real-time statistics updates

### 🏗️ **PREVIOUS IMPLEMENTATIONS**
- ✓ **Full UI/UX Enhancement Initiative** - All 5 stages implemented
- ✓ **Multilingual Support (RU/KZ)** - 140+ localization strings, language switcher
- ✓ **Interactive UI/UX** - Animated statistics, Framer Motion, enhanced landing page
- ✓ **Mobile-First Design** - Responsive components, touch optimizations, infinite scroll
- ✓ **PWA Features** - Installation prompts, offline indicators, service worker
- ✓ **Advanced SEO** - Schema.org structured data, Open Graph tags, analytics
- ✓ **Games Suite Integration** - 5 educational fire safety games with progression
- ✓ **Kazakhstan Theme** - kz-blue, kz-yellow colors throughout components
- ✓ **Performance Optimization** - Server-side caching (60-600s TTL), virtualized lists
- ✓ **GitHub OAuth** - Dual authentication system with session management

# User Preferences

Preferred communication style: Simple, everyday language.
Project focus: Complete implementation of all UI/UX improvement stages with focus on Kazakhstan market localization.
Design preferences: Kazakhstan national colors (blue, yellow), professional fire safety theme, mobile-first approach.
Technical priorities: Performance optimization, SEO, multilingual support (Russian/Kazakh), PWA capabilities.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom Kazakhstan theme colors and CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and data fetching
- **Form Handling**: React Hook Form with Zod validation for type-safe forms

## Backend Architecture
- **Runtime**: Node.js with Express server and TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Authentication**: Replit Auth integration with OpenID Connect for user authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with consistent error handling

## Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Structure**: Comprehensive schema including users, sections, subsections, posts, documents, photos, videos, presentations, ads, and bids
- **Role-Based Access**: User roles (user, supplier, admin) with appropriate permissions
- **Content Organization**: Hierarchical structure with 8 main sections containing subsections and various content types

## Authentication & Authorization
- **Dual Authentication System**: 
  - Replit Auth using OpenID Connect protocol (primary)
  - GitHub OAuth integration for external users
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role Management**: Three-tier role system (user, supplier, admin)
- **Route Protection**: Middleware-based authentication checks for protected routes
- **OAuth Configuration**: Environment-based OAuth settings with configurable providers

## Content Management System
- **Multi-Content Support**: Posts, documents, photos, videos, presentations
- **File Handling**: Upload system with unique file naming and storage
- **Hierarchical Organization**: Sections → Subsections → Content structure
- **Rich Content**: Support for various media types and document formats

## Interactive Games Suite
- **5 Educational Games**: PASS method, evacuation planning, inspection violations, fire systems, first aid
- **Progressive Difficulty**: Beginner to expert levels with completion tracking
- **Offline Capabilities**: Service worker implementation for offline game access
- **Performance Optimized**: Virtualized components and efficient loading
- **Mobile Responsive**: Touch-optimized interfaces for mobile devices
- **Score Tracking**: Local storage persistence for user progress and achievements

## Marketplace System
- **Service Listings**: Professional fire safety service advertisements
- **Bidding System**: Suppliers can bid on service requests
- **Category Management**: Organized service categories for easy navigation
- **Budget Management**: Flexible pricing with currency support

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database with WebSocket support
- **Replit Authentication**: OpenID Connect identity provider
- **File Storage**: Local filesystem storage for uploaded content

## Frontend Libraries
- **UI Framework**: Radix UI primitives for accessible components
- **Data Fetching**: TanStack Query for server state management
- **Form Validation**: Zod schema validation with React Hook Form
- **Date Handling**: date-fns for date formatting and manipulation
- **Styling**: TailwindCSS with PostCSS for styling pipeline

## Backend Services
- **Database**: Drizzle ORM with PostgreSQL driver
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Development Tools**: tsx for TypeScript execution, esbuild for production builds

## Development Environment
- **Build Tool**: Vite with React plugin for fast development
- **TypeScript**: Full type safety across frontend and backend
- **Hot Reload**: Vite HMR for development efficiency
- **Error Handling**: Runtime error overlays for development debugging

## Performance Optimization
- **Server-Side Caching**: Redis-like caching with configurable TTL (60-600 seconds)
- **Virtualized Lists**: Large dataset rendering optimization in marketplace and content pages
- **Lazy Loading**: Component-based lazy loading with Suspense boundaries
- **Image Optimization**: Responsive image components with lazy loading
- **PWA Features**: Service worker, manifest, and offline capabilities for core functionality