# RehabOS AI — Claude Code Implementation Tasks

> **Total Tasks:** 150+ across 8 phases  
> **Execution:** Each task is independently runnable via `claude -p '...'`  
> **Pattern:** Use `claude -p 'Task description' --allowedTools 'Read,Write,Edit,Bash' --max-turns 20-40 --dangerously-skip-permissions`

---

## Phase 0: Foundation (Weeks 1-3) — 22 Tasks

### T001: Initialize Turborepo Monorepo
```
Goal: Set up pnpm workspace monorepo with Turborepo build cache
Context: Root project structure at G:/RehabOS-AI/
Files needed:
- package.json (root) — pnpm workspace config
- pnpm-workspace.yaml — app packages/* directories
- turbo.json — pipeline with build, lint, typecheck, test tasks
- .gitignore — node_modules, .next, dist, turbo
- .npmrc — shamefully-hoist=true
Tasks:
1. Create root package.json with workspaces
2. Create pnpm-workspace.yaml listing apps/*, packages/*
3. Create turbo.json with build/lint/typecheck/test tasks
4. Create .gitignore and .npmrc
5. Run pnpm install to verify
Verification:
- pnpm install succeeds
- pnpm turbo build --dry-run shows correct dependency graph
- pnpm turbo lint completes
```

### T002: Configure TypeScript Strict Mode
```
Goal: TypeScript strict mode configs for all workspaces
Dependencies: T001
Files needed:
- packages/config/typescript/base.json — strict config
- packages/config/typescript/nextjs.json — extends base with JSX
- packages/config/typescript/react-native.json — extends base for RN
- apps/web/tsconfig.json — extends nextjs
- packages/database/tsconfig.json — extends base
Tasks:
1. Create base strict tsconfig (noUncheckedIndexedAccess, exactOptionalPropertyTypes, strictNullChecks)
2. Create nextjs variant extending base
3. Create shared configs for each workspace
4. Verify typecheck passes on all projects
Verification:
- pnpm typecheck succeeds on all workspaces
- Strict mode enforcement works (test by adding an offending type)
```

### T003: Scaffold Next.js Web App
```
Goal: Next.js 15 web app with App Router, TailwindCSS, Shadcn UI
Dependencies: T001, T002
Files needed:
- apps/web/package.json — deps: next, react, tailwindcss, shadcn, lucide, framer-motion
- apps/web/next.config.ts
- apps/web/tailwind.config.ts
- apps/web/postcss.config.mjs
- apps/web/app/layout.tsx — root layout with dark mode
- apps/web/app/globals.css — tailwind directives + custom
- apps/web/components/ui/ — shadcn init output
Tasks:
1. Create package.json with all dependencies
2. Create next.config.ts with image domains, experimental settings
3. Create tailwind.config.ts with dark mode, custom colors
4. Create root layout.tsx with metadata, fonts, providers
5. Initialize shadcn/ui (button, card, dialog, input, label, select, table, tabs, toast)
6. Create globals.css with design system variables
Verification:
- pnpm build succeeds
- Dark mode toggle works
- Shadcn components render (add test button to test)
- Tailwind classes apply (bg-primary, text-foreground)
```

### T004: Set Up Supabase + Prisma Schema
```
Goal: Supabase project, Prisma schema with core entities
Dependencies: T001
Files needed:
- packages/database/package.json
- packages/database/prisma/schema.prisma — core schemas only (organizations, clinics, clinicians, patients, roles)
- packages/database/tsconfig.json
- packages/database/.env.example
- supabase/config.toml
Tasks:
1. Create database package with Prisma dependency
2. Write Prisma schema for: Organization, Clinic, Clinician, Patient, Role, ClinicianRole
3. Create .env.example with DATABASE_URL template
4. Create Supabase config.toml with extension settings
5. Verify prisma generate works
Verification:
- prisma generate produces types
- Schema compiles without errors
- Relations are correct (organization → clinics → clinicians)
- Indexes on organization_id for RLS
```

### T005: Implement Supabase Auth Flow
```
Goal: Login, signup, password reset, MFA auth flow
Dependencies: T003, T004
Files needed:
- apps/web/middleware.ts — auth guard middleware
- apps/web/lib/supabase/client.ts — browser client
- apps/web/lib/supabase/server.ts — server client (cookie-based)
- apps/web/lib/supabase/admin.ts — service_role client (server-only)
- apps/web/app/(auth)/login/page.tsx — email/password + OAuth
- apps/web/app/(auth)/signup/page.tsx — registration form
- apps/web/app/(auth)/forgot-password/page.tsx
- apps/web/app/(auth)/reset-password/page.tsx
- apps/web/app/(auth)/callback/route.ts — OAuth callback
- apps/web/app/providers/supabase-provider.tsx — session context
Tasks:
1. Create Supabase browser client singleton
2. Create Supabase server client with cookie handling
3. Create middleware that redirects unauthenticated users
4. Build login page with email/password + Google OAuth
5. Build signup page with validation
6. Build password reset flow
7. Create session provider for client-side auth state
8. Create protected route layout
Verification:
- User can sign up with email/password
- User can log in
- OAuth with Google works
- Protected routes redirect to /login
- Session persists across refresh
- Password reset email sent
```

### T006: Implement RBAC + RLS
```
Goal: Role-based access control with Supabase RLS
Dependencies: T004, T005
Files needed:
- packages/database/prisma/schema.prisma — Updated with roles + permissions
- packages/database/rls/001_organizations.sql — Organization isolation
- packages/database/rls/002_patients.sql — Patient access
- packages/database/rls/003_clinicians.sql — Clinician access
- apps/web/lib/permissions.ts — Permission check utilities
- apps/web/hooks/use-permissions.ts — React hook for permissions
Tasks:
1. Add permissions field to Role model
2. Create RLS policies for organizations (users see only their org)
3. Create RLS policies for patients (own patients, admin sees all)
4. Create RLS policies for clinicians (same org)
5. Build permission checking utilities
6. Build usePermissions hook for React components
7. Seed default roles (admin, clinician, billing_admin, front_desk, patient)
Verification:
- Cross-org data access is impossible (verified by test)
- RLS policies enforce at database level (not just app)
- Permission checks work in UI (conditional rendering)
- Admin can assign roles
- Unauthorized API calls return 403
```

### T007: Dashboard Layout Shell
```
Goal: Main application shell with sidebar, header, navigation
Dependencies: T005
Files needed:
- apps/web/app/(dashboard)/layout.tsx — dashboard shell
- apps/web/components/layout/sidebar.tsx — nav sidebar
- apps/web/components/layout/header.tsx — top header
- apps/web/components/layout/dashboard-shell.tsx — combines sidebar + header
- apps/web/components/layout/nav-items.ts — navigation items
Tasks:
1. Create sidebar with navigation items (collapsible)
2. Create header with search, notifications, profile menu
3. Create dashboard layout that wraps all authenticated routes
4. Implement responsive behavior (sidebar collapses on mobile)
5. Add keyboard shortcuts (Cmd+K for search, etc.)
6. Add breadcrumb component
Verification:
- Sidebar navigation works for all routes
- Responsive: sidebar collapses on mobile
- Header shows current user info
- Keyboard shortcut for search works
- Active route highlighted in sidebar
```

### T008: Set Up CI/CD Pipeline
```
Goal: GitHub Actions for lint, typecheck, test, build + Vercel deploy
Dependencies: T003
Files needed:
- .github/workflows/ci.yml — lint, typecheck, test, build
- .github/workflows/deploy.yml — Vercel deploy
- .github/ISSUE_TEMPLATE/task.md — Issue template
Tasks:
1. Create CI workflow: runs on PR and push to develop/main
2. Add matrix testing (Node 22, PostgreSQL service)
3. Create deploy workflow: runs on push to main
4. Integrate with Vercel for preview deploys on PR
5. Add status checks required for merge
Verification:
- CI passes on PR
- Vercel deploys on main push
- Preview deployment URL in PR checks
- All checks pass before merge allowed
```

### T009: Set Up Error Monitoring (Sentry)
```
Goal: Error tracking with source maps and performance monitoring
Dependencies: T003
Files needed:
- apps/web/sentry.client.config.ts
- apps/web/sentry.server.config.ts
- apps/web/sentry.edge.config.ts
- apps/web/next.config.ts — Sentry webpack plugin
Tasks:
1. Initialize Sentry for Next.js
2. Configure source maps upload
3. Set up performance tracing
4. Create error boundary component
Verification:
- Test error captured in Sentry dashboard
- Performance data visible in Sentry
- Source maps resolve to correct code
```

### T010: Set Up Product Analytics (PostHog)
```
Goal: Product analytics event tracking
Dependencies: T005
Files needed:
- apps/web/app/providers/posthog-provider.tsx
- apps/web/lib/analytics.ts — event helpers
- apps/web/app/layout.tsx — wrap with PostHog provider
Tasks:
1. Initialize PostHog in provider
2. Add page view tracking
3. Create typed event helpers for key actions
4. Configure feature flags (GrowthBook integration optional)
Verification:
- Page views appear in PostHog dashboard
- Custom events fire correctly
- Feature flags toggle work
```

### T011: Docker Compose for Local Dev
```
Goal: Local development environment with Docker services
Dependencies: None
Files needed:
- docker/docker-compose.yml — meilisearch, redis, neo4j, jitsi (optional)
- docker/.env.example
- docker/Dockerfile.web
Tasks:
1. Create docker-compose.yml with Meilisearch, Redis services
2. Create .env.example with all service credentials
3. Create web Dockerfile for containerized dev
Verification:
- docker compose up starts all services
- App connects to local Meilisearch
- App connects to local Redis
- Data persists across restarts
```

### T012: Initialize Documentation (Mintlify)
```
Goal: Developer documentation site
Dependencies: None
Files needed:
- docs/README.md
- docs/mint.json — Mintlify config
- docs/architecture/overview.md
- docs/getting-started/quickstart.md
- docs/getting-started/development.md
Tasks:
1. Create Mintlify structure
2. Write getting started guide
3. Write architecture overview
4. Create API documentation template
Verification:
- docs site renders locally
- Navigation works
- Code blocks are syntax highlighted
```

