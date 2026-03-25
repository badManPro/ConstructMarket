# ConstructMarket Handoff Status

这份文档用于换设备后快速恢复 Codex 开发上下文。

## 当前进度

- 已完成 PRD 输出：[`docs/PRD-建材市场小程序前端.md`](/Users/casper/Documents/self/ConstructMarket/docs/PRD-建材市场小程序前端.md)
- 已完成项目私有 skills 沉淀与安装说明：[`docs/skills-setup.md`](/Users/casper/Documents/self/ConstructMarket/docs/skills-setup.md)
- 已完成原生微信小程序脚手架：
  - 工程配置：[`package.json`](/Users/casper/Documents/self/ConstructMarket/package.json)、[`tsconfig.json`](/Users/casper/Documents/self/ConstructMarket/tsconfig.json)、[`project.config.json`](/Users/casper/Documents/self/ConstructMarket/project.config.json)
  - 小程序目录：[`miniprogram/`](/Users/casper/Documents/self/ConstructMarket/miniprogram)
  - 路由与分包：[`miniprogram/app.json`](/Users/casper/Documents/self/ConstructMarket/miniprogram/app.json)
  - 共享类型：[`miniprogram/types/models.ts`](/Users/casper/Documents/self/ConstructMarket/miniprogram/types/models.ts)
  - 路由常量：[`miniprogram/constants/routes.ts`](/Users/casper/Documents/self/ConstructMarket/miniprogram/constants/routes.ts)
- 已完成依赖安装并通过静态校验：
  - `npm install --cache ./.npm-cache`
  - `npm run typecheck`
- 已完成浏览主链路第一批页面实现：
  - 首页
  - 搜索结果页
  - 商品详情页
  - 共享组件：商品卡片、筛选抽屉、规格弹层

## 当前停留点

当前项目停在“浏览主链路已实现，交易主链路未实现”的阶段。

已完成：
- 4 个 TabBar 页面骨架
- 18 个二级业务页占位
- 主包与 5 个业务分包
- 自定义 tab bar
- mock 入口、基础 store、共享类型
- 首页真实模块和导航跳转
- 搜索结果页排序/筛选/更多类目交互
- 商品详情页规格、收藏、加购、立即购买前半链路

未完成：
- 购物车、结算、订单、客服等业务逻辑
- 资讯列表/详情真实内容
- 微信开发者工具实际联调和视觉验收

## 下一步建议

优先实现“交易主链路”第一批页面：

1. 购物车页
2. 结算页
3. 支付结果页
4. 订单列表页
5. 订单详情页

推荐顺序：

1. 先打通购物车页与本地存储中的加购数据
2. 再做结算页回流容器
3. 再做支付结果页和订单状态流转
4. 最后补订单列表和订单详情联动

## 新设备启动步骤

1. 克隆仓库
2. 安装项目私有 skills

```bash
./scripts/install_project_skills.sh
```

3. 重启 Codex
4. 安装依赖

```bash
npm install --cache ./.npm-cache
```

5. 类型校验

```bash
npm run typecheck
```

6. 继续开发时，优先读取这些文件：
- [`task_plan.md`](/Users/casper/Documents/self/ConstructMarket/task_plan.md)
- [`findings.md`](/Users/casper/Documents/self/ConstructMarket/findings.md)
- [`progress.md`](/Users/casper/Documents/self/ConstructMarket/progress.md)
- [`docs/handoff-status.md`](/Users/casper/Documents/self/ConstructMarket/docs/handoff-status.md)
- [`docs/PRD-建材市场小程序前端.md`](/Users/casper/Documents/self/ConstructMarket/docs/PRD-建材市场小程序前端.md)
