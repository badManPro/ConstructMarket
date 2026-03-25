---
name: wechat-miniapp-engineering
description: Use when initializing, structuring, or implementing the native WeChat mini program architecture for ConstructMarket, including routing, subpackages, components, mock data, and delivery conventions.
---

# WeChat Miniapp Engineering

Use this skill for technical implementation decisions in the native WeChat mini program codebase.

## Defaults

- Stay on native WeChat mini program unless the user explicitly asks to switch frameworks.
- Prefer TypeScript plus WXSS or Sass.
- Use a component library only for primitive UI building blocks.
- Keep business components project-local.
- Design for local Mock delivery first.
- For ConstructMarket visual work, treat `docs/pencil/miniapp.pen` and `docs/pencil/*.jpg` as the primary UI source for theme and layout.
- Use the PRD for functionality, but use the pencil references for page density, surface hierarchy, CTA styling, tab bar feel, and drawer/sheet presentation.

## Recommended Stack

- Native WeChat mini program
- TypeScript
- WXSS or Sass
- `TDesign Miniprogram` for base UI primitives
- Project-owned business components
- Local Mock store and local storage persistence
- `miniprogram-ci` when CI or release automation is added

## Engineering Rules

- Put TabBar pages in the main package.
- Move secondary business pages into subpackages by domain.
- Define types, enums, and mock contracts before page implementation.
- Build base components and cross-page utilities before parallelizing page work.
- Every page must support `loading`, `empty`, `error`, and `offline`.
- Keep route registration and subpackage changes centralized and easy to review.

## Workflow

1. Read the PRD sections for routes, global state, data models, and acceptance.
2. Read `docs/ui-reference-guideline.md` and the relevant `docs/pencil` screen before changing visuals.
3. Decide whether the task belongs to base infrastructure, shared UI, or a business domain.
4. Update config, contracts, mock data, and shared dependencies first.
5. Implement page containers and business components after shared pieces are stable.
6. Run a focused smoke pass on navigation and state persistence after each domain lands.

## Guardrails

- Do not introduce Taro, uni-app, React, or Vue unless the user asks for a framework change.
- Do not let the UI library define business cards, drawers, or order logic.
- Do not bind code to real backend APIs while the project is still mock-driven.
- Avoid flat `pages/` growth when a domain subpackage is more appropriate.

## Extra Reference

- Read `references/engineering-checklist.md` for the proposed structure and rollout order.