### T013: Set Up Meilisearch
```
Goal: Self-hosted Meilisearch for full-text search
Dependencies: T011
Files needed:
- packages/api/search/client.ts — Meilisearch client
- packages/api/search/indexer.ts — index management
- packages/api/search/sync.ts — Supabase → Meilisearch sync
Tasks:
1. Create Meilisearch client wrapper
2. Define search indexes (patients, exercises, assessments)
3. Create sync function that updates Meilisearch on DB changes
4. Create search query helpers with faceted filters
Verification:
- Meilisearch indexes created
- Data synchronizes from Supabase
- Search queries return results with typo tolerance
- Faceted filtering works
```

### T014: Exercise Categories Seed Data
```
Goal: Seed initial exercise categorization system
Dependencies: T004
Files needed:
- packages/database/seeds/exercise-categories.ts
Tasks:
1. Create seed script for exercise categories
2. Categories: strength, flexibility, balance, coordination, endurance, manual_therapy, neuromuscular_re-education, gait_training
3. Create subcategories under each
Verification:
- Seed script runs and inserts categories
- Parent-child hierarchy correct
- Slugs are unique
```

### T015: Body Regions Seed Data
```
Goal: Seed body region taxonomy
Dependencies: T004
Files needed:
- packages/database/seeds/body-regions.ts
Tasks:
1. Create body regions: full_body, head_neck, cervical_spine, thoracic_spine, lumbar_spine, shoulder, elbow, wrist_hand, hip, knee, ankle_foot
2. Create sub-regions for each
3. Link to common diagnosis codes
Verification:
- Body regions seeded
- Hierarchical structure correct
```

### T016: Standard Assessments Seed Data
```
Goal: Seed initial standardized outcome measures
Dependencies: T004
Files needed:
- packages/database/seeds/assessments.ts
- packages/database/seeds/assessment-questions.ts
Tasks:
1. Seed LEFS (Lower Extremity Functional Scale) — 20 questions
2. Seed DASH (Disabilities of Arm, Shoulder and Hand) — 30 questions
3. Seed NDI (Neck Disability Index) — 10 questions
4. Seed Oswestry (Low Back Pain Disability) — 10 questions
5. Seed Berg Balance Test — 14 items
6. Seed Numeric Pain Rating Scale
7. Seed Timed Up and Go
8. Seed Modified Ashworth Scale
9. Seed Manual Muscle Testing (MMT) scale
10. Set scoring formulas, MCID values, normative data
Verification:
- All assessments created with correct question structures
- Scoring formulas calculate correctly
- MCID values populated
- Normative data present
```

### T017: Configure ESLint
```
Goal: Shared ESLint configuration for all workspaces
Dependencies: T001, T002
Files needed:
- packages/config/eslint/base.js
- packages/config/eslint/next.js
- packages/database/.eslintrc.js
- apps/web/.eslintrc.js
Tasks:
1. Create base ESLint config with TS plugin
2. Create Next.js-specific config
3. Configure import order rules
4. Add React hooks plugin
Verification:
- pnpm lint succeeds on all workspaces
- Import ordering enforced
- React hooks rules enforced
```

### T018: Supabase Storage Setup
```
Goal: Storage buckets for patient files, exercise media, documents
Dependencies: T004
Files needed:
- supabase/storage-policies.sql — bucket-level RLS
- apps/web/lib/supabase/storage.ts — upload/download helpers
Tasks:
1. Create buckets: exercise-videos, exercise-images, patient-documents, assessment-images, clinician-uploads
2. Set bucket-level RLS policies
3. Create typed upload/download helpers
4. Add image transform URL builder
Verification:
- Files upload to correct buckets
- RLS prevents cross-org file access
- Image transforms work (resize, format)
```

### T019: Dark Mode Theme
```
Goal: Fully functional dark/light mode with system preference detection
Dependencies: T003
Files needed:
- apps/web/app/providers/theme-provider.tsx
- apps/web/hooks/use-theme.ts
- apps/web/components/ui/theme-toggle.tsx
- apps/web/app/globals.css — CSS variables for both themes
Tasks:
1. Create theme provider with system preference detection
2. Define CSS variables for dark and light themes
3. Create theme toggle component (sun/moon icons)
4. Persist theme preference to localStorage
Verification:
- Default to system preference
- Toggle switches between dark/light
- Preference persists across page loads
- All components use CSS variables (not hardcoded colors)
```

### T020: Keyboard Shortcuts System
```
Goal: Global keyboard shortcut system for power users
Dependencies: T003
Files needed:
- apps/web/hooks/use-keyboard-shortcuts.ts
- apps/web/components/layout/command-palette.tsx — Cmd+K palette
- apps/web/lib/constants/shortcuts.ts
Tasks:
1. Create keyboard shortcut hook (modular, composable)
2. Create command palette (Cmd+K) for navigation and actions
3. Register shortcuts: Cmd+N new patient, Cmd+E search exercises, etc.
4. Show shortcut hints in tooltips
Verification:
- Cmd+K opens command palette
- Cmd+N navigates to new patient
- Shortcuts shown in appropriate tooltips
- No conflicts with browser defaults
```

### T021: i18n Framework Setup
```
Goal: Internationalization framework (prepare for multi-language)
Dependencies: T003
Files needed:
- apps/web/lib/i18n/config.ts — i18n setup
- apps/web/lib/i18n/locales/en/common.json
- apps/web/app/providers/i18n-provider.tsx
Tasks:
1. Set up i18n framework (next-intl or similar)
2. Create English locale file with common strings
3. Create translation helper hooks
4. Add locale detection from browser/URL
Verification:
- English strings render correctly
- Locale switches work (at least mock second language)
- Fallback to English for missing translations
```

### T022: Shared Component Library Bootstrap
```
Goal: Initialize shared UI package with design system components
Dependencies: T003
Files needed:
- packages/shared-ui/package.json
- packages/shared-ui/tsconfig.json
- packages/shared-ui/components/ (shared components)
- packages/shared-ui/tokens/colors.ts, spacing.ts, typography.ts
Tasks:
1. Create shared-ui package
2. Define design tokens (colors, spacing, typography, shadows)
3. Create base components: Typography, Spacer, Container, Stack
4. Export from index.ts
Verification:
- Components importable in apps/web
- Design tokens compile
- Circular dependency check passes
```

---

## Phase 1: Core Clinical (Weeks 4-7) — 25 Tasks

### T101: Patient CRUD
```
Goal: Full patient management with CRUD operations
Dependencies: T004, T005, T006
Files needed:
- apps/web/lib/supabase/queries/patients.ts — DB queries
- apps/web/app/(dashboard)/patients/page.tsx — patient list
- apps/web/app/(dashboard)/patients/new/page.tsx — create patient
- apps/web/app/(dashboard)/patients/[id]/page.tsx — patient detail
- apps/web/app/(dashboard)/patients/[id]/edit/page.tsx — edit patient
- apps/web/components/patients/patient-list.tsx
- apps/web/components/patients/patient-card.tsx
- apps/web/components/forms/patient-form.tsx
- apps/web/app/_actions/patients.ts — server actions
Tasks:
1. Create Supabase query functions for patient CRUD
2. Build patient list page with TanStack Table (sort, filter, paginate)
3. Build patient creation form with Zod validation
4. Build patient detail page with key info display
5. Build patient edit form
6. Create server actions for create/update/delete
7. Add loading states and error handling
8. Add optimistic updates for mutations
Verification:
- List patients paginated and sorted
- Create patient shows in list immediately
- Edit patient updates correctly
- Delete soft-deletes and filters from list
- RLS prevents cross-org access
- Search by name works
```

### T102: Patient Search with Meilisearch
```
Goal: Instant patient search by name, phone, email, diagnosis
Dependencies: T013, T101
Files needed:
- apps/web/components/patients/patient-search.tsx — search UI
- apps/web/lib/supabase/queries/search.ts — search query
Tasks:
1. Create search input component with instant results
2. Index patients in Meilisearch on create/update
3. Search by: first_name, last_name, phone, email, diagnosis_codes
4. Show search results as dropdown with patient card
5. Navigate to patient on selection
Verification:
- Typing name shows results <100ms
- Typo tolerance works (e.g., "Jon" finds "John")
- Search by diagnosis code works
- Navigation to patient page on selection
```

### T103: Patient Dashboard
```
Goal: Patient detail page with timeline, key metrics, quick actions
Dependencies: T101
Files needed:
- apps/web/app/(dashboard)/patients/[id]/page.tsx — enhanced detail
- apps/web/components/patients/patient-timeline.tsx — visit timeline
- apps/web/components/patients/patient-header.tsx — name, status, diagnosis
- apps/web/components/patients/patient-metrics.tsx — key metrics card
Tasks:
1. Build patient header with avatar, status badge, key info
2. Build timeline showing visits, assessments, HEP milestones
3. Show quick metrics (age, diagnosis, visit count, last visit date)
4. Add quick action buttons (Schedule, New Visit, New SOAP, Message)
5. Add AI Insights section (risk score, adherence, suggested next action)
Verification:
- Patient header shows all key info
- Timeline chronological with color-coded events
- Quick actions navigate correctly
- AI Insights panel shows relevant info
```

### T104: Visit Management
```
Goal: Visit tracking with status workflow and notes
Dependencies: T101, T005
Files needed:
- apps/web/app/(dashboard)/patients/[id]/page.tsx — visit list in timeline
- apps/web/components/visits/visit-card.tsx
- apps/web/components/forms/visit-form.tsx
- apps/web/app/(dashboard)/visits/[id]/page.tsx — visit detail page
- apps/web/lib/supabase/queries/visits.ts
- apps/web/app/_actions/visits.ts
Tasks:
1. Create visit schema queries
2. Build visit creation form (type, status, duration, billing code)
3. Build visit status workflow (scheduled → checked_in → in_progress → completed)
4. Show visits in patient timeline
5. Build visit detail page linking to SOAP, assessments
Verification:
- Create visit with all fields
- Status transitions work correctly
- Visit number auto-increment per patient
- Visit appears in timeline
- Visit links to associated SOAP note
```

