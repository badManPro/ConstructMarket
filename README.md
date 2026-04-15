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
- Run Node-side API/service smoke tests: `npm run test:node`
- WeChat DevTools should preview `dist/` as the mini program root, with `miniprogram/` kept as the TypeScript source root.

## API Integration S0

- API config is centralized at `miniprogram/api/config.ts`
- Request wrapper lives at `miniprogram/api/request.ts`
- Domain API modules live under `miniprogram/api/modules/`
- Domain adapters live under `miniprogram/api/adapters/`
- Page-facing service shells live under `miniprogram/services/`

Current defaults:

- `API_MODE` default is `mock`
- Base URL default is `http://106.15.108.65:8085/api`
- Since the project does not yet have a login page, user-side接口联调先通过开发 token 注入完成

Recommended local setup in WeChat DevTools console:

```js
wx.setStorageSync("constructmarket_api_mode", "hybrid");
wx.setStorageSync("constructmarket_dev_token", "your-test-token");
getApp().refreshRuntimeConfig();
```

Optional override for non-default gateway:

```js
wx.setStorageSync("constructmarket_api_base_url", "http://106.15.108.65:8085/api");
getApp().refreshRuntimeConfig();
```
