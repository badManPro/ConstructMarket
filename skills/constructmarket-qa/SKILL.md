---
name: constructmarket-qa
description: Use when reviewing, testing, or validating ConstructMarket implementation against the PRD, including navigation, state flow, edge cases, regression risks, and release readiness.
---

# ConstructMarket QA

Use this skill for reviews, test planning, smoke validation, and release checks in the ConstructMarket repo.

## Read First

1. `docs/PRD-建材市场小程序前端.md`
2. The affected implementation files
3. `task_plan.md` when the change is broad

## Review Mode

- Default to a code review mindset.
- Findings come first, ordered by severity.
- Cite exact files and lines whenever possible.
- Focus on behavior regressions, broken navigation, incorrect state flow, missing edge handling, and test gaps.

## What to Validate

- Route reachability and back-navigation
- PRD flow integrity across browse, trade, profile, and support chains
- Mock data consistency with declared types and enums
- Local persistence for cart, favorites, address defaults, recent search, and checkout drafts
- Empty, error, loading, and offline states on every page
- State transitions for order, payment, invoice, and coupon logic

## Smoke Workflow

1. Identify which PRD chain is affected.
2. Walk the happy path first.
3. Walk the edge states next.
4. Check persistence and backflow between related pages.
5. Report concrete failures and missing tests.

## Guardrails

- Do not sign off based only on visuals.
- Do not ignore return-flow bugs between checkout-related pages.
- Treat missing empty or error states as product defects, not polish work.
- If no runnable app exists yet, convert the PRD into a test checklist and risk list.

## Extra Reference

- Read `references/qa-checklist.md` for the domain-by-domain checklist.