### T105: SOAP Note Editor
```
Goal: Rich text SOAP note editor with structured sections
Dependencies: T104, T013
Files needed:
- apps/web/app/(dashboard)/soap/new/[visitId]/page.tsx
- apps/web/app/(dashboard)/soap/[id]/page.tsx
- apps/web/components/soap/soap-editor.tsx — TipTap editor
- apps/web/components/soap/soap-section.tsx — reusable section
- apps/web/components/soap/soap-viewer.tsx — read-only view
- apps/web/lib/supabase/queries/soap.ts
- apps/web/app/_actions/soap.ts
Tasks:
1. Create TipTap editor with custom SOAP sections (S, O, A, P)
2. Each section is a TipTap node with structured subfields
3. Create save draft auto-save (debounced)
4. Create read-only viewer for signed notes
5. Create server actions for create, update, sign
6. Add voice-to-text button (Whisper integration)
Verification:
- TipTap editor renders with 4 sections
- Auto-save works (no data loss on browser crash)
- Voice input populates text
- Signing changes status and prevents further edits
- View mode vs edit mode correctly toggled
```

### T106: SOAP Note PDF Export
```
Goal: Export SOAP notes as professional PDF
Dependencies: T105
Files needed:
- apps/web/lib/pdf/soap-note-pdf.tsx — PDF template
- apps/web/components/soap/soap-pdf-button.tsx
Tasks:
1. Create React-PDF template for SOAP notes
2. Include: header (clinic info), patient info, S/O/A/P sections, clinician signature
3. Add download button to SOAP note view
4. Add print styles for browser printing
Verification:
- PDF generates with correct layout
- All sections populated
- Clinic logo included
- Download works on desktop and mobile
```

### T107: AI SOAP Note Generation (Basic)
```
Goal: Generate SOAP notes from clinician notes
Dependencies: T105
Files needed:
- packages/ai/soap-generator/index.ts — AI generation logic
- packages/ai/soap-generator/prompts/system.md — system prompt
- packages/ai/soap-generator/prompts/initial-eval.md — initial eval prompt
- packages/ai/soap-generator/prompts/follow-up.md — follow-up prompt
- apps/web/components/soap/ai-soap-generator.tsx — UI integration
- apps/web/app/api/ai/soap/generate/route.ts — API route
Tasks:
1. Create system prompts for SOAP generation (SOAP structure, clinical language)
2. Create initial eval prompt template
3. Create follow-up prompt template
4. Build API route that accepts notes + structured data → OpenAI
5. Build UI button "Generate SOAP" that populates editor
6. Add loading state, error handling, retry
Verification:
- Click "Generate SOAP" populates all 4 sections
- Clinical language is professional
- Structured data (ROM, strength) appears in Objective
- Generated text is editable
- Error state shows helpful message
```

### T108: Voice-to-Text (Whisper)
```
Goal: Voice dictation for SOAP notes
Dependencies: T105
Files needed:
- apps/web/lib/ai/whisper.ts — Whisper API client
- apps/web/hooks/use-voice-recording.ts — recording hook
- apps/web/components/soap/voice-recorder.tsx — UI component
Tasks:
1. Create browser audio recording hook (MediaRecorder API)
2. Send recorded audio to OpenAI Whisper API
3. Insert transcribed text into active SOAP section
4. Add microphone button to each SOAP section
5. Show recording state (recording, processing, error)
Verification:
- Audio recording starts/stops correctly
- Transcription appears in correct section
- Supports pauses in dictation
- Error handling for silent audio, long audio
```

### T109: SOAP Note Signing Workflow
```
Goal: Signature workflow for SOAP notes with audit trail
Dependencies: T105
Files needed:
- apps/web/components/soap/soap-signature.tsx
- apps/web/app/_actions/soap-sign.ts
- apps/web/lib/supabase/queries/audit.ts
Tasks:
1. Create sign dialog with confirmation
2. On sign: update status, record timestamp and signer ID
3. Create audit log entry for signing
4. Add signed note view (locked, read-only with signature block)
5. Add amendment workflow (create amended copy)
Verification:
- Signing locks note from editing
- Audit log captures who signed and when
- Signed note shows signature block
- Amendment creates new version
```

### T110: Audit Logging System
```
Goal: Comprehensive audit logging for all clinical data access
Dependencies: T004
Files needed:
- packages/database/prisma/schema.prisma — AuditLog model
- apps/web/lib/audit.ts — audit helper
- apps/web/lib/supabase/rls/audit-policies.sql
Tasks:
1. Implement audit log triggers for key tables (patients, soap_notes, visits)
2. Create audit helper function for manual logging
3. Log: create, update, delete, sign, view (PHI access)
4. Build audit log viewer for admin
5. Set retention policy (90 days online, 7 years archived)
Verification:
- Patient create logged
- SOAP sign logged
- Admin can view audit logs
- Retention policy enforced
- Audit logs are append-only (no deletes)
```

### T111: Patient Tagging System
```
Goal: Flexible tagging system for patient organization
Dependencies: T101
Files needed:
- apps/web/components/patients/patient-tags.tsx
- apps/web/lib/supabase/queries/tags.ts
- apps/web/app/_actions/tags.ts
Tasks:
1. Add tags field to patient schema (already present)
2. Build tag input component (create, search, select)
3. Add tag filters to patient list
4. Build tag management UI (rename, merge, delete)
5. Color-code tags (priority: red, insurance: blue, etc.)
Verification:
- Create new tag inline
- Filter patients by tag
- Tags persist on patient edit
- Tag management works
```

### T112: Patient Deduplication
```
Goal: Prevent duplicate patient records
Dependencies: T101
Files needed:
- apps/web/app/_actions/patients.ts (enhanced with dedup)
- packages/database/rls/dedup-policies.sql
Tasks:
1. Check for existing patient on create (name + DOB + phone match)
2. Show potential duplicates UI
3. Merge patient records option
4. Link duplicate records
Verification:
- Creating patient with existing name+DOB shows duplicates
- Merge combines records
- Audit log captures merge
```

### T113: Clinic Management
```
Goal: Multi-clinic management within organizations
Dependencies: T006
Files needed:
- apps/web/app/(dashboard)/settings/clinic/page.tsx
- apps/web/components/forms/clinic-form.tsx
- apps/web/lib/supabase/queries/clinics.ts
Tasks:
1. Build clinic settings page
2. Clinic CRUD (name, address, phone, timezone)
3. Assign clinicians to clinics
4. Clinic-specific branding (logo, colors)
Verification:
- Create clinic works
- Assign clinician to clinic
- Clinic settings persist
- Multi-clinic org can switch between clinics
```

### T114: Patient Intake Forms
```
Goal: Digital intake forms for new patients
Dependencies: T101
Files needed:
- apps/web/app/(dashboard)/patients/intake/page.tsx
- apps/web/components/forms/intake-form.tsx
- apps/web/lib/supabase/queries/intake.ts
Tasks:
1. Create intake form template (demographics, history, consent)
2. Build form builder for custom intake fields
3. Create patient portal link for self-service intake
4. Map intake responses to patient fields
Verification:
- Intake form renders with all sections
- Custom fields can be added
- Responses map to patient record
- Portal link works for patient self-service
```

### T115: Patient Flags & Alerts
```
Goal: Flag system for important patient information
Dependencies: T101
Files needed:
- apps/web/components/patients/patient-flags.tsx
- apps/web/components/patients/alert-banner.tsx
- apps/web/lib/supabase/queries/flags.ts
Tasks:
1. Create flag types (allergy, fall_risk, language_barrier, billing_issue, etc.)
2. Build flag management UI (add, dismiss, snooze)
3. Show active flags in patient header and patient list
4. Auto-generate flags from AI assessment interpretation
Verification:
- Flags appear on patient detail
- Flag types configurable
- Dismissed flags don't appear
- Auto-flags from AI
```

### T116: Appointment Quick Actions from Patient
```
Goal: Quick schedule, reschedule, cancel from patient page
Dependencies: T101, T201 (scheduling)
Files needed:
- apps/web/app/(dashboard)/patients/[id]/page.tsx — enhanced with appointment actions
- apps/web/components/patients/quick-schedule.tsx
Tasks:
1. Add "Schedule Appointment" button on patient page
2. Add "Reschedule" and "Cancel" on upcoming appointments
3. Pre-fill patient info when scheduling from patient page
4. Show upcoming appointments in patient header
Verification:
- Schedule from patient page works
- Pre-filled correctly
- Upcoming appointments visible
```

### T117: Referral Tracking
```
Goal: Track patient referrals (from/to other clinicians)
Dependencies: T101
Files needed:
- apps/web/app/(dashboard)/patients/[id]/referrals/page.tsx
- apps/web/components/patients/referral-card.tsx
- apps/web/lib/supabase/queries/referrals.ts
Tasks:
1. Add referring_clinician_id to patient (in schema)
2. Build referral creation form (to clinician, reason, status)
3. Show referral history on patient page
4. Add referral status tracking (sent, accepted, completed, declined)
Verification:
- Referral created with all fields
- Referral status tracked
- Referring clinician sees referral status
- Referral appears in patient timeline
```

### T118: Emergency Contact Management
```
Goal: Emergency contacts for patients
Dependencies: T101
Files needed:
- apps/web/components/patients/emergency-contact.tsx
- apps/web/components/forms/emergency-contact-form.tsx
Tasks:
1. Build emergency contact display (patient detail)
2. Build emergency contact form (name, relationship, phone)
3. Add multiple contacts per patient
4. Show emergency contact prominently
Verification:
- Add/edit/remove emergency contacts
- Multiple contacts per patient
- Contact shows in patient header
```

