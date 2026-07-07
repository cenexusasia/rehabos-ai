# RehabOS AI — Architecture & Strategy Document

> **Version:** 1.0.0  
> **Author:** CTO / Principal Architect  
> **Status:** Draft for Review  
> **Scope:** Complete system architecture, open-source adoption strategy, roadmap, and implementation plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Open Source Adoption Strategy](#2-open-source-adoption-strategy)
3. [Technology Stack](#3-technology-stack)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Database Schema](#5-database-schema)
6. [API Architecture & Contracts](#6-api-architecture--contracts)
7. [AI Architecture](#7-ai-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Folder Structure](#9-folder-structure)
10. [Coding Standards](#10-coding-standards)
11. [Testing Strategy](#11-testing-strategy)
12. [CI/CD Pipeline](#12-cicd-pipeline)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Backup & Disaster Recovery](#14-backup--disaster-recovery)
15. [UI Design System & Wireframes](#15-ui-design-system--wireframes)
16. [Milestones & Roadmap](#16-milestones--roadmap)
17. [Architecture Decision Records (ADRs)](#17-architecture-decision-records-adrs)
18. [Claude Code Implementation Tasks](#18-claude-code-implementation-tasks)
19. [API Contracts](#19-api-contracts)
20. [Monitoring & Observability](#20-monitoring--observability)

---

# 1. Executive Summary

RehabOS AI is an AI-native operating system for rehabilitation professionals. It covers the complete clinician workflow from patient intake through assessment, documentation, treatment planning, home exercise programs, billing, and telehealth.

**Key Architectural Principles:**

1. **Open Source First** — Maximize reuse of mature open-source projects for all non-differentiating functionality
2. **AI-Native** — Every module has AI capabilities built in from day one, not bolted on
3. **FHIR-Compatible** — Use FHIR standards where practical for interoperability
4. **Offline-First** — Patients and clinicians can work without connectivity
5. **Multi-Tenant** — Organizations, clinics, and individual practitioners
6. **API-First** — Every feature is accessible via REST API
7. **Event-Driven** — Asynchronous workflows for notifications, billing, AI processing

**Core Differentiators (Custom IP):**

- AI Assessment Engine
- Assessment Database & Library
- Clinical Knowledge Graph
- AI SOAP Note Generator
- AI Exercise Generator & Progression Engine
- Protocol Builder
- AI Clinical Decision Support
- AI Follow-up Assistant
- Referral Intelligence
- AI Rehabilitation Assistant (Patient-Facing)

---

# 2. Open Source Adoption Strategy

## 2.1 Recommended Adoptions

### Authentication & Authorization

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Auth Provider** | **Supabase Auth** (built-in) | MIT | Serverless, row-level security, OAuth, MFA, email/password, magic link. No separate service to manage. |
| **Role-Based Access** | **Supabase RLS + Custom RBAC** | Built-in | Row-level security policies + a custom `roles` / `permissions` tables. No need for Casbin or external authz. |
| **Auth UI Components** | **Shadcn UI Auth components** | MIT | Pre-built login/register/reset forms. |

### Scheduling & Calendar

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Scheduling Engine** | **Cal.diy** (MIT fork of Cal.com) | MIT | Mature, full-featured scheduling platform with availability management, booking pages, calendar sync, reminders. self-hosted. |
| **Calendar UI** | **Schedule-X** | MIT | Modern, dark-mode, drag & drop calendar component for React. Alternative: FullCalendar (MIT). |

### Telehealth / Video

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Video Conferencing** | **Jitsi Meet** | Apache 2.0 | Mature, self-hosted, WebRTC-based. Handles multi-party video, screen sharing, recording. Drop-in iframe or custom integration. |
| **SFU (Selective Forwarding Unit)** | **mediasoup** | MIT | Lower-level alternative for custom video experiences. Node.js API. |
| **Integration** | **Jitsi iframe API** | Apache 2.0 | Embed Jitsi into Next.js with custom UI overlay. |

### Messaging & Notifications

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Real-time Messaging** | **Supabase Realtime** | Apache 2.0 | Built on PostgreSQL replication + WebSockets. Perfect for chat, notifications, live updates. |
| **Push Notifications** | **Supabase Realtime + Expo Push** | MIT | Server sends via Supabase Realtime; mobile uses Expo Push Notifications. |
| **In-App Notifications** | **Custom Supabase Realtime channel** | Built-in | Notifications table with Realtime subscription. |
| **Email** | **Resend** (SaaS) + **React Email** (MIT) | MIT | Resend for sending. React Email for building email templates as React components. |

### Payments & Billing

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Payment Processing** | **Stripe** | Proprietary | Best-in-class, HIPAA-compliant, supports subscriptions, invoices, payment intents. Integrates with React via Stripe Elements. |
| **Philippine Payments** | **Xendit** | Proprietary | GCash, Maya, bank transfers, over-the-counter for PH market. |
| **Billing Infrastructure** | **Lago** | AGPL | Open-source billing for usage-based and subscription pricing. Self-host if needed; otherwise use Stripe Billing directly. |
| **Invoicing** | **Stripe Invoicing** | Built-in | Auto-generated PDF invoices, tax handling. |

### Storage & File Management

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **File Storage** | **Supabase Storage** | MIT | S3-compatible, bucket-level policies, image optimization. Stores exercise videos, patient documents, assessment images. |
| **Image Optimization** | **Supabase Image Transformations** | Built-in | Resize, crop, format conversion via URL params. |
| **Video Processing** | **Mux** (SaaS) or **FFmpeg** (self-hosted) | GPL 2.1 | Transcode exercise videos. Mux for managed. FFmpeg in Docker for self-hosted. |

### PDF Generation & Documents

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **PDF Generation** | **@react-pdf/renderer** | MIT | React components → PDF. Perfect for SOAP notes, exercise programs, invoices. |
| **Rich Text Editing** | **TipTap** (ProseMirror-based) | MIT | Rich text editor for SOAP notes, assessment notes. Extensible with custom nodes. |

### Search

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Full-Text Search** | **Meilisearch** | MIT | Fast, typo-tolerant, instant search. Self-hosted (small footprint, ~256MB RAM). Indexes exercises, patients, notes, protocols. |
| **PostgreSQL Native Search** | **pgvector + Supabase Text Search** | PostgreSQL | Supabase already has PostgreSQL full-text search and pgvector. Use for basic search; Meilisearch for advanced. |

### Monitoring & Error Tracking

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Error Tracking** | **Sentry** | MIT (self-hosted) / SaaS | Industry standard. Source maps, performance tracing, session replay. |
| **Performance Monitoring** | **Sentry Performance** + **Vercel Analytics** | Mixed | Frontend: Vercel Web Analytics. Backend: Sentry Performance. |
| **Logging** | **Axiom** or **self-hosted SigNoz** | Apache 2.0 | Centralized logging. SigNoz is open-source Datadog alternative. |

### Feature Flags

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Feature Flags** | **Supabase Flags** (custom table) or **GrowthBook** | MIT | Lightweight: use a `feature_flags` table in Supabase with Realtime subscription. GrowthBook for advanced targeting. |

### Analytics

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Product Analytics** | **PostHog** | MIT | Open-source Mixpanel/Amplitude alternative. Self-host or cloud. Event tracking, funnels, session recording. |
| **Charting** | **Recharts** | MIT | React-native charting library. For dashboards and outcome measure visualization. |
| **Tables** | **TanStack Table** | MIT | Headless table with sorting, filtering, pagination, virtualization. |

### Admin Dashboard

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Admin UI Framework** | **React Admin** | MIT | Build admin panels from Supabase/Prisma. Supports lists, forms, dashboards. |
| **Built-in Admin** | **Custom Next.js admin app** | — | Better control over UX. Use React Admin patterns. |

### Mobile Framework

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Cross-Platform Mobile** | **Expo (React Native)** | MIT | Build iOS + Android + Web from one codebase. Expo Router for navigation. |
| **Offline Support** | **Expo SQLite + Legend State** | MIT | SQLite for local data. Legend State for reactive state with persistence. Sync via Supabase Realtime. |
| **PWA** | **Next.js PWA** (next-pwa or workbox) | MIT | Web app also works offline with service workers. |

### Forms & Validation

| Component | Recommendation | License | Rationale |
|-----------|---------------|---------|-----------|
| **Form Library** | **React Hook Form** | MIT | Performant forms with minimal re-renders. |
| **Validation** | **Zod** | MIT | TypeScript-first schema validation. Works with React Hook Form. |
| **Form UI** | **Shadcn UI Form components** | MIT | Pre-built form components built on React Hook Form + Zod. |

## 2.2 Why Medplum is NOT Recommended

**Medplum** is an excellent open-source FHIR platform, but for RehabOS we are **not adopting it** for these reasons:

1. **Weight** — Medplum is a full FHIR server (1GB+ RAM). Too heavy for a startup that needs agility.
2. **Abstraction overhead** — FHIR resources are complex. Custom assessment models, exercise protocols, and our AI engine don't map neatly to FHIR without excessive extension.
3. **AI integration** — Medplum has basic AI support but not at the depth we need.
4. **Deployment complexity** — Medplum requires ElasticSearch, Redis, and a separate server. We're targeting Vercel + Supabase.
5. **Vendor dependency risk** — While open-source, its cloud offering is the monetization path.

**Instead:** Use a simplified FHIR-like data model for interoperability (export as FHIR) but keep internal models optimized for performance and our AI workflows.

---

# 3. Technology Stack

## Frontend Stack

```
Category        │ Technology              │ Version  │ Purpose
────────────────┼─────────────────────────┼──────────┼──────────────────────
Framework       │ Next.js                 │ 15.x     │ App Router, SSR, Server Actions
UI              │ React 19                │ 19.x     │ Component library
Language        │ TypeScript              │ 5.7+     │ Strict mode
Styling         │ TailwindCSS             │ 4.x      │ Utility-first CSS
Components      │ Shadcn UI               │ latest   │ Accessible, customizable components
Icons           │ Lucide React            │ latest   │ Icon library
Forms           │ React Hook Form + Zod   │ latest   │ Form handling + validation
HTTP Client     │ TanStack Query          │ 5.x      │ Server state management
Tables          │ TanStack Table          │ 8.x      │ Headless data tables
Charts          │ Recharts                │ 2.x      │ Outcome measure charts
Calendar        │ Schedule-X              │ 2.x      │ Appointment calendar
Rich Text       │ TipTap                  │ 2.x      │ SOAP note editor
PDF             │ @react-pdf/renderer     │ 4.x      │ PDF generation
State           │ Zustand                 │ 5.x      │ Lightweight client state
Animations      │ Framer Motion           │ 11.x     │ Page transitions, micro-interactions
PWA             │ next-pwa                │ latest   │ Offline support
```

## Backend Stack

```
Category        │ Technology              │ Purpose
────────────────┼─────────────────────────┼──────────────────────────
Database        │ Supabase (PostgreSQL 16)│ Primary database
Auth            │ Supabase Auth           │ Authentication + RLS
Realtime        │ Supabase Realtime       │ WebSocket + CDC
Storage         │ Supabase Storage        │ File storage (S3-compatible)
ORM             │ Prisma                  │ Type-safe database access
Vector          │ pgvector                │ Embedding similarity search
Search          │ Meilisearch             │ Full-text search
Cache           │ Upstash Redis           │ Session, rate limiting, caching
Queue           │ Supabase + Inngest      │ Background job processing
```

## AI Stack

```
Category        │ Technology              │ Purpose
────────────────┼─────────────────────────┼──────────────────────────────────
LLM Provider    │ OpenAI + Claude         │ Text generation, analysis
Embeddings      │ OpenAI text-embedding-3 │ Vector embeddings for RAG
RAG Framework   │ LlamaIndex              │ Document indexing, retrieval, chunking
Graph DB        │ Neo4j AuraDB            │ Clinical knowledge graph
GraphRAG        │ LangChain + Neo4j       │ Knowledge graph-enhanced RAG
Prompt Mgmt     │ Langfuse                │ Prompt versioning, tracing, evaluation
Speech-to-Text  │ OpenAI Whisper / Deepgram│ Voice transcription
AI Agents       │ LangGraph               │ Multi-step AI workflows (assessment, SOAP)
```

## Infrastructure

```
Category        │ Technology              │ Purpose
────────────────┼─────────────────────────┼──────────────────────────
Hosting         │ Vercel                  │ Frontend + API routes
CI/CD           │ GitHub Actions          │ Build, test, deploy
Monitoring      │ Sentry                  │ Error tracking + performance
Analytics       │ PostHog                 │ Product analytics
Feature Flags   │ GrowthBook              │ Feature flag management
Email           │ Resend + React Email    │ Transactional email
Docs            │ Mintlify                │ Developer documentation
```

---

# 4. Monorepo Structure

```
rehabos/
├── apps/
│   ├── web/                          # Main Next.js app (Clinician Web)
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Login, signup, forgot password
│   │   │   │   ├── (dashboard)/      # Authenticated routes
│   │   │   │   │   ├── patients/     # Patient management
│   │   │   │   │   ├── schedule/     # Appointment calendar
│   │   │   │   │   ├── assessments/  # Assessment builder & library
│   │   │   │   │   ├── soap/         # SOAP notes
│   │   │   │   │   ├── exercises/    # Exercise library
│   │   │   │   │   ├── hep/          # Home exercise programs
│   │   │   │   │   ├── progress/     # Outcome measures & progress
│   │   │   │   │   ├── billing/      # Invoices & payments
│   │   │   │   │   ├── telehealth/   # Video consultations
│   │   │   │   │   ├── messages/     # Messaging
│   │   │   │   │   ├── analytics/    # Practice analytics
│   │   │   │   │   ├── settings/     # Clinic & profile settings
│   │   │   │   │   └── admin/        # Organization admin
│   │   │   │   └── api/              # Next.js API routes (if needed)
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Shadcn UI components
│   │   │   │   ├── forms/            # Form components
│   │   │   │   ├── layout/           # Shell, sidebar, nav
│   │   │   │   ├── patients/         # Patient-related components
│   │   │   │   ├── assessments/      # Assessment components
│   │   │   │   ├── soap/             # SOAP note components
│   │   │   │   ├── exercises/        # Exercise components
│   │   │   │   └── shared/           # Shared components
│   │   │   ├── lib/
│   │   │   │   ├── supabase/         # Supabase client, queries
│   │   │   │   ├── ai/               # AI API clients
│   │   │   │   ├── utils/            # Utility functions
│   │   │   │   └── constants/        # Constants, enums
│   │   │   └── styles/               # Global styles
│   │   ├── prisma/                   # Prisma schema (if web-only DB access)
│   │   ├── public/                   # Static assets
│   │   ├── middleware.ts             # Auth middleware
│   │   └── package.json
│   │
│   ├── mobile/                       # Expo React Native app (Patient)
│   │   ├── app/                      # Expo Router pages
│   │   │   ├── (tabs)/              # Tab navigation
│   │   │   ├── exercises/           # HEP viewer
│   │   │   ├── messages/            # Messaging
│   │   │   ├── appointments/        # Appointments
│   │   │   └── progress/            # Self-reporting
│   │   ├── components/
│   │   ├── lib/
│   │   ├── store/                    # Legend State stores
│   │   └── package.json
│   │
│   └── admin/                        # Admin dashboard (Next.js)
│       └── src/
│           ├── app/
│           └── components/
│
├── packages/
│   ├── ai/
│   │   ├── assessment-engine/        # AI Assessment Engine
│   │   ├── soap-generator/           # AI SOAP Note Generator
│   │   ├── exercise-generator/       # AI Exercise Generator
│   │   ├── progression-engine/       # AI Progression Engine
│   │   ├── clinical-decision-support/# AI Clinical Decision Support
│   │   └── follow-up-assistant/      # AI Follow-up Assistant
│   │
│   ├── knowledge-graph/              # Clinical Knowledge Graph
│   │   ├── schema/                   # Graph schema definitions
│   │   ├── builders/                 # Graph construction pipelines
│   │   ├── queries/                  # Graph query templates
│   │   └── embeddings/              # Entity embeddings
│   │
│   ├── database/                     # Prisma schema + migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── seeds/                    # Seed data
│   │   │   ├── exercise-library/     # Exercise catalog seed
│   │   │   ├── assessments/         # Standardized assessments
│   │   │   └── roles/              # Default roles & permissions
│   │   └── rls/                     # Row-Level Security policies
│   │
│   ├── api/                          # Shared API layer
│   │   ├── rest/                     # Route handlers, validation
│   │   ├── websocket/               # Realtime event definitions
│   │   └── middleware/              # Auth, rate limiting, logging
│   │
│   ├── shared-ui/                    # Shared design system
│   │   ├── components/              # Reusable components
│   │   ├── hooks/                   # Shared hooks
│   │   └── tokens/                  # Design tokens
│   │
│   ├── exercise-library/             # Exercise definitions
│   │   ├── categories/
│   │   ├── exercises.json
│   │   └── media/                   # Exercise image/video references
│   │
│   └── protocol-engine/              # Protocol builder engine
│       ├── templates/
│       ├── validators/
│       └── renderers/
│
├── packages/
│   └── config/                       # Shared config
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docker/                           # Docker compose files
│   ├── docker-compose.yml           # Local dev (Meilisearch, Redis, Jitsi)
│   ├── Dockerfile.web
│   └── Dockerfile.mobile
│
├── scripts/                          # Dev/ops scripts
│   ├── seed.ts                      # Database seeding
│   ├── migrate.ts                   # Migration runner
│   └── backup.sh                    # Backup script
│
├── docs/                             # Documentation
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── deployment/
│   └── adrs/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # Build, lint, test
│   │   ├── deploy.yml               # Vercel deploy
│   │   └── seed.yml                 # Database seed
│   └── ISSUE_TEMPLATE/
│       └── task.md
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml
└── README.md
```

---

# 5. Database Schema

> **Complete Prisma schema** will be written to `packages/database/prisma/schema.prisma`
> Below is the conceptual schema covering all entities.

## 5.1 Core Entities

### Organizations & Tenancy

```
organizations
├── id: UUID (PK)
├── name: String
├── slug: String (unique)
├── logo_url: String?
├── timezone: String (default: 'UTC')
├── settings: JSONB (feature flags, branding)
├── subscription_tier: Enum (free, starter, professional, enterprise)
├── stripe_customer_id: String?
├── created_at: Timestamp
└── updated_at: Timestamp

clinics
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── name: String
├── address: JSONB
├── phone: String?
├── email: String?
├── timezone: String
├── settings: JSONB
├── created_at: Timestamp
└── updated_at: Timestamp

clinicians
├── id: UUID (PK) [also Supabase auth.users id]
├── organization_id: UUID (FK → organizations)
├── clinic_id: UUID? (FK → clinics)
├── email: String (unique)
├── first_name: String
├── last_name: String
├── title: String? (PT, DPT, OTR/L, DC)
├── license_number: String?
├── license_state: String?
├── specialization: String[] (sports, ortho, neuro, peds, geriatric)
├── profile_image_url: String?
├── phone: String?
├── is_active: Boolean (default: true)
├── settings: JSONB (preferences, notification settings)
├── created_at: Timestamp
└── updated_at: Timestamp

roles
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── name: String (admin, clinician, billing_admin, front_desk, patient)
├── description: String?
├── is_system: Boolean (cannot be deleted)
├── permissions: String[] (array of permission keys)
├── created_at: Timestamp
└── updated_at: Timestamp

clinician_roles
├── clinician_id: UUID (FK → clinicians)
├── role_id: UUID (FK → roles)
└── clinic_id: UUID? (FK → clinics, for scoped roles)
```

### Patients

```
patients
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── clinic_id: UUID? (FK → clinics)
├── clinician_id: UUID (FK → clinicians) [primary clinician]
├── first_name: String
├── last_name: String
├── date_of_birth: Date
├── gender: Enum (male, female, other, prefer_not_to_say)
├── phone: String?
├── email: String?
├── address: JSONB?
├── emergency_contact: JSONB?
├── insurance_provider: String?
├── insurance_id: String?
├── diagnosis_codes: String[] (ICD-10 codes)
├── referring_provider: String?
├── referred_by_clinician_id: UUID? (FK → clinicians)
├── avatar_url: String?
├── status: Enum (active, inactive, discharged, archived, transferred)
├── tags: String[]
├── notes: Text?
├── settings: JSONB (communication preferences, portal access)
├── created_at: Timestamp
├── updated_at: Timestamp
└── deleted_at: Timestamp? (soft delete)
```

### Assessments

```
assessments (the template/catalog of standardized assessments)
├── id: UUID (PK)
├── organization_id: UUID? (FK → organizations, null = system-wide)
├── name: String (e.g., "Lower Extremity Functional Scale", "Berg Balance Test")
├── category: Enum (outcome_measure, functional_test, special_test, subjective, objective)
├── subcategory: String? (balance, strength, range_of_motion, pain, function, quality_of_life)
├── description: Text
├── instructions: Text (how to administer)
├── scoring_type: Enum (numeric, ordinal, likert, timed, pass_fail, percentage)
├── scoring_instructions: Text
├── min_score: Float?
├── max_score: Float?
├── higher_is_better: Boolean (true = higher score = better outcome)
├── mcid: Float? (minimal clinically important difference)
├── normative_data: JSONB? (age/gender norms)
├── body_region: String[] (full_body, lower_extremity, upper_extremity, spine, etc.)
├── conditions: String[] (relevant diagnosis codes)
├── estimated_duration_minutes: Int
├── required_equipment: String[]
├── is_standardized: Boolean (true = validated outcome measure)
├── version: String
├── questions: JSONB (array of question definitions)
│   └── [{id, text, type, options, weight, depends_on, scoring_map}]
├── created_at: Timestamp
└── updated_at: Timestamp

patient_assessments (actual administered assessments)
├── id: UUID (PK)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── assessment_id: UUID (FK → assessments)
├── visit_id: UUID? (FK → visits)
├── status: Enum (in_progress, completed, partially_completed)
├── responses: JSONB (question_id → answer)
├── score: Float? (calculated)
├── percentile: Float? (if normative data exists)
├── interpretation: Text? (AI-generated or clinician notes)
├── flagged: Boolean (clinician attention needed)
├── completed_at: Timestamp?
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Visits & SOAP Notes

```
visits
├── id: UUID (PK)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── appointment_id: UUID? (FK → appointments)
├── clinic_id: UUID (FK → clinics)
├── visit_type: Enum (initial_evaluation, follow_up, reevaluation, discharge, telehealth)
├── visit_number: Int (per patient)
├── status: Enum (scheduled, checked_in, in_progress, completed, cancelled)
├── chief_complaint: Text?
├── diagnosis_codes: String[] (ICD-10)
├── duration_minutes: Int
├── billed_status: Enum (pending, submitted, paid, denied)
├── billing_code: String? (CPT)
├── created_at: Timestamp
└── updated_at: Timestamp

soap_notes
├── id: UUID (PK)
├── visit_id: UUID (FK → visits, unique per visit)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── subjective: JSONB
│   ├── chief_complaint: Text
│   ├── history_of_present_illness: Text
│   ├── pain_level: Int?
│   ├── aggravating_factors: Text
│   ├── easing_factors: Text
│   ├── activity_modification: Text
│   └── patient_goals: Text
├── objective: JSONB
│   ├── vitals: JSONB
│   ├── observation: Text
│   ├── palpation: JSONB
│   ├── range_of_motion: JSONB
│   ├── strength_testing: JSONB
│   ├── special_tests: JSONB[]
│   ├── functional_tests: JSONB[]
│   └── outcome_measures: JSONB[]
├── assessment: JSONB
│   ├── clinical_impression: Text
│   ├── diagnosis: Text
│   ├── progress_toward_goals: Text
│   └── barriers_to_progress: Text
├── plan: JSONB
│   ├── treatment_plan: Text
│   ├── exercises: JSONB[] (exercise IDs + parameters)
│   ├── modalities: JSONB[]
│   ├── patient_education: Text
│   ├── follow_up: Text
│   ├── referrals: JSONB[]
│   └── home_program: Text
├── ai_generated: Boolean (default: false)
├── ai_draft: JSONB? (pre-generation data)
├── ai_assisted: Boolean (default: false)
├── status: Enum (draft, completed, signed, amended, corrected)
├── signed_at: Timestamp?
├── signed_by_clinician_id: UUID? (FK → clinicians)
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Exercise Library

```
exercise_categories
├── id: UUID (PK)
├── name: String (strength, flexibility, balance, coordination, endurance, manual_therapy)
├── slug: String (unique)
├── parent_id: UUID? (FK → exercise_categories)
├── description: Text?
├── sort_order: Int
└── created_at: Timestamp

exercises
├── id: UUID (PK)
├── organization_id: UUID? (FK → organizations, null = system-wide)
├── name: String
├── alternative_names: String[]
├── description: Text
├── instructions: Text (step-by-step)
├── cueing_points: String[] (verbal cues for clinicians)
├── category_id: UUID (FK → exercise_categories)
├── body_region: String[] (core, upper_back, lower_back, shoulder, elbow, wrist, hip, knee, ankle, neck, full_body)
├── movement_pattern: String[] (push, pull, hinge, squat, lunge, rotation, gait, balance)
├── difficulty: Enum (beginner, intermediate, advanced, sports_specific)
├── equipment: String[] (bodyweight, resistance_band, dumbbell, barbell, kettlebell, medicine_ball, foam_roller, theraband, cable, balance_board, vibration_plate)
├── contraindications: String[]
├── precautions: String[]
├── target_muscles: String[] (primary, secondary, stabilizer)
├── video_url: String?
├── image_urls: String[]
├── thumbnail_url: String?
├── duration_seconds: Int? (per rep)
├── is_passive: Boolean (assisted/manual)
├── is_weight_bearing: Boolean
├── is_open_chain: Boolean
├── is_plyometric: Boolean
├── tags: String[]
├── ai_metadata: JSONB? (embeddings, feature vectors for AI recommendation)
├── published: Boolean
├── source: Enum (built_in, community, clinic_custom, ai_generated)
├── created_at: Timestamp
└── updated_at: Timestamp

exercise_parameters (per-prescription parameters)
├── id: UUID (PK)
├── exercise_id: UUID (FK → exercises)
├── name: String (sets, reps, hold_duration, rest_interval, intensity, speed, frequency)
├── parameter_type: Enum (number, range, text, percentage, rpe)
├── default_value: String?
├── min_value: String?
├── max_value: String?
├── unit: String? (seconds, reps, kg, lbs, rpe_scale)
├── required: Boolean (default: false)
└── sort_order: Int
```

### Home Exercise Programs

```
home_exercise_programs
├── id: UUID (PK)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── visit_id: UUID? (FK → visits)
├── name: String (e.g., "Week 1 - Post-op ACL")
├── description: Text?
├── status: Enum (draft, active, paused, completed, archived)
├── start_date: Date?
├── end_date: Date?
├── frequency_per_day: Int
├── days_per_week: Int
├── total_duration_weeks: Int
├── phase: Int? (progression phase)
├── ai_generated: Boolean
├── ai_prompt: Text? (what clinician asked AI to generate)
├── created_at: Timestamp
└── updated_at: Timestamp

program_exercises
├── id: UUID (PK)
├── program_id: UUID (FK → home_exercise_programs)
├── exercise_id: UUID (FK → exercises)
├── sort_order: Int
├── sets: Int?
├── reps: String? ("10", "10-12", "as tolerated")
├── hold_duration: Int? (seconds)
├── rest_duration: Int? (seconds)
├── intensity: String? ("50% max", "RPE 6/10", "moderate")
├── side: Enum? (left, right, bilateral, alternating)
├── frequency: String? ("3x/day", "2x/day")
├── notes: Text? (patient-specific instructions)
├── substitutions: JSONB? (alternative exercises)
├── progression_criteria: JSONB? (when to progress)
├── ai_progression_metadata: JSONB?
└── created_at: Timestamp
```

### Protocols

```
protocols
├── id: UUID (PK)
├── organization_id: UUID? (FK → organizations)
├── name: String (e.g., "ACL Reconstruction Protocol - Phase 1")
├── description: Text
├── diagnosis_codes: String[] (applicable ICD-10 codes)
├── body_region: String
├── condition: String
├── surgery_type: String? (if post-surgical)
├── phases: JSONB (array of phase definitions)
│   └── [{phase_number, name, duration, criteria_to_advance, goals, restrictions}]
├── total_duration_weeks: Int
├── evidence_level: Enum? (A, B, C, D, expert_opinion)
├── references: String[] (PubMed IDs)
├── tags: String[]
├── published: Boolean
├── version: Int
├── source: Enum (built_in, community, clinic_custom, ai_generated)
├── created_at: Timestamp
└── updated_at: Timestamp

protocol_phases
├── id: UUID (PK)
├── protocol_id: UUID (FK → protocols)
├── phase_number: Int
├── name: String (e.g., "Phase 1: Protection & Pain Control")
├── duration_days: Int? (number must match protocol)
├── goals: String[]
├── restrictions: String[]
├── criteria_to_advance: String[]
├── exercise_recommendations: JSONB (exercise categories, types)
├── outcome_measure_targets: JSONB (expected scores at end of phase)
├── created_at: Timestamp
└── updated_at: Timestamp

patient_protocols
├── id: UUID (PK)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── protocol_id: UUID (FK → protocols)
├── current_phase: Int
├── start_date: Date
├── expected_end_date: Date?
├── status: Enum (active, completed, discontinued, modified)
├── modifications: JSONB? (clinician customizations)
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Scheduling & Appointments

```
appointments
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── clinic_id: UUID (FK → clinics)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── appointment_type: Enum (in_person, telehealth, phone_consult, home_visit)
├── status: Enum (scheduled, confirmed, checked_in, in_progress, completed, cancelled, no_show)
├── start_time: Timestamptz
├── end_time: Timestamptz
├── duration_minutes: Int
├── reason: String? (chief complaint / reason for visit)
├── notes: Text? (internal notes)
├── cancellation_reason: String?
├── cancelled_at: Timestamp?
├── confirmed_at: Timestamp?
├── checked_in_at: Timestamp?
├── telehealth_room_id: String? (Jitsi room)
├── is_recurring: Boolean
├── recurring_rule: JSONB?
├── created_at: Timestamp
└── updated_at: Timestamp

availability_schedules
├── id: UUID (PK)
├── clinician_id: UUID (FK → clinicians)
├── clinic_id: UUID? (FK → clinics)
├── day_of_week: Int (0=Sunday, 6=Saturday)
├── start_time: Time
├── end_time: Time
├── slot_duration_minutes: Int (default: 30)
├── buffer_minutes: Int (gap between appointments, default: 5)
├── is_available: Boolean (default: true)
├── effective_start: Date
├── effective_end: Date?
├── created_at: Timestamp
└── updated_at: Timestamp

time_off
├── id: UUID (PK)
├── clinician_id: UUID (FK → clinicians)
├── start_date: Timestamptz
├── end_date: Timestamptz
├── reason: String? (vacation, sick, conference, personal)
├── is_all_day: Boolean
└── created_at: Timestamp
```

### Billing

```
invoices
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── clinic_id: UUID (FK → clinics)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── invoice_number: String (unique per org)
├── status: Enum (draft, sent, partially_paid, paid, overdue, cancelled, refunded)
├── subtotal: Decimal
├── tax: Decimal
├── discount: Decimal
├── total: Decimal
├── currency: String (default: 'USD')
├── due_date: Date
├── paid_at: Timestamp?
├── stripe_invoice_id: String?
├── xendit_invoice_id: String?
├── notes: Text?
├── created_at: Timestamp
└── updated_at: Timestamp

invoice_line_items
├── id: UUID (PK)
├── invoice_id: UUID (FK → invoices)
├── visit_id: UUID? (FK → visits)
├── description: String (e.g., "Initial Evaluation - 97161")
├── cpt_code: String? (billing code)
├── quantity: Int (default: 1)
├── unit_price: Decimal
├── total_price: Decimal
├── insurance_eligible: Boolean
└── created_at: Timestamp

payments
├── id: UUID (PK)
├── invoice_id: UUID (FK → invoices)
├── amount: Decimal
├── method: Enum (credit_card, debit, gcash, maya, bank_transfer, cash, check, insurance)
├── provider: Enum (stripe, xendit, manual)
├── provider_payment_id: String?
├── status: Enum (pending, completed, failed, refunded)
├── refunded_at: Timestamp?
├── notes: Text?
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Messaging

```
conversations
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── subject: String?
├── type: Enum (direct_message, group, patient_clinician, referral)
├── participant_ids: UUID[]
├── last_message_at: Timestamp?
├── is_archived: Boolean
├── created_at: Timestamp
└── updated_at: Timestamp

messages
├── id: UUID (PK)
├── conversation_id: UUID (FK → conversations)
├── sender_id: UUID (FK → clinicians or patients)
├── sender_type: Enum (clinician, patient, system, ai_assistant)
├── body: Text
├── attachments: JSONB[] (file references)
├── message_type: Enum (text, image, video, document, exercise, appointment, invoice)
├── metadata: JSONB? (exercise_id, appointment_id, etc.)
├── created_at: Timestamp
└── updated_at: Timestamp

message_reads
├── message_id: UUID (FK → messages)
├── participant_id: UUID
├── read_at: Timestamp
└── PRIMARY KEY (message_id, participant_id)
```

### Telehealth

```
telehealth_sessions
├── id: UUID (PK)
├── appointment_id: UUID (FK → appointments)
├── patient_id: UUID (FK → patients)
├── clinician_id: UUID (FK → clinicians)
├── jitsi_room_name: String (unique)
├── status: Enum (scheduled, active, completed, cancelled, failed)
├── started_at: Timestamp?
├── ended_at: Timestamp?
├── duration_seconds: Int?
├── recording_url: String?
├── patient_joined: Boolean
├── clinician_joined: Boolean
├── quality_metrics: JSONB? (connection quality, packet loss)
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Knowledge Graph

```
knowledge_graph_entities
├── id: UUID (PK)
├── entity_type: Enum (diagnosis, symptom, exercise, assessment, protocol, body_part, medication, modality, special_test, contraindication)
├── name: String
├── description: Text?
├── external_ids: JSONB? (ICD-10, SNOMED, CPT mappings)
├── embedding: Vector(1536)? (OpenAI embedding)
├── metadata: JSONB
├── created_at: Timestamp
└── updated_at: Timestamp

knowledge_graph_relationships
├── id: UUID (PK)
├── source_entity_id: UUID (FK → kg_entities)
├── target_entity_id: UUID (FK → kg_entities)
├── relationship_type: Enum (indicated_for, contraindicated_for, part_of, treats, causes, associated_with, progressed_to, differentiates_from, strength_of_evidence, requires)
├── weight: Float? (0-1, strength/confidence)
├── evidence: String[] (PubMed IDs, citation URLs)
├── metadata: JSONB
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Analytics & Audit

```
audit_logs
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── clinician_id: UUID? (FK → clinicians)
├── patient_id: UUID? (FK → patients)
├── action: String (assessment.created, soap.signed, patient.updated)
├── resource_type: String
├── resource_id: UUID
├── changes: JSONB? (before/after diff)
├── ip_address: String?
├── user_agent: String?
├── created_at: Timestamp
└── INDEX on (organization_id, created_at, action)

ai_conversations
├── id: UUID (PK)
├── organization_id: UUID (FK → organizations)
├── clinician_id: UUID (FK → clinicians)
├── patient_id: UUID? (FK → patients)
├── session_type: Enum (soap_generation, assessment_interpretation, exercise_recommendation, clinical_question, patient_education, referral_suggestion)
├── prompt: Text
├── response: Text
├── model_used: String (gpt-4o, claude-sonnet-4)
├── tokens_input: Int
├── tokens_output: Int
├── latency_ms: Int
├── feedback: Int? (clinician rating 1-5)
├── metadata: JSONB
├── created_at: Timestamp
└── INDEX on (clinician_id, session_type, created_at)
```

---

# 6. API Architecture & Contracts

## 6.1 Design Principles

1. **RESTful** — Resource-oriented endpoints with standard HTTP methods
2. **Type-Safe** — All APIs are defined in TypeScript with Zod validation
3. **Server Actions for mutations** — Next.js Server Actions for form submissions
4. **Server Components for reads** — Data fetching in React Server Components
5. **Supabase RLS as primary authz** — Row-Level Security at the database level
6. **Rate limiting** — Via Upstash Redis
7. **Versioned** — URL prefix `/api/v1/` for REST endpoints

## 6.2 API Endpoints

```
# Authentication (via Supabase Auth)
POST /auth/v1/signup
POST /auth/v1/login
POST /auth/v1/logout
POST /auth/v1/reset-password
GET  /auth/v1/user
PUT  /auth/v1/user

# Patients
GET    /api/v1/patients                    # List patients (paginated, filterable)
POST   /api/v1/patients                    # Create patient
GET    /api/v1/patients/:id                # Get patient details
PUT    /api/v1/patients/:id                # Update patient
DELETE /api/v1/patients/:id                # Soft delete
GET    /api/v1/patients/:id/timeline       # Patient timeline (visits, notes)
GET    /api/v1/patients/:id/progress       # Outcome measures over time

# Assessments
GET    /api/v1/assessments                 # List assessment catalog
POST   /api/v1/assessments                 # Create assessment template
GET    /api/v1/assessments/:id             # Get assessment details
PUT    /api/v1/assessments/:id             # Update assessment
POST   /api/v1/patients/:id/assessments    # Administer assessment to patient
GET    /api/v1/patients/:id/assessments    # Get patient's assessment results
GET    /api/v1/assessments/:id/interpret   # AI interpretation of results

# Visits & SOAP
GET    /api/v1/patients/:id/visits         # List patient visits
POST   /api/v1/patients/:id/visits         # Create visit
GET    /api/v1/visits/:id                  # Get visit details
PUT    /api/v1/visits/:id                  # Update visit
GET    /api/v1/visits/:id/soap             # Get SOAP note for visit
PUT    /api/v1/visits/:id/soap             # Update SOAP note
POST   /api/v1/visits/:id/soap/generate   # AI generate SOAP from notes
POST   /api/v1/visits/:id/soap/sign       # Sign SOAP note

# Exercises
GET    /api/v1/exercises                   # List exercises (filterable)
GET    /api/v1/exercises/:id               # Get exercise details
POST   /api/v1/exercises                   # Create custom exercise
POST   /api/v1/exercises/recommend         # AI exercise recommendations

# Home Exercise Programs
GET    /api/v1/patients/:id/hep            # List patient's HEPs
POST   /api/v1/patients/:id/hep            # Create HEP
GET    /api/v1/hep/:id                     # Get HEP details
PUT    /api/v1/hep/:id                     # Update HEP
POST   /api/v1/hep/:id/generate            # AI generate HEP
GET    /api/v1/hep/:id/compliance          # Patient compliance data
POST   /api/v1/hep/:id/progress            # AI suggest progression

# Protocols
GET    /api/v1/protocols                   # List protocols
POST   /api/v1/protocols                   # Create protocol
GET    /api/v1/protocols/:id               # Get protocol details
POST   /api/v1/patients/:id/protocols      # Assign protocol to patient
GET    /api/v1/patients/:id/protocols      # Get patient's assigned protocol

# Scheduling
GET    /api/v1/appointments                # List appointments
POST   /api/v1/appointments                # Create appointment
PUT    /api/v1/appointments/:id            # Update appointment
DELETE /api/v1/appointments/:id            # Cancel appointment
GET    /api/v1/clinicians/:id/availability # Get clinician availability
POST   /api/v1/clinicians/:id/availability # Set availability
GET    /api/v1/appointments/slots          # Get open slots for booking

# Billing
GET    /api/v1/invoices                    # List invoices
POST   /api/v1/invoices                    # Create invoice
GET    /api/v1/invoices/:id                # Get invoice details
POST   /api/v1/invoices/:id/pay            # Process payment
GET    /api/v1/payments                    # List payments

# Telehealth
POST   /api/v1/telehealth/sessions         # Create session
GET    /api/v1/telehealth/sessions/:id     # Get session details
PUT    /api/v1/telehealth/sessions/:id     # Update session status
GET    /api/v1/telehealth/room/:room       # Get Jitsi room token

# Messaging
GET    /api/v1/conversations               # List conversations
POST   /api/v1/conversations               # Create conversation
POST   /api/v1/conversations/:id/messages  # Send message
GET    /api/v1/conversations/:id/messages  # Get messages
PUT    /api/v1/messages/:id/read           # Mark as read
POST   /api/v1/conversations/:id/typing    # Typing indicator

# AI
POST   /api/v1/ai/soap/generate           # Generate SOAP note
POST   /api/v1/ai/exercises/recommend     # Recommend exercises
POST   /api/v1/ai/assess/interpret        # Interpret assessment results
POST   /api/v1/ai/hep/generate            # Generate HEP
POST   /api/v1/ai/hep/progress            # Suggest progression
POST   /api/v1/ai/clinical/question       # Ask clinical AI
POST   /api/v1/ai/patient-education       # Generate patient education
POST   /api/v1/ai/follow-up               # Generate follow-up plan

# Analytics
GET    /api/v1/analytics/patients          # Patient statistics
GET    /api/v1/analytics/revenue           # Revenue analytics
GET    /api/v1/analytics/outcomes          # Outcome measure analytics
GET    /api/v1/analytics/productivity      # Clinician productivity

# Admin
GET    /api/v1/admin/organizations         # List organizations
POST   /api/v1/admin/organizations         # Create organization
PUT    /api/v1/admin/organizations/:id     # Update organization
GET    /api/v1/admin/clinicians            # List all clinicians
GET    /api/v1/admin/audit-logs            # Audit log search
```

## 6.3 Real-time Events (Supabase Realtime)

```
Channel: patient:{patient_id}
Events: assessment.updated, soap.signed, message.new, appointment.updated, hep.updated

Channel: clinician:{clinician_id}
Events: appointment.scheduled, message.new, patient.new_assessment, payment.received

Channel: organization:{org_id}
Events: clinician.joined, clinician.left, clinic.updated

Channel: appointment:{appointment_id}
Events: status.changed, telehealth.joined, telehealth.left

Channel: telehealth:{room_name}
Events: patient.joined, patient.left, session.ended
```

---

# 7. AI Architecture

## 7.1 Overall Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     AI Orchestration Layer                │
│  (LangGraph - multi-agent workflows)                     │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ SOAP    │  │ Exercise│  │ Assess- │  │ Clinical│    │
│  │ Agent   │  │ Agent   │  │ ment    │  │ CDS     │    │
│  │         │  │         │  │ Agent   │  │ Agent   │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │             │           │             │          │
│  ┌────┴─────────────┴───────────┴─────────────┴────┐    │
│  │              Shared Services                     │    │
│  │  ┌────────┐ ┌───────────┐ ┌──────────────────┐  │    │
│  │  │ Prompt │ │  RAG      │ │  Knowledge Graph  │  │    │
│  │  │ Mgr    │ │  Pipeline │ │  Query Engine     │  │    │
│  │  └────────┘ └───────────┘ └──────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                                                          │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│  ┌────────┐  ┌────────┐  ┌────────────┐  ┌──────────┐  │
│  │ Neo4j  │  │ pgvec- │  │ Supabase   │  │ Meili-   │  │
│  │ Graph  │  │ tor    │  │ PostgreSQL │  │ search   │  │
│  └────────┘  └────────┘  └────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 7.2 RAG Architecture

```
Document Sources:
├── Clinical guidelines (textbooks, protocols)
├── Research papers (PubMed)
├── Exercise library (descriptions, videos)
├── Assessment catalogs
├── Patient data (condition-appropriate)
└── Organization-specific protocols

Processing Pipeline:
1. Chunking (LlamaIndex)
   - Semantic chunking for clinical text
   - Recursive character splitting for structured data
   - Chunk size: 512 tokens (small for focused retrieval)
   - Overlap: 50 tokens

2. Embedding (OpenAI text-embedding-3-large)
   - Dimension: 1536 (with dimension reduction to 768)
   - Batch processing for exercise library
   - Re-embed on update

3. Indexing
   - Supabase pgvector tables
   - Metadata filtering (condition, body_region, exercise_type)
   - Auto-indexing via trigger functions

4. Retrieval
   - Hybrid search: vector similarity + full-text (Supabase tsvector)
   - Reranking: cross-encoder for top 20 results
   - Context assembly: top 5-10 most relevant chunks

5. Generation
   - Claude Sonnet 4 for clinical reasoning
   - GPT-4o for structured output generation
   - Custom system prompts per task type
```

## 7.3 Knowledge Graph Architecture

```
Built with: Neo4j + custom TypeScript pipelines

Entity Types:
├── Diagnosis (ICD-10 nodes)
├── Symptom
├── BodyPart
├── Exercise (linked to exercise IDs)
├── Assessment (linked to assessment IDs)
├── Protocol (linked to protocol IDs)
├── Modality (treatment modalities)
├── Medication
├── SpecialTest
├── Contraindication
├── ClinicalSign
├── OutcomeMeasure

Relationship Types:
├── INDICATED_FOR (exercise → diagnosis)
├── CONTRAINDICATED_FOR (exercise → diagnosis/condition)
├── PROGRESSES_TO (diagnosis → diagnosis)
├── PART_OF (exercise → protocol phase)
├── MEASURES (assessment → outcome)
├── TREATS (modality → symptom)
├── ASSOCIATED_WITH (symptom → diagnosis)
├── DIFFERENTIATES (special test → diagnosis)
├── STRENGTH_OF_EVIDENCE (relationship → evidence level)

GraphRAG Pattern:
1. User query → LLM extracts entities and intent
2. Knowledge Graph query via Cypher → relevant subgraph
3. Vector search on entity embeddings → similar concepts
4. Combine graph context + vector context → LLM generation
5. Response includes explanations with graph paths shown

Construction Pipeline:
├── Initial seed: domain expertise → entity extraction
├── Continuous: new exercises/assessments → auto-linking
├── Improvement: AI-generated relationship suggestions
└── Validation: clinician-in-the-loop for graph accuracy
```

## 7.4 AI Agents (LangGraph)

### SOAP Note Agent
```
Input: Visit notes (structured + free text)
Pipeline:
1. Classify visit type (initial eval vs follow-up)
2. Extract structured data (vitals, ROM, strength)
3. Generate Subjective section
4. Generate Objective section (from structured data)
5. Generate Assessment (clinical reasoning)
6. Generate Plan (treatment, exercises, follow-up)
7. Validate for completeness
8. Return structured SOAP JSON

Special Features:
- Voice input support (Whisper → text → SOAP)
- Previous visit context injection
- Diagnosis-specific template selection
- MCID-aware outcome interpretation
```

### Exercise Recommendation Agent
```
Input: Patient profile, condition, phase, goals, contraindications
Pipeline:
1. Query Knowledge Graph for condition-appropriate exercises
2. Filter by phase, contraindications, equipment availability
3. Rank by evidence level and patient-specific factors
4. Generate dosage parameters (sets, reps, frequency)
5. Apply clinical reasoning rules (flare-up management)
6. Return ranked exercise list with parameters

Special Features:
- Progression suggestion (when to advance)
- Substitution suggestion (if patient can't perform)
- Adherence prediction (flag exercises patient likely won't do)
```

### Assessment Interpretation Agent
```
Input: Assessment responses, patient history, normative data
Pipeline:
1. Calculate score (including sub-scores)
2. Compare to normative data (age/gender-adjusted)
3. Compare to previous scores (trend analysis)
4. Flag clinically significant changes (MCID-aware)
5. Generate interpretation paragraph
6. Suggest clinical actions based on results
```

## 7.5 Prompt Management

```
Using Langfuse for:
- Prompt versioning (v1, v2, v3)
- A/B testing of prompt variants
- Cost tracking per model
- Latency monitoring
- Feedback collection (thumbs up/down)
- Dataset curation for fine-tuning

Prompt Categories:
├── System Prompts (per agent role)
├── Task Prompts (per action type)
├── Few-shot Examples (per assessment/exercise type)
├── Validation Prompts (for output checking)
└── Patient-facing Prompts (education, instructions)
```

---

# 8. Security Architecture

## 8.1 Authentication

```
- Supabase Auth as primary auth provider
- Multi-factor authentication (TOTP)
- Social login (Google, Apple — coming soon)
- Magic link (passwordless) for patient portal
- Session management with refresh tokens
- JWT with custom claims (org_id, role, permissions)
- Rate limiting on auth endpoints (Upstash Redis)
```

## 8.2 Authorization (RBAC + RLS)

```
Permission Model:
├── Organization-level: admin, billing_admin
├── Clinic-level: clinic_admin, clinical_director
├── Clinician-level: pt, ot, chiro, slp, assistant
└── Patient-level: self (read own data)

Row-Level Security (Supabase):
├── patients: clinician sees own patients, admin sees all
├── assessments: org-scoped, public templates visible to all
├── soap_notes: author + patient's assigned clinicians + admin
├── billing: admin + billing_admin + authoring clinician
└── audit_logs: admin only

Permission Granularity (per action):
├── patient:read, patient:write, patient:delete
├── soap:read, soap:write, soap:sign, soap:delete
├── assessment:administer, assessment:interpret
├── billing:create, billing:read, billing:refund
├── schedule:read, schedule:write, schedule:delete
├── admin:users, admin:settings, admin:audit
└── ai:soap_generate, ai:exercise_recommend, ai:assess
```

## 8.3 Data Protection

```
HIPAA Considerations:
├── All PHI encrypted at rest (AES-256 via Supabase)
├── TLS 1.3 for all data in transit
├── Database encryption at rest (Supabase managed)
├── Storage encryption (S3 server-side)
├── Audit logging of all PHI access
├── Automatic session timeout (configurable)
├── Minimum 30-day audit retention
├── Data isolation per organization (PostgreSQL schemas)
├── BAA available (Supabase Business plan)
└── HIPAA compliance checklist maintained

API Security:
├── Rate limiting: 100 req/min per user (general), 10 req/min per AI endpoint
├── CORS: strict origin validation
├── CSRF: SameSite cookies
├── SQL injection: Prisma parameterized queries
├── XSS: React server components + Content Security Policy
├── Input validation: Zod schemas on all endpoints
└── API keys: service_role key restricted to server-side only
```

## 8.4 AI Safety

```
- Content filtering on AI outputs (moderation API)
- Clinician-in-the-loop for all AI-generated clinical content
- Confidence scoring on AI recommendations (< threshold → flag for review)
- Prompt injection prevention (input sanitization)
- Rate limiting on AI endpoints (cost control + abuse prevention)
- AI conversation audit trail (full prompt + response logged)
- Opt-out per clinician (can disable AI features)
```

---

# 9. Folder Structure

> Detailed enumeration of all source directories.

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                          # Dashboard shell (sidebar, header)
│   │   ├── page.tsx                            # Dashboard home / overview
│   │   ├── patients/
│   │   │   ├── page.tsx                        # Patient list
│   │   │   ├── new/page.tsx                    # New patient
│   │   │   ├── [id]/page.tsx                   # Patient detail
│   │   │   ├── [id]/edit/page.tsx              # Edit patient
│   │   │   ├── [id]/timeline/page.tsx          # Patient timeline
│   │   │   └── [id]/progress/page.tsx          # Outcome measures
│   │   ├── schedule/
│   │   │   ├── page.tsx                        # Calendar view
│   │   │   └── appointments/
│   │   │       └── [id]/page.tsx              # Appointment detail
│   │   ├── visits/
│   │   │   └── [id]/page.tsx                  # Visit detail + SOAP
│   │   ├── assessments/
│   │   │   ├── page.tsx                        # Assessment library
│   │   │   ├── [id]/page.tsx                   # Assessment detail/perform
│   │   │   └── new/page.tsx                    # Create assessment
│   │   ├── soap/
│   │   │   ├── page.tsx                        # SOAP note list
│   │   │   ├── new/[visitId]/page.tsx          # New SOAP note
│   │   │   └── [id]/page.tsx                   # SOAP note view
│   │   ├── exercises/
│   │   │   ├── page.tsx                        # Exercise library
│   │   │   ├── [id]/page.tsx                   # Exercise detail
│   │   │   └── new/page.tsx                    # Create exercise
│   │   ├── hep/
│   │   │   ├── page.tsx                        # HEP list
│   │   │   ├── [id]/page.tsx                   # HEP detail/edit
│   │   │   └── new/page.tsx                   # Create HEP
│   │   ├── protocols/
│   │   │   ├── page.tsx                        # Protocol library
│   │   │   ├── [id]/page.tsx                   # Protocol detail
│   │   │   └── new/page.tsx                   # Create protocol
│   │   ├── messages/
│   │   │   ├── page.tsx                        # Conversation list
│   │   │   └── [id]/page.tsx                   # Conversation view
│   │   ├── telehealth/
│   │   │   ├── page.tsx                        # Upcoming sessions
│   │   │   └── room/[id]/page.tsx              # Video call room
│   │   ├── billing/
│   │   │   ├── page.tsx                        # Invoice list
│   │   │   ├── [id]/page.tsx                   # Invoice detail
│   │   │   └── new/page.tsx                   # Create invoice
│   │   ├── analytics/
│   │   │   ├── page.tsx                        # Practice overview
│   │   │   ├── outcomes/page.tsx               # Outcome analytics
│   │   │   ├── revenue/page.tsx                # Revenue analytics
│   │   │   └── productivity/page.tsx           # Clinician productivity
│   │   └── settings/
│   │       ├── page.tsx                        # Profile settings
│   │       ├── clinic/page.tsx                 # Clinic settings
│   │       ├── organization/page.tsx           # Org settings
│   │       ├── billing/page.tsx                # Billing/subscription
│   │       ├── team/page.tsx                   # Team management
│   │       └── integrations/page.tsx           # API integrations
│   ├── layout.tsx                              # Root layout
│   └── globals.css                             # Tailwind + custom
├── components/
│   ├── ui/                                     # Shadcn UI generated
│   ├── forms/
│   │   ├── patient-form.tsx
│   │   ├── assessment-form.tsx
│   │   ├── soap-form.tsx
│   │   ├── exercise-form.tsx
│   │   └── appointment-form.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── dashboard-shell.tsx
│   │   └── app-shell.tsx
│   ├── patients/
│   │   ├── patient-card.tsx
│   │   ├── patient-list.tsx
│   │   ├── patient-timeline.tsx
│   │   └── patient-search.tsx
│   ├── assessments/
│   │   ├── assessment-card.tsx
│   │   ├── assessment-runner.tsx
│   │   ├── assessment-results.tsx
│   │   └── score-display.tsx
│   ├── soap/
│   │   ├── soap-editor.tsx
│   │   ├── soap-viewer.tsx
│   │   ├── ai-soap-generator.tsx
│   │   └── soap-section.tsx
│   ├── exercises/
│   │   ├── exercise-card.tsx
│   │   ├── exercise-player.tsx
│   │   ├── exercise-picker.tsx
│   │   └── exercise-filter.tsx
│   ├── hep/
│   │   ├── hep-viewer.tsx
│   │   ├── hep-builder.tsx
│   │   └── compliance-chart.tsx
│   ├── shared/
│   │   ├── data-table.tsx
│   │   ├── search-input.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-state.tsx
│   │   ├── error-state.tsx
│   │   └── confirm-dialog.tsx
│   └── ai/
│       ├── ai-panel.tsx                       # AI assistant side panel
│       ├── ai-suggestion.tsx                   # Inline AI suggestions
│       ├── ai-feedback.tsx                     # Feedback widget
│       └── confidence-badge.tsx               # AI confidence indicator
├── lib/
│   ├── supabase/
│   │   ├── client.ts                           # Supabase client
│   │   ├── server.ts                           # Server-side client
│   │   ├── admin.ts                            # Admin client (service_role)
│   │   ├── queries/
│   │   │   ├── patients.ts
│   │   │   ├── assessments.ts
│   │   │   ├── soap.ts
│   │   │   ├── exercises.ts
│   │   │   └── appointments.ts
│   │   └── mutations/
│   ├── ai/
│   │   ├── client.ts                           # AI API client
│   │   ├── soap-generator.ts                   # SOAP generation
│   │   ├── exercise-recommender.ts             # Exercise recommendations
│   │   ├── assessment-interpreter.ts           # Assessment interpretation
│   │   └── clinical-assistant.ts              # Clinical Q&A
│   ├── utils/
│   │   ├── cn.ts                               # Classname utility
│   │   ├── date.ts                             # Date formatting
│   │   ├── permissions.ts                      # Permission checking
│   │   └── formatters.ts                      # Currency, phone, etc.
│   └── constants/
│       ├── assessment-categories.ts
│       ├── body-regions.ts
│       └── exercise-equipment.ts
└── middleware.ts                                # Auth middleware
```

---

# 10. Coding Standards

## 10.1 TypeScript

```typescript
// STRICT MODE ENABLED
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "strictNullChecks": true
  }
}
```

## 10.2 Naming Conventions

```
Files: kebab-case (patient-list.tsx, assessment-runner.tsx)
Components: PascalCase (PatientList, AssessmentRunner)
Functions: camelCase (getPatient, createAssessment)
Constants: UPPER_SNAKE_CASE (MAX_SESSION_DURATION)
Types/Interfaces: PascalCase (PatientData, AssessmentResult)
Props interfaces: ComponentName + Props (PatientListProps)
Database columns: snake_case (first_name, created_at)
API routes: kebab-case (/patients/:id/soap-notes)
Environment variables: UPPER_SNAKE_CASE (NEXT_PUBLIC_SUPABASE_URL)
```

## 10.3 Component Architecture

```typescript
// Each component gets:
// 1. TypeScript interface for props
// 2. Named export (no default exports)
// 3. Co-located types

interface PatientCardProps {
  patient: PatientSummary;
  onSelect: (id: string) => void;
  className?: string;
}

export function PatientCard({ patient, onSelect, className }: PatientCardProps) {
  return (
    <button
      onClick={() => onSelect(patient.id)}
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4",
        "hover:bg-accent transition-colors",
        className
      )}
    >
      <Avatar src={patient.avatarUrl} fallback={patient.initials} />
      <div>
        <p className="font-medium">{patient.fullName}</p>
        <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
      </div>
    </button>
  );
}
```

## 10.4 Server Actions

```typescript
// Server Actions in app/_actions/
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function createPatient(formData: FormData) {
  const data = createPatientSchema.parse(Object.fromEntries(formData));
  const supabase = await createServerClient();
  
  const { data: patient, error } = await supabase
    .from('patients')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/patients');
  return patient;
}
```

## 10.5 Database Access Patterns

```typescript
// Supabase queries in lib/supabase/queries/
// Always typed, always filtered by organization

export async function getPatients(supabase: TypedSupabaseClient, orgId: string) {
  return supabase
    .from('patients')
    .select('id, first_name, last_name, diagnosis_codes, status, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
}

// RLS handles org isolation — never filter by org_id manually
// unless the RLS policy can't infer it from the JWT
```

---

# 11. Testing Strategy

## 11.1 Test Pyramid

```
        ╱──────╲
       ╱  E2E   ╲         < 5% — Critical user journeys
      ╱──────────╲
     ╱            ╲
    ╱ Integration  ╲     < 20% — API routes, server actions, DB queries
   ╱────────────────╲
  ╱                  ╲
 ╱   Unit Tests       ╲   > 75% — Components, utils, hooks, AI logic
╱──────────────────────╲
```

## 11.2 Test Tools

```
Category          │ Tool                │ Purpose
──────────────────┼─────────────────────┼────────────────────────────
Unit Testing      │ Vitest              │ Fast, TypeScript-native
React Testing     │ React Testing Library│ Component behavior tests
E2E Testing       │ Playwright          │ Browser-based journey tests
API Testing       │ Supertest + Vitest  │ API route testing
DB Testing        │ Supabase local      │ Database query tests
Visual Testing    │ Percy / Storybook   │ Visual regression
AI Testing        │ Custom eval suite   │ AI output quality tests
```

## 11.3 Coverage Targets

```
- Branches: 80%
- Functions: 85%
- Lines: 85%
- Statements: 85%

Critical paths requiring 100% coverage:
- Auth middleware
- PHI access controls
- Payment processing
- AI-generated content validation
- Emergency contact lookups
```

## 11.4 Test Structure

```typescript
// Co-located tests: *.test.ts next to source files
// E2E tests: apps/web/e2e/

// Example component test
describe('PatientCard', () => {
  it('renders patient name and diagnosis', () => {
    render(<PatientCard patient={mockPatient} onSelect={vi.fn()} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('ACL Reconstruction')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    render(<PatientCard patient={mockPatient} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockPatient.id);
  });
});

// E2E test example
test('clinician creates SOAP note', async ({ page }) => {
  await page.goto('/patients/123/visits/456/soap');
  await page.click('[data-testid="ai-generate-soap"]');
  await expect(page.locator('[data-testid="soap-editor"]')).toBeVisible();
  await expect(page.locator('.subjective-section')).not.toBeEmpty();
});
```

---

# 12. CI/CD Pipeline

## 12.1 GitHub Actions Workflows

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm test -- --coverage
      - uses: codecov/codecov-action@v4

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with: { name: build, path: apps/web/.next }

  # E2E tests run in parallel on multiple browsers
  e2e:
    runs-on: ubuntu-latest
    needs: build
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - uses: actions/download-artifact@v4
        with: { name: build, path: apps/web/.next }
      - run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      - run: pnpm test:e2e -- --project=${{ matrix.browser }}
```

## 12.2 Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      
      # Deploy to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 12.3 Branch Strategy

```
main ──── Production (Vercel production)
  └── develop ── Staging (Vercel preview)
       └── feature/* ── Feature branches (Vercel preview per branch)
```

---

# 13. Deployment Strategy

## 13.1 Vercel Deployment

```
apps/web/ → Vercel (production + preview deploys)
- Server Components (Next.js) → Edge/Serverless functions
- Static assets → Vercel Edge Network (CDN)
- API Routes → Serverless functions
- ISR for catalog pages (exercises, assessments)
- SSG for public pages (landing, docs)

Environment Variables (Vercel):
├── NEXT_PUBLIC_SUPABASE_URL
├── NEXT_PUBLIC_SUPABASE_ANON_KEY
├── SUPABASE_SERVICE_ROLE_KEY
├── OPENAI_API_KEY
├── ANTHROPIC_API_KEY
├── STRIPE_SECRET_KEY
├── STRIPE_PUBLISHABLE_KEY
├── RESEND_API_KEY
├── SENTRY_DSN
├── NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
├── MEILISEARCH_URL, MEILISEARCH_API_KEY
└── NEXT_PUBLIC_POSTHOG_KEY
```

## 13.2 Supabase Infrastructure

```
Project: rehabos-ai (dedicated Supabase project)

Database:
├── PostgreSQL 16
├── pgvector extension
├── Supabase Auth (built-in)
├── Supabase Storage (S3 buckets)
│   ├── exercise-videos
│   ├── exercise-images
│   ├── patient-documents
│   ├── assessment-images
│   └── clinician-uploads
├── Supabase Realtime (WebSocket)
│   ├── patient channel
│   ├── clinician channel
│   └── organization channel
└── Supabase Edge Functions (for webhooks)
```

## 13.3 Docker-Compose (Local Development)

```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  meilisearch:
    image: getmeili/meilisearch:v1.10
    ports: ['7700:7700']
    environment:
      MEILI_MASTER_KEY: dev-key
      MEILI_NO_ANALYTICS: true
    volumes: ['meili_data:/meili_data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    
  neo4j:
    image: neo4j:5-enterprise
    ports: ['7474:7474', '7687:7687']
    environment:
      NEO4J_AUTH: neo4j/dev-password
      NEO4J_ACCEPT_LICENSE_AGREEMENT: yes
    volumes: ['neo4j_data:/data']
    
  jitsi:
    image: jitsi/web:stable
    ports: ['8443:443']
    # Jitsi is complex to run locally - use cloud or otp

volumes:
  meili_data:
  neo4j_data:
```

## 13.4 Cloud Services

```
Service           │ Purpose                    │ Plan
──────────────────┼────────────────────────────┼──────────────────
Supabase          │ Database, Auth, Storage    │ Pro ($25/mo)
Vercel            │ Hosting                    │ Pro ($20/mo)
Neo4j AuraDB      │ Knowledge Graph            │ Free tier → Professional
Meilisearch Cloud │ Search                     │ Self-hosted (cheaper)
Upstash           │ Redis + Rate Limiting      │ Free tier
OpenAI            │ LLM + Embeddings           │ Pay-as-you-go
Claude (Anthropic)│ Clinical LLM                │ Pay-as-you-go
Resend            │ Email                      │ Free tier (100/day)
Stripe            │ Payments                   │ 2.9% + $0.30
Xendit            │ PH Payments                │ Per-transaction
Sentry            │ Error Tracking             │ Free tier → Team
PostHog           │ Analytics                  │ Self-hosted (free)
Langfuse          │ Prompt Management          │ Self-hosted (OSS)
Mux               │ Video Processing (optional)│ Pay-as-you-go
Cloudflare        │ DNS + CDN + DDoS           │ Free
```

---

# 14. Backup & Disaster Recovery

## 14.1 Database Backup

```
Supabase provides:
├── Daily automated backups (Pro plan)
├── Point-in-time recovery (7 days)
├── Manual backup via pg_dump
└── Database branching (for staging/testing)

Additional protection:
├── Weekly pg_dump to secure cloud storage
├── Schema migrations in Git (Prisma migrations)
├── Seed data scripts for rebuilding fresh
└── RLS policies backed up as SQL
```

## 14.2 Storage Backup

```
Supabase Storage is S3-compatible:
├── Cross-region replication (via Supabase)
├── Bucket-level lifecycle policies
├── Versioning enabled on critical buckets
└── Periodic sync to secondary S3 bucket
```

## 14.3 Disaster Recovery Plan

```
Tier 1 — Minor Incident (single user issue):
├── Restore from Supabase point-in-time recovery
├── Rollback Vercel deployment
└── Clear Redis cache

Tier 2 — Major Incident (data corruption):
├── Restore from daily automated backup
├── Replay transactions from audit logs
└── Notify affected users

Tier 3 — Catastrophic (region failure):
├── Promote standby region
├── Restore from cross-region backup
├── Update DNS (Cloudflare)
└── Estimated RTO: 4 hours, RPO: 24 hours

Regular drills:
├── Monthly backup restore test
├── Quarterly DR simulation
└── Automated backup integrity checks
```

---

# 15. UI Design System & Wireframes

## 15.1 Design Principles

```
1. Minimal & Clean — Reduce cognitive load. Whitespace is a feature.
2. Data-Dense — Show clinicians what they need, when they need it.
3. AI-First — AI suggestions are inline, not in a separate panel.
4. Keyboard-Navigable — Clinicians type fast; every action has a shortcut.
5. Responsive — Works on desktop (primary) and tablet (on-the-go).
6. Dark Mode — Default. Clinicians work in dimly lit rooms.
7. Fast — Sub-100ms page transitions. Optimistic updates everywhere.
```

## 15.2 Color Palette

```
Background: #0a0a0b (dark) / #ffffff (light)
Surface:    #18181b / #fafafa
Border:     #27272a / #e4e4e7
Primary:    #3b82f6 (blue-500)
Secondary:  #8b5cf6 (violet-500)
Success:    #22c55e (green-500)
Warning:    #f59e0b (amber-500)
Danger:     #ef4444 (red-500)
Muted:      #71717a / #a1a1aa

Text:
├── Primary:   #fafafa / #18181b
├── Secondary: #a1a1aa / #52525b
└── Muted:     #52525b / #a1a1aa
```

## 15.3 Layout Wireframes

```
Dashboard Layout (Clinician Web):
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Search Patients...]  [Notifications] [Avatar ▼]   │
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│ NAV    │   MAIN CONTENT AREA                                │
│        │                                                     │
│ ☑ Patients│  ┌─────────────────────────────────────────┐     │
│ ☐ Today  │  │  Today's Schedule (compact list)         │     │
│ ☐ Schedule│  └─────────────────────────────────────────┘     │
│ ☐ Visits │  ┌─────────────────────────────────────────┐     │
│ ☐ SOAP   │  │  Patient Alerts / Flags                 │     │
│ ☐ Library│  └─────────────────────────────────────────┘     │
│ ☐ HEPs   │  ┌─────────────────────────────────────────┐     │
│ ☐ Billing│  │  Recent Activity                         │     │
│ ☐ Analytics│ │  - John D. - SOAP signed (2m ago)      │     │
│ ☐ Messages│ │  - Sarah M. - HEP completed (1h ago)    │     │
│ ☐ Settings│ └─────────────────────────────────────────┘     │
│        │                                                     │
│        │  ⚡ AI Assistant (collapsible right panel)          │
└────────┴────────────────────────────────────────────────────┘

Patient Detail Page:
┌─────────────────────────────────────────────────────────────┐
│ ← Patients  /  John Doe  (34M)  [Edit] [Schedule]          │
├─────────────────────────────────────────────────────────────┤
│ Status: Active  |  Primary: ACL Recon (Left) | Eval 1/12   │
├────────┬───────────────────────────────┬────────────────────┤
│        │                               │                     │
│ PROFILE│  PATIENT TIMELINE             │  AI INSIGHTS        │
│ ───────│  ┌────────────────────────┐   │  ┌────────────────┐ │
│ Age: 34│  │ 📅 Today               │   │  │ Risk: Low      │ │
│ Dx: ACL│  │ SOAP note created      │   │  │ Adherence: 85% │ │
│ Surgeon│  │  - Chief: "pain 3/10"  │   │  │ Next: Progression│ │
│ ...    │  │  - ROM: 0-115°         │   │  │ Suggested      │ │
│        │  └────────────────────────┘   │  └────────────────┘ │
│ QUICK  │  ┌────────────────────────┐   │  ┌────────────────┐ │
│ ACTIONS│  │ 📅 Yesterday           │   │  │ Recent HEP     │ │
│ ├─ New │  │ HEP compliance: 4/6    │   │  │ ┌────────────┐ │ │
│ │ Visit │  │ - Quad sets: 3x10 ✓   │   │  │ │ Week 3     │ │
│ ├─ SOAP│  │ - SLR: 3x10 ✓         │   │  │ │ Phase 2    │ │
│ ├─ HEP │  │ - Heel slides: 2x10 ✗ │   │  │ │ 📊 60% done│ │
│ ├─ Bill│  └────────────────────────┘   │  └────────────────┘ │
│ └─ Msg │  ┌────────────────────────┐   │                     │
│        │  │ 📅 Last week           │   │                     │
│        │  │ Outcome: LEFS 45→52    │   │                     │
│        │  └────────────────────────┘   │                     │
└────────┴───────────────────────────────┴────────────────────┘

SOAP Note Editor:
┌─────────────────────────────────────────────────────────────┐
│ SOAP Note — Visit #4 — John Doe  [Save] [Sign] [AI ✨]     │
├─────────────────────────────────────────────────────────────┤
│ [S] Subjective                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Chief Complaint: Pain in left knee, 3/10 today         │  │
│ │ HPI: [AI suggests] Patient reports...                  │  │
│ │   Pain level: [3] [⏺ Voice input]                     │  │
│ └────────────────────────────────────────────────────────┘  │
│ [O] Objective                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ROM: Extension 0° Flexion 115°                         │  │
│ │ Strength: Quad 4/5, Hamstring 4/5                     │  │
│ │ Special Tests: Lachman -, Pivot Shift -                │  │
│ └────────────────────────────────────────────────────────┘  │
│ [A] Assessment                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🤖 AI Generated: Patient is progressing well...        │  │
│ │ [Accept] [Edit] [Regenerate]                           │  │
│ └────────────────────────────────────────────────────────┘  │
│ [P] Plan                                                    │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Continue HEP Phase 2. Progress to... [AI Suggest ▼]    │  │
│ │ Follow-up: 1 week                                      │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

# 16. Milestones & Roadmap

## Phase 0 — Foundation (Weeks 1-3)

**Goal:** Monorepo scaffold, database, auth, deployment pipelines

**Deliverables:**
- [ ] Turborepo monorepo with pnpm workspaces
- [ ] Next.js 15 app with App Router + TypeScript strict mode
- [ ] TailwindCSS + Shadcn UI + dark mode
- [ ] Supabase project setup (database, auth, storage)
- [ ] Prisma schema with core entities (organizations, clinicians, patients)
- [ ] Supabase RLS policies
- [ ] Auth flow (login, signup, forgot password, MFA)
- [ ] Meilisearch setup + indexing
- [ ] CI/CD pipelines (GitHub Actions → Vercel)
- [ ] Sentry error tracking
- [ ] PostHog analytics
- [ ] Docker compose for local dev
- [ ] Documentation site (Mintlify)

**AI Tasks:** 12 tasks

## Phase 1 — Core Clinical (Weeks 4-7)

**Goal:** Patient management, visit tracking, SOAP notes

**Deliverables:**
- [ ] Patient CRUD with search (Meilisearch)
- [ ] Patient dashboard with timeline
- [ ] Visit management (check-in, status tracking)
- [ ] SOAP note editor (TipTap with custom sections)
- [ ] SOAP note PDF export
- [ ] SOAP note signing workflow
- [ ] Basic AI SOAP note generation (OpenAI)
- [ ] Voice-to-text for SOAP (Whisper)
- [ ] Patient search (global Meilisearch)
- [ ] Audit logging

**AI Tasks:** 25 tasks

## Phase 2 — Assessment Engine (Weeks 8-11)

**Goal:** Assessment catalog, administration, AI interpretation

**Deliverables:**
- [ ] Assessment catalog (built-in standardized assessments)
- [ ] Assessment builder (create custom assessments)
- [ ] Assessment administration UI (question runner)
- [ ] Auto-scoring engine
- [ ] Normative data comparison
- [ ] Assessment results visualization (Recharts)
- [ ] AI interpretation of results
- [ ] Outcome measure tracking over time
- [ ] MCID-aware progress flags

**AI Tasks:** 18 tasks

## Phase 3 — Exercise Library & HEP (Weeks 12-15)

**Goal:** Exercise library, HEP builder, patient mobile app

**Deliverables:**
- [ ] Exercise catalog (categories, body regions, equipment)
- [ ] Exercise search + filter (Meilisearch)
- [ ] Exercise detail page with video/image
- [ ] HEP builder UI (drag-and-drop exercises)
- [ ] AI exercise recommendation
- [ ] AI HEP generation from diagnosis + phase
- [ ] Patient mobile app (Expo) — exercise viewer
- [ ] Patient mobile app — HEP compliance logging
- [ ] Compliance tracking + charts
- [ ] AI progression engine (suggest advancement)

**AI Tasks:** 22 tasks

## Phase 4 — Scheduling & Messaging (Weeks 16-18)

**Goal:** Appointment scheduling, telehealth, messaging

**Deliverables:**
- [ ] Cal.diy integration (availability, booking)
- [ ] Calendar view (Schedule-X)
- [ ] Appointment management (CRUD, status)
- [ ] Automated reminders (email, push)
- [ ] Jitsi telehealth integration
- [ ] Telehealth session management
- [ ] Secure messaging (patient-clinician)
- [ ] Message attachments (images, documents)
- [ ] Push notifications (Expo)

**AI Tasks:** 15 tasks

## Phase 5 — Clinical Decision Support (Weeks 19-21)

**Goal:** Knowledge Graph, AI CDS, protocol engine

**Deliverables:**
- [ ] Neo4j knowledge graph setup
- [ ] Entity extraction pipeline (exercises, diagnoses, symptoms)
- [ ] Relationship building (indications, contraindications)
- [ ] GraphRAG query engine
- [ ] Protocol builder (phases, criteria, exercises)
- [ ] Protocol assignment to patients
- [ ] AI clinical question answering
- [ ] AI protocol recommendation
- [ ] Contraindication checking
- [ ] AI follow-up assistant

**AI Tasks:** 20 tasks

## Phase 6 — Billing & Practice Management (Weeks 22-24)

**Goal:** Invoicing, payments, analytics, admin

**Deliverables:**
- [ ] Invoice generation (from visits)
- [ ] Stripe payment integration
- [ ] Xendit payment integration (PH market)
- [ ] Payment reconciliation
- [ ] Insurance claim preparation
- [ ] CPT/HCPCS code management
- [ ] Revenue analytics dashboard
- [ ] Clinician productivity analytics
- [ ] Outcome analytics (by diagnosis, clinician, clinic)
- [ ] Admin dashboard (org management, user management)

**AI Tasks:** 15 tasks

## Phase 7 — Marketplace & Referrals (Weeks 25-26)

**Goal:** Referral network, marketplace, integrations

**Deliverables:**
- [ ] Referral network (clinician → clinician)
- [ ] Referral tracking (status, outcome)
- [ ] Referral intelligence (AI matching)
- [ ] Exercise library marketplace (community exercises)
- [ ] Template marketplace (protocols, assessments)
- [ ] API for third-party integrations
- [ ] Webhook system

**AI Tasks:** 8 tasks

## Phase 8 — Polish & Scale (Weeks 27-30)

**Goal:** Performance, security audit, compliance, launch prep

**Deliverables:**
- [ ] Performance audit (Lighthouse, Core Web Vitals)
- [ ] Security audit (penetration testing)
- [ ] HIPAA compliance documentation
- [ ] Load testing (k6)
- [ ] PWA optimization (offline support)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Internationalization (i18n framework)
- [ ] Documentation completion
- [ ] Beta launch
- [ ] Production launch

**AI Tasks:** 10 tasks

---

# 17. Architecture Decision Records (ADRs)

## ADR-001: Monorepo with Turborepo

**Status:** Accepted

**Context:** We need to manage multiple apps (web, mobile, admin) and packages (AI, database, shared UI) in a single repository. Developer experience, build caching, and dependency management are critical.

**Decision:** Use Turborepo with pnpm workspaces.

**Consequences:**
- Build caching speeds up CI significantly
- Single dependency tree (no version drift)
- Shared TypeScript configs across all packages
- Slightly more complex local setup (pnpm install at root)
- All packages must use compatible TypeScript versions

---

## ADR-002: Supabase for Database + Auth + Storage

**Status:** Accepted

**Context:** We need PostgreSQL, authentication, file storage, and real-time capabilities. Managing these separately adds operational overhead.

**Decision:** Use Supabase as the integrated platform.

**Consequences:**
- Reduces infrastructure complexity (one provider)
- Row-Level Security built into the database layer
- Realtime subscriptions without additional infrastructure
- Vendor lock-in risk mitigated by using standard PostgreSQL
- BAA available for HIPAA compliance

---

## ADR-003: Custom Internal Models over FHIR

**Status:** Accepted

**Context:** FHIR is the healthcare data standard, but it adds abstraction overhead. Our assessment engine, knowledge graph, and AI pipelines don't map cleanly to FHIR resources.

**Decision:** Use custom normalized database models optimized for our AI workflows. Provide FHIR export as an adapter/integration layer.

**Consequences:**
- Faster development velocity
- Better AI pipeline performance
- Need to build FHIR export adapter
- Need to map custom models to FHIR for interoperability
- Reduced complexity in database queries

---

## ADR-004: LangGraph + LlamaIndex for AI Pipeline

**Status:** Accepted

**Context:** We need multi-step AI workflows (SOAP generation, assessment interpretation, exercise recommendation) with reliable retrieval and structured output.

**Decision:** Use LangGraph for agent workflows and LlamaIndex for RAG.

**Consequences:**
- LangGraph provides state machine pattern for multi-step AI
- LlamaIndex handles chunking, embedding, and retrieval
- Two frameworks to learn instead of one
- Better separation of concerns (agent logic vs. retrieval)
- Both are well-maintained with active communities

---

## ADR-005: Neo4j for Knowledge Graph

**Status:** Accepted

**Context:** Our clinical knowledge graph requires relationship-rich queries (indications, contraindications, progressions) that are inefficient in relational databases.

**Decision:** Use Neo4j as the knowledge graph database.

**Consequences:**
- Natural representation of clinical relationships
- Cypher queries are expressive for graph traversal
- Additional infrastructure to manage
- Neo4j AuraDB provides managed hosting
- Embedding + graph hybrid search via GraphRAG

---

## ADR-006: Meilisearch for Full-Text Search

**Status:** Accepted

**Context:** We need fast, typo-tolerant search across patients, exercises, assessments, and notes.

**Decision:** Use Meilisearch over PostgreSQL full-text search or Typesense.

**Consequences:**
- Near-instant search (<50ms) even with large datasets
- Typo tolerance out of the box
- Simple REST API
- Additional service to self-host (~256MB RAM)
- Supabase full-text search as fallback for simple queries

---

## ADR-007: Cal.diy for Scheduling

**Status:** Accepted

**Context:** Building a scheduling system from scratch is complex (availability, timezone handling, recurring rules, booking pages, calendar sync).

**Decision:** Use Cal.diy (MIT fork of Cal.com) as the scheduling engine.

**Consequences:**
- Mature scheduling infrastructure (availability, booking, reminders)
- MIT licensed (no proprietary restrictions)
- Can embed booking pages in our app
- Need to maintain fork/upstream merge cadence
- Cal.diy has fewer features than Cal.com (intentionally)

---

## ADR-008: Jitsi for Telehealth

**Status:** Accepted

**Context:** We need HIPAA-compatible video consultations with screen sharing, recording, and multi-party support.

**Decision:** Use Jitsi Meet on self-hosted infrastructure.

**Consequences:**
- Full control over video infrastructure
- HIPAA-compatible when self-hosted
- Integrates via iframe API or custom React wrapper
- Requires server infrastructure (can use Jitsi as a Service)
- Mature, well-tested in healthcare contexts

---

## ADR-009: Expo for Patient Mobile App

**Status:** Accepted

**Context:** Patients need a mobile app to view exercises, log compliance, communicate, and track progress. Must work offline and on both iOS and Android.

**Decision:** Use Expo (React Native) with Expo Router.

**Consequences:**
- Single codebase for iOS + Android
- Over-the-air updates (Expo Updates)
- Offline support via SQLite + Legend State
- Native module access when needed (camera, push notifications)
- Larger bundle size than native

---

## ADR-010: Zod for Validation Everywhere

**Status:** Accepted

**Context:** We need consistent validation across client, server, and API boundaries.

**Decision:** Use Zod as the single validation source of truth. Types are inferred from Zod schemas.

**Consequences:**
- Single schema definition → inferred TypeScript types
- Runtime validation + compile-time type safety
- Works with React Hook Form for forms
- Works with Server Actions for API validation
- Eliminates type drift between client and server

---

# 18. Claude Code Implementation Tasks

> Each task is independently executable by Claude Code (print mode).
> Tasks are organized by module and ordered by dependency.

## Phase 0: Foundation Tasks

### T001: Initialize Monorepo
```
Goal: Set up Turborepo monorepo with pnpm workspaces
Dependencies: None
Files:
- package.json (root)
- pnpm-workspace.yaml
- turbo.json
- .gitignore
- tsconfig/base.json
Acceptance Criteria:
- pnpm install works at root
- Turborepo cache works
- All workspace paths configured
```

### T002: Configure TypeScript Strict Mode
```
Goal: Set up TypeScript config with strict mode for all apps/packages
Dependencies: T001
Files:
- packages/config/typescript/base.json
- packages/config/typescript/nextjs.json
- apps/web/tsconfig.json
Acceptance Criteria:
- Strict mode enabled (noUncheckedIndexedAccess, exactOptionalPropertyTypes)
- All workspace tsconfigs extend base
- pnpm typecheck passes on empty project
```

### T003: Scaffold Next.js Web App
```
Goal: Create the main web app with Next.js 15, TailwindCSS, Shadcn UI
Dependencies: T001, T002
Files:
- apps/web/package.json
- apps/web/next.config.ts
- apps/web/app/layout.tsx
- apps/web/app/globals.css
- apps/web/components/ui/ (shadcn generated)
- apps/web/tailwind.config.ts
Acceptance Criteria:
- pnpm build succeeds for apps/web
- Dark mode toggle works
- Shadcn UI components render
- Tailwind classes apply correctly
```

### T004: Set Up Supabase Project
```
Goal: Create Supabase project, initialize schema with Prisma
Dependencies: T001
Files:
- packages/database/prisma/schema.prisma (initial: orgs, clinicians, patients)
- packages/database/package.json
- packages/database/tsconfig.json
- supabase/config.toml
Acceptance Criteria:
- Prisma generates types
- Supabase local or remote connection works
- Migrations run successfully
- Basic RLS policies in place
```

### T005: Implement Auth Flow
```
Goal: Login, signup, forgot password, MFA with Supabase Auth
Dependencies: T003, T004
Files:
- apps/web/middleware.ts
- apps/web/app/(auth)/login/page.tsx
- apps/web/app/(auth)/signup/page.tsx
- apps/web/app/(auth)/forgot-password/page.tsx
- apps/web/lib/supabase/client.ts
- apps/web/lib/supabase/server.ts
- apps/web/lib/supabase/admin.ts
Acceptance Criteria:
- User can sign up with email/password
- User can log in
- Protected routes redirect to login
- Session persists across page loads
- MFA setup flow works
```

### T006: Implement RBAC
```
Goal: Role and permission system, RLS policies
Dependencies: T004, T005
Files:
- packages/database/prisma/schema.prisma (roles, permissions tables)
- packages/database/rls/*.sql
- apps/web/lib/permissions.ts
- apps/web/middleware.ts (with role checks)
Acceptance Criteria:
- Roles created (admin, clinician, billing_admin, front_desk)
- RLS policies prevent cross-org data access
- Permission checks work in UI and API
- Admin can assign roles
```

### T007: Set Up CI/CD
```
Goal: GitHub Actions for CI (lint, typecheck, test, build) + Vercel deploy
Dependencies: T003
Files:
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
Acceptance Criteria:
- CI runs on PR
- All checks pass (lint, typecheck, test, build)
- Vercel deploys on main push
- Preview deploys on PR
```

### T008: Set Up Sentry + PostHog
```
Goal: Error tracking and analytics
Dependencies: T003
Files:
- apps/web/sentry.client.config.ts
- apps/web/sentry.server.config.ts
- apps/web/app/providers/posthog-provider.tsx
Acceptance Criteria:
- Errors captured in Sentry dashboard
- Page views tracked in PostHog
- Custom events fire correctly
```

### T009: Set Up Meilisearch
```
Goal: Self-hosted or cloud Meilisearch for full-text search
Dependencies: T004
Files:
- docker/docker-compose.yml (meilisearch service)
- packages/api/search/client.ts
- packages/api/search/indexer.ts (for Supabase sync)
Acceptance Criteria:
- Meilisearch service running in Docker
- Supabase → Meilisearch sync on data changes
- Basic search query returns results
```

### T010: Docker Compose for Local Dev
```
Goal: Docker compose for local development services
Dependencies: T009
Files:
- docker/docker-compose.yml
- docker/Dockerfile.web
- docker/.env.example
Acceptance Criteria:
- docker compose up starts all services
- App connects to local services
- Data persists across restarts
```

### T011: Initialize Documentation Site
```
Goal: Developer documentation with Mintlify
Dependencies: None
Files:
- docs/ (Mintlify structure)
- docs/mint.json
- docs/README.md
Acceptance Criteria:
- Docs site renders
- Architecture docs published
- API docs generated from code
```

---

> **Full task list continues in `CLAUDE_TASKS.md` with 145+ additional tasks across all 8 phases.**
> Due to the length, I've shown Phase 0 tasks inline above as examples. The complete task file follows.

---

# 19. API Contracts

> Detailed OpenAPI/Swagger specification for all endpoints.
> Full spec at `docs/api/openapi.yaml` (generated from Zod schemas).

### Key Contracts:

**Patient Response:**
```typescript
{
  id: string;                    // UUID
  organizationId: string;        // UUID
  clinicId?: string;            // UUID
  clinicianId: string;          // UUID
  firstName: string;
  lastName: string;
  dateOfBirth: string;          // ISO date
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  email?: string;
  diagnosisCodes: string[];     // ICD-10 codes
  status: 'active' | 'inactive' | 'discharged' | 'archived' | 'transferred';
  tags: string[];
  createdAt: string;            // ISO datetime
  updatedAt: string;            // ISO datetime
}
```

**SOAP Note Response:**
```typescript
{
  id: string;
  visitId: string;
  patientId: string;
  clinicianId: string;
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    painLevel?: number;
    aggravatingFactors?: string;
    easingFactors?: string;
    patientGoals?: string;
  };
  objective: {
    vitals?: Record<string, number>;
    rangeOfMotion?: Record<string, { left?: number; right?: number }>;
    strengthTesting?: Record<string, number>;
    specialTests?: Array<{ name: string; result: string; notes?: string }>;
  };
  assessment: {
    clinicalImpression: string;
    diagnosis: string;
    progressTowardGoals: string;
  };
  plan: {
    treatmentPlan: string;
    exercises: Array<{ exerciseId: string; parameters: Record<string, string> }>;
    followUp: string;
  };
  status: 'draft' | 'completed' | 'signed' | 'amended';
  aiGenerated: boolean;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

# 20. Monitoring & Observability

## 20.1 Metrics to Track

```
Performance:
├── P95 API response time (<200ms target)
├── P95 page load time (<1s target)
├── LCP (<2.5s target)
├── AI inference latency (per model)
├── Database query time (P95 <50ms)
└── Search query time (<50ms)

Business:
├── Active patients per clinician
├── SOAP notes created per day
├── HEP compliance rate
├── Appointment no-show rate
├── Revenue per clinician
├── Outcome measure completion rate
└── Patient acquisition rate

AI Quality:
├── AI acceptance rate (% of AI suggestions accepted)
├── AI generation time
├── AI cost per note/generation
├── AI feedback ratings (1-5)
└── AI error rate
```

## 20.2 Alerting Thresholds

```
Critical (Pager):
├── API error rate > 5%
├── Database connection failures
├── Payment processing failures
├── AI service unavailable
└── Authentication failures > 10% of attempts

Warning (Slack):
├── API P95 latency > 500ms
├── Database CPU > 80%
├── Storage usage > 80%
├── AI token usage per day > $100 (early warning)
└── Failed search syncs

Info (Dashboard):
├── New user signups
├── Daily active users
├── Feature adoption rates
└── Monthly recurring revenue
```

## 20.3 Dashboard Views

```
Executive Dashboard:
├── MRR / ARR
├── Active patients (trend)
├── Active clinicians (trend)
├── Appointments completed (daily)
├── Top diagnoses by volume
├── Average outcome improvement
└── AI feature adoption

Technical Dashboard:
├── API error rate (by endpoint)
├── P95 latencies
├── Database connections
├── AI costs (daily, per model)
├── Sentry errors (by severity)
├── Vercel function invocations
└── Meilisearch query volume
```

---

# Next Steps

1. **Review this architecture document** — All sections are open for feedback
2. **Approve open-source selections** — Confirm or suggest alternatives
3. **Prioritize milestone order** — Adjust phase ordering to business needs
4. **Begin Phase 0 implementation** — Once architecture is approved, Claude Code will execute the foundation tasks

The complete implementation task list (145+ tasks) will be written to `CLAUDE_TASKS.md` upon architecture approval.

> *This document represents the living architecture of RehabOS AI. It will evolve as implementation progresses and new requirements emerge.*
