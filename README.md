# RehabOS AI

> **AI-Native Operating System for Rehabilitation Professionals**

An AI-powered platform covering the complete clinician workflow: Patient Management → Assessment → Documentation → Clinical Decision Support → Treatment Planning → Home Exercise Programs → Progress Tracking → Practice Management → Billing → Scheduling → Telehealth → Referral Network.

Built for Physical Therapists, Sports Medicine Professionals, Rehabilitation Clinics, Freelance PTs, Chiropractors, Occupational Therapists, Pilates Rehabilitation Specialists, and Sports Physicians.

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete architecture document.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/rehabos-ai.git

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Initialize database
cd packages/database
npx prisma generate
npx prisma db push

# Start development
pnpm dev
```

## Project Structure

```
rehabos-ai/
├── apps/
│   ├── web/          # Clinician Web App (Next.js)
│   ├── mobile/       # Patient Mobile App (Expo)
│   └── admin/        # Admin Dashboard (Next.js)
├── packages/
│   ├── ai/           # AI Engine (LangGraph + LlamaIndex)
│   ├── knowledge-graph/ # Clinical Knowledge Graph (Neo4j)
│   ├── database/     # Prisma Schema + Seeds
│   ├── api/          # Shared API Layer
│   ├── shared-ui/    # Design System
│   ├── exercise-library/ # Exercise Definitions
│   └── protocol-engine/  # Protocol Builder
└── docs/             # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn UI |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| AI | LangGraph, LlamaIndex, OpenAI, Claude, pgvector |
| Knowledge Graph | Neo4j, GraphRAG |
| Search | Meilisearch |
| Scheduling | Cal.diy |
| Telehealth | Jitsi Meet |
| Payments | Stripe + Xendit |
| Mobile | Expo (React Native) |
| Infrastructure | Vercel, GitHub Actions, Docker |

## Development Phases

| Phase | Timeline | Focus |
|-------|----------|-------|
| 0 — Foundation | Weeks 1-3 | Monorepo, DB, Auth, CI/CD |
| 1 — Core Clinical | Weeks 4-7 | Patients, Visits, SOAP Notes |
| 2 — Assessment Engine | Weeks 8-11 | Assessments, Outcome Measures |
| 3 — Exercise & HEP | Weeks 12-15 | Exercise Library, HEP, Mobile |
| 4 — Scheduling | Weeks 16-18 | Calendar, Telehealth, Messaging |
| 5 — Clinical AI | Weeks 19-21 | Knowledge Graph, CDS, Protocols |
| 6 — Billing | Weeks 22-24 | Invoicing, Payments, Analytics |
| 7 — Marketplace | Weeks 25-26 | Referrals, Marketplace |
| 8 — Launch | Weeks 27-30 | Polish, Security, Docs |

## Key Documentation

- [Architecture Document](ARCHITECTURE.md) — Complete system architecture
- [Database Schema](packages/database/prisma/schema.prisma) — Prisma schema
- [Claude Code Tasks](CLAUDE_TASKS.md) — 150+ implementation tasks
- [Architecture Decisions](docs/adrs/README.md) — ADRs for key decisions

## License

MIT