### T119: Patient Quick Stats
```
Goal: Quick statistics dashboard per patient
Dependencies: T101
Files needed:
- apps/web/components/patients/patient-stats.tsx
Tasks:
1. Show: total visits, last visit date, upcoming appointments, pending assessments, active HEPs, outstanding balance
2. Show compliance rate for active HEP
3. Show outcome measure trend (last 3 scores)
Verification:
- All stats accurate
- HEP compliance shown
- Outcome trend shown
```

### T120: Patient Export
```
Goal: Export patient data as PDF or CSV
Dependencies: T101
Files needed:
- apps/web/lib/pdf/patient-summary-pdf.tsx
- apps/web/lib/csv/patient-export.ts
- apps/web/components/patients/export-button.tsx
Tasks:
1. Create patient summary PDF (demographics, diagnosis, visit history)
2. Create CSV export of patient list with selected columns
3. Add HIPAA-compliant watermark on export
Verification:
- PDF generates with all patient info
- CSV exports selected columns
- Watermark present on exports
- Download works
```

### T121: Patient Merging
```
Goal: Merge duplicate patient records
Dependencies: T112
Files needed:
- apps/web/components/patients/merge-patients.tsx
- apps/web/app/_actions/merge-patients.ts
Tasks:
1. Create merge UI: select primary record, select duplicate
2. Field-by-field conflict resolution
3. Re-link all related records (visits, assessments, HEPs, invoices)
4. Archive merged duplicate
5. Audit log merge operation
Verification:
- Merge combines all fields correctly
- Related records re-linked
- Duplicate archived (not deleted)
- Audit log captures merge with before/after
```

### T122: Patient Communication Preferences
```
Goal: Patient communication preference management
Dependencies: T101
Files needed:
- apps/web/components/patients/communication-preferences.tsx
- apps/web/lib/supabase/queries/communication.ts
Tasks:
1. Add communication preferences to patient settings
2. Channels: email, SMS, push, phone, mail
3. Topics: appointments, billing, exercises, marketing
4. Frequency: immediate, daily_digest, weekly, never
Verification:
- Preferences save correctly
- Compliance controls applied
- Channel preferences reflected in messaging
```

### T123: Patient Billing History View
```
Goal: View patient billing history from patient detail
Dependencies: T101, T601 (billing)
Files needed:
- apps/web/app/(dashboard)/patients/[id]/billing/page.tsx
- apps/web/components/billing/patient-billing-history.tsx
Tasks:
1. Show patient invoices in table
2. Show payment history
3. Show outstanding balance
4. Quick invoice creation from patient page
Verification:
- Invoice list visible from patient detail
- Payment history accurate
- Balance shown
- Quick invoice creation pre-fills patient
```

### T124: Patient Activity Log
```
Goal: Log of all actions taken on a patient record
Dependencies: T110, T101
Files needed:
- apps/web/components/patients/activity-log.tsx
Tasks:
1. Show chronological log of all actions on this patient
2. Filterable by action type (visit, assessment, message, billing)
3. Show who performed the action and when
4. Link to the related record
Verification:
- All actions shown in log
- Filters work
- Links navigate to related records
```

### T125: Global Search (Cmd+K)
```
Goal: Global search across all resource types
Dependencies: T013, T102
Files needed:
- apps/web/components/layout/command-palette.tsx — enhanced
- apps/web/lib/search/global-search.ts
Tasks:
1. Enhance command palette to search patients and exercises
2. Add keyboard shortcut Ctrl+Shift+F for direct search
3. Search across: patients, exercises, assessments, protocols
4. Show result categories with icons
5. Keyboard navigation through results (arrow keys)
Verification:
- Search across all types
- Results grouped by category
- Keyboard navigation works
- Selection navigates to detail page
```

---

## Phase 2: Assessment Engine (Weeks 8-11) — 18 Tasks

(Detailed task list continues for all phases. Due to document length, remaining tasks are abbreviated.)

### T201: Assessment Catalog Page
```
Goal: Browse, search, and filter assessment library
Dependencies: T016
Files:
- apps/web/app/(dashboard)/assessments/page.tsx
- apps/web/components/assessments/assessment-card.tsx
- apps/web/lib/supabase/queries/assessments.ts
Tasks:
1. Build assessment catalog grid/list view
2. Filter by category, body region, condition
3. Search by name
4. Show key info: duration, equipment, MCID, body region
5. Favorite/bookmark assessments
```

### T202: Assessment Detail + Administer
```
Goal: View assessment details and administer to patients
Dependencies: T201
Files:
- apps/web/app/(dashboard)/assessments/[id]/page.tsx
- apps/web/components/assessments/assessment-runner.tsx
- apps/web/components/assessments/score-display.tsx
Tasks:
1. Show assessment description, instructions, scoring
2. Build assessment admin UI (question runner with progress)
3. Auto-calculate score on completion
4. Show normative data comparison
5. Save results to patient_assessments
```

### T203: Assessment Builder
```
Goal: Create custom assessments
Dependencies: T201
Files:
- apps/web/app/(dashboard)/assessments/new/page.tsx
- apps/web/components/assessments/assessment-builder.tsx
- apps/web/components/assessments/question-editor.tsx
Tasks:
1. Build assessment creation form
2. Add question types: numeric, scale, multiple choice, text, timed
3. Set scoring rules (weighted, summed, averaged)
4. Preview assessment before saving
5. Add to library (org-specific or system-wide)
```

### T204: Assessment Results Visualization
```
Goal: Charts and visualizations of assessment results over time
Dependencies: T202
Files:
- apps/web/components/assessments/assessment-chart.tsx
- apps/web/components/assessments/assessment-trend.tsx
Tasks:
1. Build line chart of score over time
2. Show MCID threshold line on chart
3. Show normative data range
4. Compare multiple assessments on same chart
5. Export chart as image
```

### T205: AI Assessment Interpretation
```
Goal: AI interpretation of assessment results
Dependencies: T202, AI package
Files:
- packages/ai/assessment-engine/interpretation.ts
- apps/web/components/assessments/ai-interpretation.tsx
- apps/web/app/api/ai/assess/interpret/route.ts
Tasks:
1. Build interpretation prompt with score, norms, history
2. Generate clinical interpretation paragraph
3. Flag clinically significant changes (MCID-based)
4. Suggest follow-up actions
5. Show confidence level of interpretation
```

### T206: Outcome Measure Dashboard
```
Goal: Track outcome measures across patients
Dependencies: T204
Files:
- apps/web/app/(dashboard)/analytics/outcomes/page.tsx
Tasks:
1. Show outcome measure completion rate
2. Show average improvement by diagnosis
3. Show outcome trends by clinician
4. Filter by date range, diagnosis, clinician
5. Export outcome data as CSV
```

### T207: Assessment Protocols
```
Goal: Link assessments to clinical protocols
Dependencies: T401 (protocols)
Files:
- apps/web/components/protocols/assessment-linking.tsx
Tasks:
1. Link assessments to protocol phases
2. Auto-suggest assessment when assigning protocol
3. Show expected outcomes per phase
```

### T208: Special Tests Library
```
Goal: Catalog of orthopedic special tests
Dependencies: T201
Files:
- packages/database/seeds/special-tests.ts
- apps/web/app/(dashboard)/assessments/special-tests/page.tsx
Tasks:
1. Seed common orthopedic special tests (Lachman, Drop Arm, Empty Can, etc.)
2. Build special test catalog with video/images
3. Show sensitivity/specificity data
4. Link to diagnosis differentiation
```

### T209: Functional Tests Library
```
Goal: Catalog of functional performance tests
Dependencies: T201
Files:
- packages/database/seeds/functional-tests.ts
- apps/web/app/(dashboard)/assessments/functional/page.tsx
Tasks:
1. Seed functional tests (Sit-to-Stand, Step-Down, Single-leg Stance, etc.)
2. Include normative data by age/gender
3. Show video demonstrations
4. Link to relevant diagnoses
```

### T210: Pain Diagram Tool
```
Goal: Interactive body diagram for pain mapping
Dependencies: T101
Files:
- apps/web/components/assessments/pain-diagram.tsx
Tasks:
1. Build interactive body diagram (front/back/side views)
2. Allow clinician to mark pain locations
3. Record pain type (aching, sharp, burning, tingling)
4. Show pain map on assessment results
5. Compare pain maps over time
```

### T211: Range of Motion Visualizer
```
Goal: Visual ROM measurement tool
Dependencies: T105 (SOAP)
Files:
- apps/web/components/soap/rom-visualizer.tsx
Tasks:
1. Build ROM input UI with body diagram overlay
2. Show normal ROM ranges for comparison
3. Graph ROM progression over visits
4. Side-by-side left vs right comparison
```

### T212: Manual Muscle Testing Interface
```
Goal: MMT grading interface for strength testing
Dependencies: T105
Files:
- apps/web/components/soap/mmt-interface.tsx
Tasks:
1. Build MMT grading form (0-5 scale with descriptions)
2. Muscle group selector with diagram
3. Side-by-side left/right comparison
4. Show strength progression chart
5. Pre-populate commonly tested groups per diagnosis
```

### T213: Gait Analysis Tool
```
Goal: Gait observation documentation tool
Dependencies: T105
Files:
- apps/web/components/soap/gait-analysis.tsx
Tasks:
1. Build gait phase checklist (stance, swing)
2. Common gait deviations selector
3. Video recording option
4. Assistive device documentation
5. Gait summary generation
```

### T214: Balance Assessment Tools
```
Goal: Balance assessment tools (Berg, TUG, Functional Reach)
Dependencies: T201
Files:
- apps/web/components/assessments/balance-tools.tsx
Tasks:
1. Build Berg Balance Test interface (14 items)
2. Build Timed Up and Go interface with timer
3. Build Functional Reach test
4. Show normative data by age
5. Fall risk assessment summary
```

