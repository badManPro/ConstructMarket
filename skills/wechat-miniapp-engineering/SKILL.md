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
2. Decide whether the task belongs to base infrastructure, shared UI, or a business domain.
3. Update config, contracts, mock data, and shared dependencies first.
4. Implement page containers and business components after shared pieces are stable.
5. Run a focused smoke pass on navigation and state persistence after each domain lands.

## Guardrails

- Do not introduce Taro, uni-app, React, or Vue unless the user asks for a framework change.
- Do not let the UI library define business cards, drawers, or order logic.
- Do not bind code to real backend APIs while the project is still mock-driven.
- Avoid flat `pages/` growth when a domain subpackage is more appropriate.

## Extra Reference

- Read `references/engineering-checklist.md` for the proposed structure and rollout order.
