# ConstructMarket Handoff Status

这份文档用于换设备后快速恢复 Codex 开发上下文。

## 当前进度

- 已完成 PRD 输出：[`docs/PRD-建材市场小程序前端.md`](./PRD-建材市场小程序前端.md)
- 已完成项目私有 skills 沉淀与安装说明：[`docs/skills-setup.md`](./skills-setup.md)
- 已完成原生微信小程序脚手架：
  - 工程配置：[`package.json`](../package.json)、[`tsconfig.json`](../tsconfig.json)、[`project.config.json`](../project.config.json)
  - 小程序目录：[`miniprogram/`](../miniprogram)
  - 路由与分包：[`miniprogram/app.json`](../miniprogram/app.json)
  - 共享类型：[`miniprogram/types/models.ts`](../miniprogram/types/models.ts)
  - 路由常量：[`miniprogram/constants/routes.ts`](../miniprogram/constants/routes.ts)
- 已完成依赖安装并通过静态校验：
  - `npm install --cache ./.npm-cache`
  - `npm run typecheck`
- 已完成浏览主链路第一批页面实现：
  - 首页
  - 搜索结果页
  - 商品详情页
  - 共享组件：商品卡片、筛选抽屉、规格弹层
- 已完成交易主链路第一批页面实现：
  - 购物车页：本地购物车读取、勾选/全选、数量步进器、删除、失效商品清空
  - 结算页：地址/优惠券/发票容器、备注、支付方式、金额明细、提交订单入口
  - 支付结果页：成功/失败结果态壳子、订单号和金额展示、回首页/购物车

## 当前停留点

当前项目停在“浏览主链路已实现，交易主链路第一段已实现，但订单状态流转和回流页未实现”的阶段。

已完成：
- 4 个 TabBar 页面骨架
- 18 个二级业务页占位
- 主包与 5 个业务分包
- 自定义 tab bar
- mock 入口、基础 store、共享类型
- 首页真实模块和导航跳转
- 搜索结果页排序/筛选/更多类目交互
- 商品详情页规格、收藏、加购、立即购买前半链路
- 购物车页真实列表、勾选、步进器、删除和失效商品清空
- 结算页第一版容器、金额明细和提交订单入口
- 支付结果页第一版结果态

未完成：
- 本地订单存储与订单状态流转
- 订单列表/详情页真实实现
- 地址、优惠券、发票页真实实现及结算回流
- 客服等业务逻辑
- 资讯列表/详情真实内容
- 微信开发者工具实际联调和视觉验收

## 下一步建议

优先把“交易主链路”补成完整闭环：

1. 本地 order mock/store
2. 订单列表页
3. 订单详情页
4. 地址/优惠券/发票回流
5. 微信开发者工具联调

推荐顺序：

1. 先让结算提交写入本地订单存储
2. 再做订单列表和订单详情联动
3. 再做地址、优惠券、发票页面与结算页回流
4. 最后补资讯页、客服页和开发者工具联调

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
- [`task_plan.md`](../task_plan.md)
- [`findings.md`](../findings.md)
- [`progress.md`](../progress.md)
- [`docs/handoff-status.md`](./handoff-status.md)
- [`docs/PRD-建材市场小程序前端.md`](./PRD-建材市场小程序前端.md)