### T215: Assessment Scheduling
```
Goal: Schedule re-assessments for outcome tracking
Dependencies: T202
Files:
- apps/web/components/assessments/assessment-scheduler.tsx
Tasks:
1. Schedule follow-up assessment at set interval
2. Send reminder to clinician when due
3. Track overdue assessments
4. Auto-open assessment on appointment check-in
```

### T216: Assessment Results Export
```
Goal: Export assessment results as PDF
Dependencies: T202
Files:
- apps/web/lib/pdf/assessment-results-pdf.tsx
Tasks:
1. Create PDF template with assessment results
2. Include score, normative comparison, interpretation
3. Include trend chart if multiple assessments
4. HIPAA-compliant header
```

### T217: Assessment Templates
```
Goal: Save and apply assessment templates
Dependencies: T203
Files:
- apps/web/components/assessments/assessment-template.tsx
Tasks:
1. Save assessment configuration as template
2. Apply template to new patient
3. Share templates within organization
4. Template categories (knee, shoulder, spine, neuro)
```

### T218: Automated Outcome Scoring
```
Goal: Auto-calculate scores from assessment responses
Dependencies: T202
Files:
- packages/ai/assessment-engine/scoring.ts
Tasks:
1. Implement scoring formulas for all standardized assessments
2. Handing reverse-scored questions
3. Calculate sub-scores
4. Compare to MCID
5. Flag incomplete assessments
```

---

## Phase 3: Exercise Library & HEP (Weeks 12-15) — 22 Tasks

### T301: Exercise Catalog Grid
```
Goal: Browse, search, filter exercise library with video thumbnails
Dependencies: T014, T015, T013
Files:
- apps/web/app/(dashboard)/exercises/page.tsx
- apps/web/components/exercises/exercise-card.tsx
- apps/web/components/exercises/exercise-filter.tsx
Tasks:
1. Build exercise grid with video/image thumbnails
2. Filter by: body region, category, difficulty, equipment
3. Search by name, muscle, condition
4. Sort by name, difficulty, popularity
```

### T302: Exercise Detail Page
```
Goal: Full exercise detail with video, instructions, parameters
Dependencies: T301
Files:
- apps/web/app/(dashboard)/exercises/[id]/page.tsx
- apps/web/components/exercises/exercise-player.tsx
Tasks:
1. Show exercise video/image with controls
2. Show step-by-step instructions
3. Show parameter presets (sets, reps, hold time)
4. Show contraindications, precautions
5. Show targeted muscles diagram
6. Quick-add to clipboard to use in HEP
```

### T303: Exercise Video Management
```
Goal: Upload, transcode, and manage exercise videos
Dependencies: T018 (storage)
Files:
- apps/web/app/(dashboard)/exercises/new/page.tsx
- apps/web/components/exercises/video-uploader.tsx
- apps/web/components/exercises/video-editor.tsx
Tasks:
1. Build video upload with progress indicator
2. Transcode to multiple resolutions
3. Generate thumbnail from video
4. Add caption overlay for instructions
5. Manage video versions
```

### T304: HEP Builder
```
Goal: Build home exercise programs with drag-and-drop
Dependencies: T301
Files:
- apps/web/app/(dashboard)/hep/new/page.tsx
- apps/web/components/hep/hep-builder.tsx
- apps/web/components/hep/exercise-picker.tsx
- apps/web/components/hep/program-preview.tsx
Tasks:
1. Search and pick exercises from library
2. Drag-and-drop to reorder
3. Set parameters per exercise (sets, reps, hold, frequency)
4. Add custom notes per exercise
5. Preview program as patient will see it
6. Save as draft or publish
```

### T305: HEP PDF Export
```
Goal: Export HEP as patient-friendly PDF
Dependencies: T304
Files:
- apps/web/lib/pdf/hep-export.tsx
Tasks:
1. Create PDF with exercise images, instructions, parameters
2. Include program schedule table
3. Add QR code for mobile app access
4. Print-friendly layout
5. Include clinic branding
```

### T306: AI Exercise Recommendation
```
Goal: AI recommends exercises based on diagnosis and phase
Dependencies: T301, AI package
Files:
- packages/ai/exercise-generator/recommendation.ts
- apps/web/components/hep/ai-exercise-recommender.tsx
- apps/web/app/api/ai/exercises/recommend/route.ts
Tasks:
1. Build recommendation prompt with patient context
2. Query knowledge graph for indicated exercises
3. Filter by phase, contraindications, equipment
4. Generate dosage parameters
5. Suggest progression criteria
6. Show evidence level for each recommendation
```

### T307: AI HEP Generation
```
Goal: Generate complete HEP from diagnosis + phase
Dependencies: T306
Files:
- packages/ai/exercise-generator/hep-generator.ts
- apps/web/components/hep/ai-hep-generator.tsx
- apps/web/app/api/ai/hep/generate/route.ts
Tasks:
1. Build HEP generation prompt with patient profile
2. Generate: exercise list, parameters, frequency, duration
3. Include warm-up and cool-down
4. Set progression schedule
5. Generate patient education text
```

### T308: AI Progression Engine
```
Goal: Suggest exercise progression based on compliance + outcomes
Dependencies: T307
Files:
- packages/ai/progression-engine/index.ts
- apps/web/app/api/ai/hep/progress/route.ts
Tasks:
1. Analyze compliance data
2. Analyze outcome measure trends
3. Suggest exercise progression (harder variations, increased load)
4. Suggest substitution (if exercise not working)
5. Flag when to advance phase
```

### T309: HEP Compliance Tracking
```
Goal: Track patient HEP compliance
Dependencies: T304, T403 (mobile)
Files:
- apps/web/app/(dashboard)/hep/[id]/compliance/page.tsx
- apps/web/components/hep/compliance-chart.tsx
Tasks:
1. Show daily compliance chart
2. Show per-exercise completion rate
3. Show trend over time
4. Flag non-compliant periods
5. AI insights on non-compliance patterns
```

### T310: Exercise Library Import/Export
```
Goal: Import/export exercise library
Dependencies: T301
Files:
- apps/web/app/(dashboard)/exercises/import/page.tsx
- apps/web/lib/exercises/import.ts
Tasks:
1. CSV/JSON import of exercises
2. Validate imported data
3. Handle duplicate detection
4. Export library as JSON
```

### T311: Exercise Categories Management
```
Goal: Manage exercise categories and taxonomy
Dependencies: T301
Files:
- apps/web/app/(dashboard)/exercises/categories/page.tsx
Tasks:
1. CRUD for categories and subcategories
2. Drag-and-drop reordering
3. Assign exercises to categories in bulk
4. View exercises by category
```

### T312: Custom Exercise Creation
```
Goal: Create custom exercises (clinic-specific)
Dependencies: T301
Files:
- apps/web/app/(dashboard)/exercises/new/page.tsx
- apps/web/components/forms/exercise-form.tsx
Tasks:
1. Build exercise creation form with all fields
2. Add video/image upload
3. Set parameter presets
4. Add to clinic library
5. Publish to organization
```

### T313: Exercise Clipboard
```
Goal: Temporary exercise collection for quick HEP building
Dependencies: T301
Files:
- apps/web/components/exercises/exercise-clipboard.tsx
Tasks:
1. Click to add exercises to clipboard
2. Show clipboard count in header
3. Open clipboard as sidebar
4. Create HEP from clipboard items
```

### T314: HEP Templates
```
Goal: Save HEP configurations as reusable templates
Dependencies: T304
Files:
- apps/web/components/hep/hep-template.tsx
Tasks:
1. Save HEP as template
2. Apply template to patient
3. Template categories by diagnosis/phase
4. Share templates in org
```

### T315: HEP Phase Viewer
```
Goal: View HEP phases and progression timeline
Dependencies: T304
Files:
- apps/web/components/hep/phase-viewer.tsx
Tasks:
1. Show HEP phases as timeline
2. Show criteria to advance
3. Current phase highlighted
4. Auto-suggest progression when criteria met
```

### T316: Exercise Video Player (Patient View)
```
Goal: Patient-friendly exercise video player
Dependencies: T302
Files:
- apps/web/components/exercises/patient-exercise-player.tsx
Tasks:
1. Full-screen video player
2. Show instructions alongside video
3. Timer for holds and rests
4. Completion logging button
5. Auto-advance to next exercise in program
```

### T317: Exercise Substitution Suggestions
```
Goal: Suggest alternative exercises when patient can't perform
Dependencies: T306
Files:
- packages/ai/exercise-generator/substitutions.ts
Tasks:
1. Analyze why patient can't perform (pain, difficulty, equipment)
2. Query knowledge graph for substitutions
3. Suggest similar-difficulty alternatives
4. Adjust parameters for modified version
```

### T318: HEP Sharing (Patient Portal)
```
Goal: Share HEP via link or patient portal
Dependencies: T304, T403
Files:
- apps/web/components/hep/hep-share.tsx
Tasks:
1. Generate shareable link
2. Email HEP to patient
3. QR code for mobile app
4. SMS link to download app
```

### T319: Exercise Library Analytics
```
Goal: Analytics on exercise usage and outcomes
Dependencies: T301
Files:
- apps/web/app/(dashboard)/analytics/exercises/page.tsx
Tasks:
1. Most prescribed exercises
2. Exercise completion rates
3. Outcome improvement by exercise
4. Exercise combinations that work best
```

### T320: Equipment Management
```
Goal: Track clinic exercise equipment inventory
Dependencies: T301
Files:
- apps/web/app/(dashboard)/settings/equipment/page.tsx
Tasks:
1. Equipment catalog (therabands, weights, etc.)
2. Track equipment availability
3. Filter exercises by available equipment
4. Equipment maintenance tracking
```

### T321: HEP Reminder System
```
Goal: Automated reminders for HEP completion
Dependencies: T304
Files:
- packages/notification/hep-reminders.ts
Tasks:
1. Schedule daily reminders at patient's preferred time
2. Send via push (mobile), SMS, or email
3. Escalate if non-compliant for 3+ days
4. Clinician alert for chronic non-compliance
```

