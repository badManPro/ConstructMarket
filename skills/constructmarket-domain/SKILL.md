---
name: constructmarket-domain
description: Use when working on the ConstructMarket repo's product logic, PRD mapping, routes, entities, state boundaries, or business flows for the native WeChat mini app.
---

# ConstructMarket Domain

Use this skill when the task depends on ConstructMarket business rules rather than generic frontend technique.

## Read First

1. `docs/PRD-建材市场小程序前端.md`
2. `task_plan.md`
3. `findings.md`
4. `progress.md`

## Source of Truth

- Treat `docs/PRD-建材市场小程序前端.md` as the implementation baseline.
- Treat `docs/ui-reference-guideline.md` plus `docs/pencil` as the visual baseline.
- Keep the scope frontend-only with local Mock data.
- Do not add backend contracts, real payment, approval flow, ERP integration, or real-time messaging unless the user explicitly changes scope.
- If reference designs conflict with the PRD, keep functionality aligned to the PRD and keep visual style aligned to the pencil references.

## Working Rules

- Preserve the 4 TabBar entries and the route map defined in the PRD.
- Map every feature request back to one of these business domains before editing code:
  - browse and discovery
  - trade and order flow
  - profile and account services
  - support and after-sales service
- Reuse the PRD entities and enums before inventing new ones.
- Keep enterprise procurement assumptions unless the user explicitly switches to a retail/C-end version.

## Workflow

1. Identify the affected user flow and page set in the PRD.
2. Check the related data models, enums, and global state.
3. Confirm whether the task is a base capability, a domain feature, or a cross-domain change.
4. Implement or plan the change without expanding beyond the documented scope.
5. If the task changes project direction, update the planning files.

## Extra Reference

- Read `references/domain-checklist.md` when you need a compact map of routes, entities, and flows.
