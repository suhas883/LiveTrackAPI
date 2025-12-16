# LiveTrackings.com - Package Tracking Platform

## Overview

LiveTrackings.com is an AI-powered package tracking application that allows users to track shipments from 500+ couriers worldwide. The platform leverages Perplexity AI's Sonar Pro model to automatically detect carriers from tracking numbers and retrieve real-time tracking information. Built with a modern full-stack architecture, it features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management and caching

**UI Component Strategy**
- shadcn/ui component library (New York style variant) providing accessible, customizable Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CVA (Class Variance Authority) for type-safe component variant management
- Material Design principles adapted for utility-focused package tracking interface

**Design System**
- Custom color system using HSL CSS variables for theme support (light/dark modes)
- Consistent spacing scale using Tailwind units (2, 4, 6, 8)
- Typography: Inter font for UI, monospace for tracking numbers
- Component patterns: Cards with subtle shadows, timeline/stepper components, status badges

**State Management**
- React Query handles all server state with aggressive caching (staleTime: Infinity)
- Local React state for UI interactions
- Theme context for light/dark mode persistence via localStorage

### Backend Architecture

**Server Framework**
- Express.js application with TypeScript
- HTTP server creation using Node's built-in `http` module
- Custom logging middleware for request/response tracking
- JSON body parsing with raw body preservation for webhook support

**API Design**
- RESTful endpoints under `/api` prefix
- POST `/api/track` - Submit tracking number and receive AI-parsed results
- GET `/api/history` - Retrieve recent tracking searches
- DELETE `/api/history/:id` - Remove tracking history entries
- Request validation using Zod schemas from shared types

**Development vs Production**
- Development: Vite middleware integrated into Express for HMR
- Production: Static file serving from pre-built dist/public directory
- Build process uses esbuild for server bundling with selective dependency bundling (allowlist strategy to reduce syscalls)

### Data Storage Solutions

**Database**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database queries and schema management
- Connection pooling via `pg` Pool for efficient database connections

**Schema Design**
- `tracking_records` table: Stores complete tracking information including courier, status, events timeline, origin/destination, estimated delivery
- `tracking_history` table: Maintains recent search history for quick re-tracking
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- JSONB column for flexible event storage (tracking timeline data)
- Timestamp fields with automatic `defaultNow()` for created_at/updated_at

**Type Safety**
- Shared schema definitions in `shared/schema.ts` consumed by both frontend and backend
- Drizzle-zod integration for automatic Zod schema generation from database schema
- Custom TypeScript types exported for TrackingEvent, TrackingRecord, TrackingHistory

### Authentication & Authorization

Currently, the application does not implement user authentication. All tracking functionality is publicly accessible. The architecture includes session management dependencies (express-session, connect-pg-simple) suggesting future authentication implementation.

## External Dependencies

### AI/ML Services

**Perplexity AI (Primary)**
- API: `https://api.perplexity.ai/chat/completions`
- Model: Sonar Pro (online search capabilities)
- Purpose: Automatic courier detection from tracking number patterns and real-time package status retrieval
- Returns structured JSON with courier info, status, timeline events, origin/destination, estimated delivery
- Requires PERPLEXITY_API_KEY environment variable

### UI Component Libraries

**Radix UI Primitives**
- Comprehensive set of unstyled, accessible component primitives
- Used components: Dialog, Dropdown, Popover, Toast, Accordion, Checkbox, Select, Tabs, Tooltip, and 15+ others
- Provides keyboard navigation, focus management, and ARIA attributes out-of-box

**shadcn/ui**
- Pre-built component implementations using Radix UI + Tailwind CSS
- Configured with "new-york" style variant
- Components copied into project (not installed as dependency) for full customization

### Styling & Theming

**Tailwind CSS**
- Utility-first CSS framework with custom configuration
- Extended theme with HSL-based color system for dynamic theming
- Custom border radius values, shadow definitions, and spacing scale
- PostCSS integration with autoprefixer

**Additional Styling Tools**
- `clsx` and `tailwind-merge` (via cn utility) for conditional class merging
- `class-variance-authority` for type-safe component variants
- Google Fonts CDN: Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter

### Form Management

**React Hook Form ecosystem**
- `react-hook-form` for performant form state management
- `@hookform/resolvers` for Zod schema validation integration
- Zod for runtime type validation and error handling
- `zod-validation-error` for human-readable error messages

### Database & ORM

**Drizzle ORM**
- PostgreSQL dialect configuration
- Migration output to `./migrations` directory
- Schema introspection and type generation
- Requires DATABASE_URL environment variable

**PostgreSQL Client**
- `pg` package for native PostgreSQL driver
- Connection pooling for production workloads

### Date/Time Handling

**date-fns**
- Lightweight alternative to Moment.js
- Used for `formatDistanceToNow()` in tracking history display
- Modular imports for tree-shaking optimization

### Development Tools

**Replit-specific**
- `@replit/vite-plugin-runtime-error-modal` for error overlay in development
- `@replit/vite-plugin-cartographer` for code navigation
- `@replit/vite-plugin-dev-banner` for development environment indicator

**Build Tools**
- TypeScript compiler with strict mode enabled
- esbuild for fast server bundling
- Vite for frontend bundling and development server

### Additional Dependencies

**Utilities**
- `nanoid` for generating unique IDs (used in Vite HMR cache busting)
- `embla-carousel-react` for carousel/slider components
- `cmdk` for command palette UI pattern

**Potential Future Integrations** (installed but not actively used)
- Stripe for payment processing
- Nodemailer for email notifications  
- OpenAI/Google Generative AI for additional AI features
- Passport.js for authentication strategies
- WebSocket (`ws`) for real-time updates
- Rate limiting (`express-rate-limit`) for API protection