### T322: Exercise Safety Check
```
Goal: Contraindication and safety checking before assigning exercises
Dependencies: T309
Files:
- packages/knowledge-graph/safety-check.ts
- apps/web/components/hep/safety-check.tsx
Tasks:
1. Check exercise contraindications against patient diagnosis
2. Flag exercises that require supervision
3. Check for equipment conflicts
4. Show safety warnings in HEP builder
```

---

## Phase 4: Scheduling & Telehealth (Weeks 16-18) — 15 Tasks

### T401: Cal.diy Integration
```
Goal: Integrate Cal.diy scheduling engine
Dependencies: T007
Files:
- packages/api/scheduling/cal-integration.ts
- apps/web/lib/scheduling/client.ts
Tasks:
1. Deploy Cal.diy instance
2. Set up API authentication
3. Create event types mapping to appointment types
4. Set up webhook sync (Cal.diy → our DB)
5. Handle availability syncing
```

### T402: Appointment Calendar
```
Goal: Full-featured calendar view for appointments
Dependencies: T401
Files:
- apps/web/app/(dashboard)/schedule/page.tsx
- apps/web/components/scheduling/calendar-view.tsx
- apps/web/components/scheduling/appointment-card.tsx
Tasks:
1. Build Schedule-X calendar with day/week/month views
2. Drag-and-drop rescheduling
3. Color-coded by appointment type
4. Show clinician availability overlay
5. Click to view/edit appointment details
```

### T403: Appointment Booking Flow
```
Goal: Book new appointments with availability check
Dependencies: T402
Files:
- apps/web/components/scheduling/book-appointment.tsx
- apps/web/components/scheduling/availability-picker.tsx
Tasks:
1. Select patient, clinician, date
2. Show available time slots
3. Select appointment type
4. Confirmation with send to patient
5. Add to patient's appointment list
```

### T404: Appointment Status Workflow
```
Goal: Appointment status management
Dependencies: T402
Files:
- apps/web/app/(dashboard)/schedule/appointments/[id]/page.tsx
- apps/web/app/_actions/appointments.ts
Tasks:
1. Status workflow: scheduled → confirmed → checked_in → in_progress → completed
2. Handle cancellations (reason, notification)
3. Handle no-shows
4. Handle rescheduling
5. Waitlist management
```

### T405: Automated Appointment Reminders
```
Goal: Send appointment reminders via email, SMS, push
Dependencies: T404
Files:
- packages/notification/appointment-reminders.ts
Tasks:
1. Send reminder 24h before appointment
2. Send reminder 1h before (for telehealth)
3. Confirmation request (text-to-confirm)
4. Cancellation notification
5. Follow-up after visit (rate experience)
```

### T406: Jitsi Telehealth Setup
```
Goal: Deploy and integrate Jitsi for video consultations
Dependencies: T403
Files:
- packages/api/telehealth/jitsi-service.ts
- apps/web/components/telehealth/video-room.tsx
- apps/web/app/(dashboard)/telehealth/room/[id]/page.tsx
Tasks:
1. Deploy Jitsi server (or use JaaS)
2. Create room per appointment (JWT-authenticated)
3. Build video room UI with controls
4. Handle join/leave events
5. Integrate with appointment flow
```

### T407: Telehealth Session Management
```
Goal: Manage telehealth sessions
Dependencies: T406
Files:
- apps/web/app/(dashboard)/telehealth/page.tsx
- apps/web/components/telehealth/session-list.tsx
Tasks:
1. Show upcoming telehealth sessions
2. Start session button (creates Jitsi room)
3. Session status tracking
4. Session recording management
5. Quality metrics dashboard
```

### T408: Secure Messaging
```
Goal: Patient-clinician secure messaging
Dependencies: T005
Files:
- apps/web/app/(dashboard)/messages/page.tsx
- apps/web/app/(dashboard)/messages/[id]/page.tsx
- apps/web/components/messaging/conversation-list.tsx
- apps/web/components/messaging/message-thread.tsx
- apps/web/app/_actions/messages.ts
Tasks:
1. Build conversation list with last message preview
2. Build message thread with real-time updates
3. Send text, images, documents
4. Typing indicator
5. Read receipts
6. Message search
```

### T409: Real-time Messaging with Supabase Realtime
```
Goal: Real-time message delivery via WebSockets
Dependencies: T408
Files:
- apps/web/hooks/use-realtime-messages.ts
Tasks:
1. Subscribe to conversation channel
2. Optimistic message sending
3. Handle offline queue
4. Show delivery status (sending, sent, delivered, read)
5. Push notification for new messages
```

### T410: Conversation Management
```
Goal: Manage conversations (archive, mute, report)
Dependencies: T408
Files:
- apps/web/components/messaging/conversation-settings.tsx
Tasks:
1. Archive conversation
2. Mute notifications per conversation
3. Report inappropriate message
4. Block user (clinician only)
5. Conversation participants management
```

### T411: Appointment Scheduling API
```
Goal: External booking API for patient self-scheduling
Dependencies: T401
Files:
- apps/web/app/api/v1/appointments/route.ts
- packages/api/scheduling/patient-booking.ts
Tasks:
1. Create public API for appointment booking
2. Validate patient identity via token
3. Show available slots
4. Book appointment
5. Cancel/reschedule
```

### T412: Working Hours Management
```
Goal: Set and manage clinician working hours
Dependencies: T401
Files:
- apps/web/app/(dashboard)/settings/availability/page.tsx
- apps/web/components/scheduling/working-hours-editor.tsx
Tasks:
1. Weekly schedule editor with drag hours
2. Set exception days (time off, holidays)
3. Copy schedule to other weeks
4. Set buffer times between appointments
5. Maximum appointments per day
```

### T413: Group Appointment Support
```
Goal: Support group therapy sessions
Dependencies: T402
Files:
- apps/web/components/scheduling/group-appointment.tsx
Tasks:
1. Create group appointment with multiple patients
2. Show all patients in appointment view
3. Check-in all patients
4. Group SOAP note
5. Bill per patient
```

### T414: Calendar Sync (Google/Outlook)
```
Goal: Two-way calendar sync with external calendars
Dependencies: T401
Files:
- packages/api/scheduling/calendar-sync.ts
- apps/web/app/(dashboard)/settings/calendar-sync/page.tsx
Tasks:
1. Google Calendar OAuth integration
2. Outlook Calendar OAuth integration
3. Sync appointments bidirectionally
4. Handle sync conflicts
5. Show sync status per clinician
```

### T415: Telehealth Recording & Playback
```
Goal: Record and playback telehealth sessions
Dependencies: T406
Files:
- apps/web/components/telehealth/recording-controls.tsx
Tasks:
1. Start/stop recording during session
2. Store recording in Supabase Storage
3. Playback in browser
4. Recording access control (clinician only)
5. Recording retention policy
```

---

## Phase 5: Clinical Decision Support (Weeks 19-21) — 20 Tasks

### T501: Neo4j Knowledge Graph Setup
```
Goal: Deploy Neo4j and build initial knowledge graph
Dependencies: None (infrastructure)
Files:
- packages/knowledge-graph/client.ts
- packages/knowledge-graph/schema/definitions.ts
- packages/knowledge-graph/builders/exercise-entities.ts
- packages/knowledge-graph/builders/diagnosis-entities.ts
Tasks:
1. Deploy Neo4j AuraDB
2. Define entity types and relationship types
3. Create entity indexing
4. Build pipeline to seed exercise entities
5. Build pipeline to seed diagnosis entities (ICD-10)
6. Build pipeline to seed relationship data
```

### T502: Exercise-Diagnosis Relationship Builder
```
Goal: Link exercises to diagnoses with evidence levels
Dependencies: T501
Files:
- packages/knowledge-graph/builders/exercise-diagnosis-rels.ts
Tasks:
1. Build relationship: exercise INDICATED_FOR diagnosis
2. Build relationship: exercise CONTRAINDICATED_FOR diagnosis
3. Add evidence level to each relationship
4. Add source citations
5. Validate relationships against seed data
```

### T503: Assessment-Diagnosis Relationships
```
Goal: Link assessments to diagnoses
Dependencies: T501
Files:
- packages/knowledge-graph/builders/assessment-diagnosis-rels.ts
Tasks:
1. Build relationship: assessment MEASURES outcome
2. Build relationship: assessment DIFFERENTIATES diagnosis
3. Add normative data references
4. Link to MCID values
```

### T504: Protocol-Diagnosis Relationships
```
Goal: Link protocols to diagnoses
Dependencies: T501
Files:
- packages/knowledge-graph/builders/protocol-diagnosis-rels.ts
Tasks:
1. Build relationship: protocol INDICATED_FOR diagnosis
2. Link protocol phases to exercise categories
3. Add evidence level
4. Link to outcome measure targets
```

### T505: GraphRAG Query Engine
```
Goal: Hybrid graph + vector query engine
Dependencies: T501
Files:
- packages/knowledge-graph/queries/exercise-recommendation.cypher
- packages/knowledge-graph/queries/contraindication-check.cypher
- packages/knowledge-graph/queries/diagnosis-differential.cypher
- packages/knowledge-graph/graph-rag.ts
Tasks:
1. Create Cypher query templates
2. Build hybrid retrieval (graph + vector)
3. Create context assembly for LLM
4. Cache frequent queries
5. Fallback to vector-only if graph unavailable
```

### T506: Clinical Question API
```
Goal: Answer clinical questions with RAG
Dependencies: T505
Files:
- packages/ai/clinical-decision-support/question-answering.ts
- apps/web/app/api/ai/clinical/question/route.ts
- apps/web/components/ai/clinical-assistant.tsx
Tasks:
1. Build clinical QA prompt with RAG context
2. Query knowledge graph for relevant entities
3. Query vector store for relevant passages
4. Combine and generate answer with citations
5. Show evidence level and source
6. Feedback mechanism (helpful/not helpful)
```

