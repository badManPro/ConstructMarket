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
- 已新增 UI 视觉约束文档：[`docs/ui-reference-guideline.md`](./ui-reference-guideline.md)
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
- 已完成订单链路闭环第一版：
  - 本地订单 mock/store
  - 结算页提交订单写入本地订单
  - 支付结果页回流订单详情
  - 订单列表页：状态 Tab、订单卡片、继续支付
  - 订单详情页：订单状态、地址、商品、金额、发票、联系客服、确认收货/售后
- 已完成交易辅助页回流：
  - 收货地址页与地址编辑页：新增、编辑、删除、默认地址、结算页回流
  - 优惠券页：可用/不可用分组、门槛校验、结算场景选券
  - 发票中心页：电子/纸质/管理 Tab、开票表单、记录列表、结算页回流
- 已完成首批 UI 重构：
  - 全局视觉基底、TabBar、商品卡、筛选抽屉、规格弹层
  - 首页、搜索结果页、商品详情页、购物车页、结算页、支付结果页、订单列表页、订单详情页、地址页、优惠券页、发票页

## 当前停留点

当前项目停在“浏览主链路已实现，交易主链路和辅助回流页已打通，且 UI 视觉规则已切换到 `docs/pencil` 主导，但资讯与客服链路未实现”的阶段。

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
- 本地订单状态流转、订单列表页和订单详情页
- 地址列表/编辑页、优惠券页、发票中心页及其结算回流
- 已明确后续 UI 默认遵循 `docs/ui-reference-guideline.md`
- 已对首批已实现页面完成 pencil 风格对齐，包括订单列表、订单详情、地址页、优惠券页和发票页

未完成：
- 客服等业务逻辑
- 分类页真实内容
- 资讯列表/详情真实内容
- 微信开发者工具实际联调和视觉验收

## 下一步建议

优先开始补“内容与服务链路”：

1. 建材资讯列表/详情真实内容
2. 客服首页/会话/FAQ/投诉建议
3. 分类页真实内容
4. 微信开发者工具联调和视觉验收

推荐顺序：

1. 先补资讯页和客服页真实内容，并沿用 `docs/ui-reference-guideline.md`
2. 再补分类页真实内容和交易链路边界态联调
3. 最后做微信开发者工具联调和视觉验收

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
- [`docs/ui-reference-guideline.md`](./ui-reference-guideline.md)
- [`docs/PRD-建材市场小程序前端.md`](./PRD-建材市场小程序前端.md)
