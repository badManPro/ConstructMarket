# ConstructMarket
ConstructMarket mini app

## Project Skills

Project-specific Codex skills live under `skills/`.

- Setup and migration guide: [`docs/skills-setup.md`](docs/skills-setup.md)
- Install script: [`scripts/install_project_skills.sh`](scripts/install_project_skills.sh)

## Miniapp Build

- Type check: `npm run typecheck`
- Build DevTools output and sync runtime JS back into `miniprogram/`: `npm run build:miniapp`
- Verify source/runtime JS stays aligned with the compiled output: `npm run verify:source-runtime`
- WeChat DevTools should preview `dist/` as the mini program root, with `miniprogram/` kept as the TypeScript source root.
