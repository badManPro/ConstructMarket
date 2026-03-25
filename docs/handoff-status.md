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
- 已完成内容与服务链路：
  - 建材资讯列表页：分类 Tab、内容卡片、下拉刷新、空态/异常态
  - 资讯详情页：正文、相关推荐、错误/离线占位
  - 客服系统首页：服务入口、服务说明、离线占位
  - 在线咨询页：欢迎语、快捷问题、Mock 自动回复、失败重发
  - 常见问题页：分类切换、问答折叠、咨询引导
  - 投诉建议页：本地草稿、问题类型、订单关联、图片占位、提交反馈
- 已完成首批 UI 重构：
  - 全局视觉基底、TabBar、商品卡、筛选抽屉、规格弹层
  - 首页、搜索结果页、商品详情页、购物车页、结算页、支付结果页、订单列表页、订单详情页、地址页、优惠券页、发票页
- 已完成个人中心补完：
  - 我的页真实用户卡、订单摘要和服务入口整理
  - 收藏夹页真实内容、取消收藏、快捷加购和状态壳子
  - 个人信息页真实内容、头像切换、资料补全提示和本地草稿保存
- 已再次通过本地校验：
  - `npm run typecheck`
  - `npm run build:miniapp`

## 当前停留点

当前项目停在“浏览、交易、内容与服务链路已实现，个人中心主要页面已补齐，且 UI 视觉规则已切换到 `docs/pencil` 主导；下一步集中在交易边界态联调和开发者工具验收”的阶段。

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
- 建材资讯列表/详情真实内容、相关推荐和状态占位
- 客服首页、在线咨询、FAQ、投诉建议真实内容
- 客服会话消息和投诉建议草稿本地存储
- 订单详情联系客服已带订单上下文进入在线咨询
- 已明确后续 UI 默认遵循 `docs/ui-reference-guideline.md`
- 已对首批已实现页面完成 pencil 风格对齐，包括订单列表、订单详情、地址页、优惠券页和发票页
- 已完成分类页真实实现：
  - 左侧一级类目列表、右侧细分类目宫格、当前类目说明、当前热销商品
  - 支持从首页和搜索结果页带 `categoryId` 进入并定位当前类目
  - 支持进入搜索结果页、商品详情页和资讯页
  - 支持 `loading / empty / error / offline` 状态占位
  - 首页分类导航已改为先进入分类页再承接后续浏览
- 已完成个人中心页补完：
  - 我的页真实资料卡和订单摘要
  - 收藏夹页真实内容与快捷加购
  - 个人信息页真实内容、草稿保存和我的页回流

未完成：
- 交易链路边界态联调
- 微信开发者工具实际联调和视觉验收

## 下一步建议

优先补“交易边界态与联调”：

1. 交易链路边界态联调
2. 微信开发者工具联调和视觉验收

推荐顺序：

1. 继续保证后续改动遵循 `docs/ui-reference-guideline.md`
2. 先补交易链路边界态联调
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
