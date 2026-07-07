# RehabOS AI Developer Documentation

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm 10+
- Docker Desktop (for local services)

### Setup
```bash
git clone https://github.com/your-org/rehabos-ai.git
cd rehabos-ai
pnpm install
cp apps/web/.env.example apps/web/.env.local
cd packages/database && npx prisma generate && cd ../..
```

### Development
```bash
# Start web app
pnpm dev --filter=@rehabos/web

# Start database studio
pnpm --filter=@rehabos/database studio

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Project Structure

```
apps/
├── web/          # Clinician Web (Next.js 15, Tailwind, Shadcn)
├── mobile/       # Patient App (Expo)
└── admin/        # Admin Dashboard (Next.js)
packages/
├── ai/           # AI Engine (LangGraph + LlamaIndex)
├── knowledge-graph/ # Neo4j Knowledge Graph
├── database/     # Prisma Schema + Seeds
├── shared-ui/    # Design System
├── exercise-library/ # Exercise Definitions
└── protocol-engine/  # Protocol Builder
```

## Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the complete architecture document.

## Database

See [packages/database/prisma/schema.prisma](../packages/database/prisma/schema.prisma) for the full schema.

## API

API documentation is available in [docs/api/](api/).

## Deployment

The app is deployed to Vercel. See `.github/workflows/` for CI/CD configuration.