### T507: Protocol Builder
```
Goal: Build and manage clinical protocols
Dependencies: T504
Files:
- apps/web/app/(dashboard)/protocols/page.tsx
- apps/web/app/(dashboard)/protocols/new/page.tsx
- apps/web/app/(dashboard)/protocols/[id]/page.tsx
- apps/web/components/protocols/protocol-builder.tsx
- apps/web/components/protocols/phase-editor.tsx
Tasks:
1. Build protocol list view
2. Build protocol creation form
3. Build phase editor (add phases, set duration, criteria)
4. Link exercises to each phase
5. Link outcome measure targets per phase
6. Set evidence level and references
```

### T508: Protocol Assignment
```
Goal: Assign protocols to patients with tracking
Dependencies: T507
Files:
- apps/web/app/(dashboard)/patients/[id]/protocols/page.tsx
- apps/web/components/protocols/protocol-assignment.tsx
Tasks:
1. Search and select protocol
2. Customize for patient (modifications)
3. Set start date, track current phase
4. Show protocol timeline with phases
5. Mark criteria met to advance phase
```

### T509: AI Protocol Recommendation
```
Goal: Recommend protocol based on patient diagnosis
Dependencies: T505, T507
Files:
- packages/ai/clinical-decision-support/protocol-recommendation.ts
- apps/web/components/protocols/ai-protocol-recommender.tsx
Tasks:
1. Match patient diagnosis to protocol
2. Consider patient factors (age, comorbidities, surgery type)
3. Recommend protocol with confidence score
4. Show alternatives
```

### T510: Contraindication Checking System
```
Goal: Check exercise contraindications in real-time
Dependencies: T501, T505
Files:
- packages/knowledge-graph/contraindication-check.ts
- apps/web/components/hep/contraindication-warning.tsx
Tasks:
1. Query knowledge graph for contraindications
2. Check patient diagnosis list
3. Check patient comorbidities
4. Check surgical status
5. Show warning with severity level
6. Block assignment if serious contraindication
```

### T511: Drug-Exercise Interaction Check
```
Goal: Check medication interactions with exercise
Dependencies: T501
Files:
- packages/knowledge-graph/drug-exercise-check.ts
Tasks:
1. Map patient medications to exercise considerations
2. Check for: beta-blockers (heart rate response), blood thinners (bruising), etc.
3. Show exercise modifications needed
4. Clinician alert
```

### T512: AI Follow-up Assistant
```
Goal: Generate follow-up plans automatically
Dependencies: T105 (SOAP)
Files:
- packages/ai/follow-up-assistant/index.ts
- apps/web/app/api/ai/follow-up/route.ts
- apps/web/components/soap/ai-follow-up.tsx
Tasks:
1. Analyze current visit SOAP note
2. Generate follow-up plan (timing, goals, expectations)
3. Generate progress note template for next visit
4. Set reminder for follow-up scheduling
```

### T513: Outcome Prediction
```
Goal: Predict patient outcomes based on initial presentation
Dependencies: T205
Files:
- packages/ai/clinical-decision-support/outcome-prediction.ts
Tasks:
1. Analyze initial assessment scores
2. Compare to normative outcomes for diagnosis
3. Predict expected outcome trajectory
4. Flag patients at risk of poor outcome
5. Suggest interventions for at-risk patients
```

### T514: Clinical Reasoning Support
```
Goal: Support clinical reasoning with evidence
Dependencies: T505
Files:
- packages/ai/clinical-decision-support/clinical-reasoning.ts
- apps/web/components/soap/clinical-reasoning-panel.tsx
Tasks:
1. Analyze subjective and objective findings
2. Suggest differential diagnoses
3. Suggest relevant special tests
4. Suggest outcome measures
5. Show evidence for each suggestion
```

### T515: Patient Education Generator
```
Goal: Generate patient education materials
Dependencies: AI package
Files:
- packages/ai/patient-education/index.ts
- apps/web/app/api/ai/patient-education/route.ts
Tasks:
1. Generate condition-specific education (diagnosis, prognosis, treatment plan)
2. Generate exercise instruction handouts
3. Generate post-op precautions
4. Readability-adjusted (grade 6 reading level target)
5. Translate to multiple languages
```

### T516: Knowledge Graph Visualizer
```
Goal: Visual knowledge graph browser
Dependencies: T501
Files:
- apps/web/components/knowledge-graph/graph-visualizer.tsx
- apps/web/app/(dashboard)/admin/knowledge-graph/page.tsx
Tasks:
1. Build graph visualization (D3.js or vis-network)
2. Search nodes by name/type
3. Click to expand relationships
4. Filter by relationship type
5. Show entity details on selection
```

### T517: AI Peer Review
```
Goal: AI review of SOAP notes for completeness
Dependencies: T105
Files:
- packages/ai/clinical-decision-support/peer-review.ts
Tasks:
1. Check SOAP note for missing elements
2. Check for contradictory information
3. Check billing code appropriateness
4. Suggest improvements with evidence
5. Generate completeness score
```

### T518: Clinical Guidelines Integration
```
Goal: Integrate clinical practice guidelines
Dependencies: T501
Files:
- packages/knowledge-graph/guidelines/populate.ts
Tasks:
1. Parse APTA clinical practice guidelines
2. Extract key recommendations
3. Add to knowledge graph
4. Link to diagnoses and treatments
5. Show guideline references in clinical assistant
```

### T519: Red Flag Detection
```
Goal: Detect red flags (serious pathology indicators) in patient intake
Dependencies: T505
Files:
- packages/knowledge-graph/red-flags.ts
- apps/web/components/patients/red-flag-alert.tsx
Tasks:
1. Build red flag rules (cancer, cauda equina, fracture, infection)
2. Check patient presentation against red flags
3. Alert clinician immediately
4. Suggest urgent referral
5. Document red flag check in SOAP
```

### T520: AI Chart Review
```
Goal: Review full patient chart for insights
Dependencies: T505
Files:
- packages/ai/clinical-decision-support/chart-review.ts
- apps/web/components/patients/ai-chart-review.tsx
Tasks:
1. Analyze entire patient record
2. Identify patterns (pain, function, adherence)
3. Flag important findings for clinician
4. Generate summary for new clinicians taking over case
```

---

## Phase 6: Billing & Practice Management (Weeks 22-24) — 15 Tasks

### T601: Invoice Generation
```
Goal: Generate invoices from visits
Dependencies: T104
Files:
- apps/web/app/(dashboard)/billing/page.tsx
- apps/web/app/(dashboard)/billing/new/page.tsx
- apps/web/components/billing/invoice-generator.tsx
- apps/web/lib/supabase/queries/invoices.ts
Tasks:
1. Build invoice creation from visit
2. Auto-populate line items from CPT codes
3. Set pricing per CPT code
4. Calculate subtotal, tax, discount, total
5. Generate unique invoice number per org
6. Invoice status workflow
```

### T602: Payment Processing (Stripe)
```
Goal: Process payments via Stripe
Dependencies: T601
Files:
- apps/web/lib/payments/stripe.ts
- apps/web/app/api/payments/create-payment-intent/route.ts
- apps/web/components/billing/payment-form.tsx
Tasks:
1. Stripe integration (payment intents)
2. Build payment form (card input)
3. Handle payment confirmation
4. Webhook for payment status updates
5. Receipt email via Resend
```

### T603: Payment Processing (Xendit)
```
Goal: Process payments via Xendit for PH market
Dependencies: T601
Files:
- apps/web/lib/payments/xendit.ts
- apps/web/app/api/payments/xendit-webhook/route.ts
Tasks:
1. Xendit integration
2. GCash, Maya payment methods
3. Over-the-counter payment channels
4. Webhook handling for status updates
5. Currency conversion (PHP)
```

### T604: Insurance Claim Preparation
```
Goal: Prepare insurance claim data
Dependencies: T601
Files:
- apps/web/components/billing/insurance-claim.tsx
- packages/api/billing/insurance-claim.ts
Tasks:
1. Collect required claim data (diagnosis codes, CPT, dates)
2. CMS-1500 form data mapping
3. Claim validation
4. Claim submission tracking
5. Claim status management
```

### T605: Revenue Dashboard
```
Goal: Revenue analytics
Dependencies: T602
Files:
- apps/web/app/(dashboard)/analytics/revenue/page.tsx
- apps/web/components/analytics/revenue-chart.tsx
Tasks:
1. Revenue over time (daily, weekly, monthly)
2. Revenue by clinician
3. Revenue by CPT code
4. Payer mix (insurance vs self-pay)
5. Outstanding AR report
```

### T606: Subscription Management
```
Goal: Manage clinic subscriptions
Dependencies: T005
Files:
- apps/web/app/(dashboard)/settings/billing/page.tsx
- apps/web/lib/payments/subscriptions.ts
Tasks:
1. Stripe subscription plans
2. Free tier → paid tier upgrade
3. Subscription status management
4. Usage-based billing (active patients, storage)
5. Invoice for subscription
```

### T607: CPT Code Management
```
Goal: Manage CPT/HCPCS billing codes
Dependencies: T601
Files:
- packages/database/seeds/cpt-codes.ts
- apps/web/app/(dashboard)/settings/billing/codes/page.tsx
Tasks:
1. Seed common PT CPT codes (97161-97164, 97110, 97112, 97116, 97140, 97530, etc.)
2. Set pricing per CPT code per clinic
3. Modifier support (GP, KX, etc.)
4. Code search in billing UI
5. Code bundling rules
```

### T608: Invoice PDF Generation
```
Goal: Professional invoice PDFs
Dependencies: T601
Files:
- apps/web/lib/pdf/invoice-pdf.tsx
Tasks:
1. Create PDF template with clinic branding
2. Include: invoice number, dates, line items, totals
3. Payment terms and instructions
4. Styling consistent with SOAP notes
```

### T609: Payment Reconciliation
```
Goal: Reconcile payments with invoices
Dependencies: T602
Files:
- apps/web/components/billing/reconciliation.tsx
Tasks:
1. Match payments to invoices
2. Handle partial payments
3. Handle overpayments (credit balance)
4. Unreconciled payment report
5. Payment allocation UI
```

