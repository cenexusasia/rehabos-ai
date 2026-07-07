# RehabOS AI Project Board

> This is a GitHub Project Board template (automation-ready).
> Use `gh` CLI or GitHub UI to create the board.

## Board Structure

### Columns

| Column | Description | Automation |
|--------|-------------|------------|
| 📋 Backlog | All tasks not yet prioritized | Issues auto-added here |
| 🎯 Ready | Prioritized and ready to start | Manual move |
| 🔨 In Progress | Currently being worked on | Auto-move on assign |
| 👀 In Review | PR submitted, awaiting review | Auto-move on PR |
| ✅ Done | Completed and merged | Auto-move on merge |

### Labels

```
phase:foundation     (purple) — Phase 0 tasks
phase:core-clinical  (blue)   — Phase 1 tasks  
phase:assessment     (green)  — Phase 2 tasks
phase:exercise       (orange) — Phase 3 tasks
phase:scheduling     (yellow) — Phase 4 tasks
phase:ai-clinical    (indigo) — Phase 5 tasks
phase:billing        (pink)   — Phase 6 tasks
phase:marketplace    (teal)   — Phase 7 tasks
phase:polish         (gray)   — Phase 8 tasks

priority:critical    (red)    — Blocking or security
priority:high        (orange) — Milestone blocker
priority:medium      (yellow) — Normal
priority:low         (gray)   — Nice to have

type:task            (blue)   — Implementation task
type:bug             (red)    — Bug fix
type:architecture    (purple) — ADR / architecture change
type:dependency      (yellow) — External dependency

area:database        (pink)   — Database schema / migration
area:api             (blue)   — API / server actions
area:ui              (green)  — Frontend components
area:ai              (indigo) — AI / ML
area:infrastructure  (gray)   — CI/CD, deploy, Docker
area:docs            (white)  — Documentation
area:security        (red)    — Security / HIPAA
area:mobile          (teal)   — Patient mobile app
```

### Issue Template

```markdown
---
name: Implementation Task
about: Standard implementation task for Claude Code
title: '[Phase N] Short description'
labels: 'type:task'
assignees: ''
---

## Goal
One-sentence goal of this task.

## Dependencies
- T### (if any)

## Files to Create/Modify
- path/to/file.tsx

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass
- [ ] Build succeeds

## Verification Steps
1. Step 1
2. Step 2

## Definition of Done
- [ ] Code written
- [ ] Build passes
- [ ] Tests written and passing
- [ ] Self-review completed
```

### Milestones

| Milestone | Target Date | Tasks | Theme |
|-----------|-------------|-------|-------|
| v0.1 — Foundation | Week 3 | 22 | Monorepo, DB, Auth, CI/CD |
| v0.2 — Core Clinical | Week 7 | 25 | Patients, Visits, SOAP |
| v0.3 — Assessment Engine | Week 11 | 18 | Assessments, Outcome Measures |
| v0.4 — Exercise & HEP | Week 15 | 22 | Exercise Library, HEP, Mobile |
| v0.5 — Scheduling | Week 18 | 15 | Calendar, Telehealth, Messaging |
| v0.6 — Clinical AI | Week 21 | 20 | Knowledge Graph, CDS, Protocols |
| v0.7 — Billing | Week 24 | 15 | Invoicing, Payments, Analytics |
| v0.8 — Marketplace | Week 26 | 8 | Referrals, Marketplace |
| v1.0 — Launch | Week 30 | 10 | Polish, Security, Documentation |
```