### T610: Collections Management
```
Goal: Manage overdue invoices and collections
Dependencies: T609
Files:
- apps/web/app/(dashboard)/billing/collections/page.tsx
Tasks:
1. Overdue invoice report
2. Automated payment reminders (3, 7, 14, 30 days overdue)
3. Late fee application
4. Collections workflow (email → call → escalation)
5. Payment plan setup
```

### T611: Clinician Productivity Dashboard
```
Goal: Track clinician productivity metrics
Dependencies: T104
Files:
- apps/web/app/(dashboard)/analytics/productivity/page.tsx
Tasks:
1. Visits per day/week/month
2. Revenue per clinician
3. Visit duration analysis
4. No-show rate
5. New patient acquisition rate
6. Outcome improvement rate by clinician
```

### T612: Multi-Currency Support
```
Goal: Support multiple currencies (USD, PHP, etc.)
Dependencies: T601
Files:
- packages/api/billing/currency.ts
Tasks:
1. Currency configuration per clinic
2. Exchange rate handling
3. Multi-currency invoices
4. Currency formatting components
```

### T613: Tax Configuration
```
Goal: Tax handling per jurisdiction
Dependencies: T601
Files:
- apps/web/app/(dashboard)/settings/billing/taxes/page.tsx
Tasks:
1. Tax rate configuration per clinic
2. Auto-apply tax based on location
3. Tax exemption handling
4. Tax reporting
```

### T614: Discount & Promotion Management
```
Goal: Manage discounts and promotions
Dependencies: T601
Files:
- apps/web/app/(dashboard)/settings/billing/discounts/page.tsx
Tasks:
1. Discount types (percentage, fixed, free visit)
2. Promo code generation
3. Discount application to invoices
4. Discount reporting
```

### T615: Financial Reports
```
Goal: Financial reporting suite
Dependencies: T609
Files:
- apps/web/app/(dashboard)/analytics/reports/page.tsx
Tasks:
1. Profit & Loss report
2. Accounts Receivable aging
3. Revenue by payer
4. Visit volume trends
5. Export to CSV/PDF
```

---

## Phase 7: Marketplace & Referrals (Weeks 25-26) — 8 Tasks

### T701: Referral Network
```
Goal: Clinician-to-clinician referral network
Dependencies: T005
Files:
- apps/web/app/(dashboard)/referrals/page.tsx
- apps/web/app/(dashboard)/referrals/send/page.tsx
- apps/web/app/(dashboard)/referrals/incoming/page.tsx
- apps/web/lib/supabase/queries/referrals.ts
Tasks:
1. Search clinicians by specialty, location, availability
2. Send referral with patient summary
3. Accept/decline referral workflow
4. Referral status tracking
5. Referral communication thread
```

### T702: Referral Intelligence
```
Goal: AI-powered referral matching
Dependencies: T505, T701
Files:
- packages/ai/referral-intelligence/index.ts
Tasks:
1. Match patient condition to clinician specialty
2. Consider insurance compatibility
3. Consider location/proximity
4. Consider availability (wait time)
5. Suggest top 3 referral options
```

### T703: Exercise Marketplace
```
Goal: Community exercise library marketplace
Dependencies: T301
Files:
- apps/web/app/(dashboard)/marketplace/exercises/page.tsx
- apps/web/lib/marketplace/exercises.ts
Tasks:
1. Publish custom exercises to marketplace
2. Browse community exercises
3. Import exercises from marketplace
4. Rate and review exercises
5. Exercise usage analytics (popular, effective)
```

### T704: Template Marketplace
```
Goal: Protocol and assessment template marketplace
Dependencies: T507, T203
Files:
- apps/web/app/(dashboard)/marketplace/templates/page.tsx
Tasks:
1. Publish protocols and assessment templates
2. Browse community templates
3. Import with customization
4. Template rating system
5. Evidence-level badges
```

### T705: Continuing Education Integration
```
Goal: CEU course recommendations
Dependencies: AI package
Files:
- packages/ai/referral-intelligence/ce-recommendations.tsx
Tasks:
1. Analyze clinician specialization and gaps
2. Recommend relevant CEU courses
3. Partner with CEU providers
4. Track CEU credits
5. License renewal reminders
```

### T706: Referral Analytics
```
Goal: Track referral patterns and network growth
Dependencies: T701
Files:
- apps/web/app/(dashboard)/analytics/referrals/page.tsx
Tasks:
1. Referral volume trends
2. Top referring providers
3. Referral acceptance rate
4. Network growth metrics
5. Referral outcome tracking
```

### T707: Partner Integrations API
```
Goal: Public API for third-party integrations
Dependencies: T005
Files:
- apps/web/app/api/v1/ (public endpoints)
- packages/api/auth/api-keys.ts
- docs/api/openapi.yaml
Tasks:
1. API key management
2. Rate limiting per API key
3. Public endpoints documentation
4. Webhook system
5. Integration test suite
```

### T708: Webhook System
```
Goal: Webhook notifications for external systems
Dependencies: T707
Files:
- packages/api/webhooks/registry.ts
- packages/api/webhooks/delivery.ts
- apps/web/app/(dashboard)/settings/integrations/page.tsx
Tasks:
1. Webhook event types
2. Webhook endpoint registration
3. Event delivery with retry
4. Delivery logs
5. Secret signing
```

---

## Phase 8: Polish & Scale (Weeks 27-30) — 10 Tasks

### T801: Performance Audit
```
Goal: Performance optimization
Dependencies: All phases
Files:
- apps/web/next.config.ts (optimized)
- apps/web/lib/performance/image-optimization.ts
Tasks:
1. Lighthouse audit — target 90+ all categories
2. Image optimization (WebP, lazy loading, responsive sizes)
3. Bundle analysis and code splitting
4. React Server Components optimization
5. Database query optimization
6. Edge caching strategy
```

### T802: Security Audit
```
Goal: Security hardening
Dependencies: All phases
Files:
- docs/security/audit-report.md
- apps/web/middleware.ts (hardened)
Tasks:
1. OWASP Top 10 assessment
2. SQL injection review (Prisma parameterized queries)
3. XSS prevention review (React + CSP)
4. CSRF protection
5. Rate limiting review
6. Session management review
7. Dependency vulnerability scan
```

### T803: HIPAA Compliance Documentation
```
Goal: HIPAA compliance documentation
Dependencies: All phases
Files:
- docs/compliance/hipaa/
- docs/compliance/business-associate-agreement.md
- docs/compliance/risk-assessment.md
Tasks:
1. PHI inventory and data flow diagram
2. Risk assessment
3. Security policies documentation
4. Breach notification procedures
5. Employee training materials
6. BAA with Supabase
```

### T804: Load Testing
```
Goal: Load and stress testing
Dependencies: T801
Files:
- k6/ (load test scripts)
Tasks:
1. API endpoint load testing (100 concurrent users)
2. Database connection pool testing
3. AI endpoint rate testing
4. File upload stress testing
5. Realtime connection scaling
6. Report and optimization
```

### T805: PWA Optimization
```
Goal: Progressive Web App capabilities
Dependencies: T003
Files:
- apps/web/public/manifest.json
- apps/web/public/sw.js
- apps/web/app/layout.tsx (PWA meta tags)
Tasks:
1. Service worker for offline support
2. Push notifications
3. Install prompt
4. Offline page
5. Background sync
```

### T806: Accessibility Audit
```
Goal: WCAG 2.1 AA compliance
Dependencies: All phases
Files:
- apps/web/app/layout.tsx (accessibility enhancements)
Tasks:
1. Screen reader testing
2. Keyboard navigation audit
3. Color contrast verification
4. Focus management
5. ARIA labels review
6. Accessibility statement
```

### T807: i18n Implementation
```
Goal: Full internationalization
Dependencies: T021
Files:
- apps/web/lib/i18n/locales/**/*.json
Tasks:
1. Translate UI to target languages (Spanish, Tagalog for PH market)
2. Date/number formatting per locale
3. RTL support (if needed)
4. Language switcher
5. Translation management workflow
```

### T808: Documentation Completion
```
Goal: Complete all documentation
Dependencies: All phases
Files:
- docs/** (all files)
Tasks:
1. User documentation (clinician guide)
2. Admin documentation
3. API documentation (OpenAPI)
4. Deployment guide
5. Developer onboarding guide
6. Architecture overview videos
```

### T809: Beta Launch Preparation
```
Goal: Beta launch readiness
Dependencies: All phases
Files:
- docs/launch/beta-checklist.md
Tasks:
1. Feature completeness check
2. Bug triage and fix
3. User acceptance testing
4. Beta user onboarding
5. Feedback collection system
6. Support channel setup
```

### T810: Production Launch
```
Goal: Production launch
Dependencies: T809
Files:
- docs/launch/production-checklist.md
Tasks:
1. Production environment verification
2. DNS and SSL setup
3. Monitoring and alerting verification
4. Backup verification
5. Scaling review
6. Rollback procedures
7. Launch communication
```

---

## Execution Notes

**For Claude Code execution:**
```bash
# Each task should be run as:
claude -p 'Task description from above' \
  --allowedTools 'Read,Write,Edit,Bash' \
  --max-turns 30 \
  --dangerously-skip-permissions

# Phase 0 tasks: 15-20 max-turns
# Phase 1-3 tasks: 20-30 max-turns
# Phase 4+ tasks: 15-25 max-turns
```

**Task execution priority:**
1. Always complete dependencies first
2. Run verification step before declaring done
3. If task times out, split into smaller subtasks
4. Run `pnpm build` after each task to catch errors
5. Fix build errors immediately (don't accumulate tech debt)

**Quality gates before proceeding to next task:**
- [ ] pnpm build succeeds
- [ ] pnpm lint passes
- [ ] pnpm typecheck passes
- [ ] Tests pass (if applicable)
- [ ] Manual verification steps from acceptance criteria pass
