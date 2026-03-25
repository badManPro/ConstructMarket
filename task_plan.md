# Task Plan: 建材市场微信小程序前端 PRD 输出

## Goal
产出一份可直接指导微信原生小程序前端设计与开发的建材市场 PRD，并保存到项目内。

## Current Phase
Phase 5

## Phases
### Phase 1: Requirements & Discovery
- [x] 理解用户目标与交付物
- [x] 以 `docs/mind.png` 为主梳理需求范围
- [x] 用 `docs/pencil` 补充页面形态参考
- **Status:** complete

### Phase 2: Planning & Structure
- [x] 确定 PRD 文档结构
- [x] 确定页面清单、路由清单与数据模型范围
- [x] 明确只覆盖前端、全部使用 Mock 数据
- **Status:** complete

### Phase 3: Implementation
- [x] 创建项目内规划文件
- [x] 编写正式 PRD 文档
- [x] 补全页面功能、交互、状态、Mock 字段
- **Status:** complete

### Phase 4: Testing & Verification
- [x] 自检文档完整性
- [x] 核对是否覆盖脑图全部模块
- [x] 核对是否满足“只考虑前端”的约束
- **Status:** complete

### Phase 5: Delivery
- [x] 确认输出文件路径
- [x] 总结本次新增文件
- [x] 向用户交付
- **Status:** complete

## Key Questions
1. 脑图中的页面能力如何映射为可开发的小程序页面与弹层？
2. 在只做前端、全部 Mock 的前提下，需要定义哪些数据模型和全局状态？
3. 哪些竞品页面只能作为视觉/交互参考，不能反向推导需求？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 以 `docs/mind.png` 作为一级需求来源 | 用户已明确“主要还是 mind 图，其他的都是参考” |
| 功能以 PRD 为准，视觉以 `docs/pencil` 为主 | 当前阶段 UI 已被明确要求大量参考 pencil 图稿，需与功能来源分离管理 |
| 按企业/工程采购型商城编写 PRD | 与建材市场场景、发票和地址管理能力更匹配 |
| V1 按脑图全量覆盖 | 用户给出的既定实施方案要求全量覆盖 |
| 交易模式按直接下单支付为主 | 已有既定计划，且能覆盖购物车、结算、支付结果链路 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `pencil/batch_get` 无法连接桌面 app | 1 | 改为直接读取 `miniapp.pen` JSON 和查看静态图片 |
| `apply_patch` 上下文不匹配，导致样式片段误写入 `index.wxml` | 1 | 重新读取文件尾部并拆分修复，单独创建 `miniprogram/pages/profile/index.wxss` |
| 开发者工具旧缓存导致 `constructmarket_cart_items` 不是数组，进入收藏夹时报 `reduce is not a function` | 1 | 为 `getCartItems` / `getFavoriteIds` 增加数组校验与自愈归一化，脏缓存自动重置为空数组 |

## Notes
- PRD 输出路径：`docs/PRD-建材市场小程序前端.md`
- 需要显式给出页面目标、入口、核心模块、交互、空态/异常态、跳转和 Mock 字段
- 需要给出可直接拆分 `pages` 配置的路由清单
- 已完成文件级自检，PRD 共 1078 行

## Follow-up Task: PRD 落地分析

### Goal
基于现有 PRD，评估多线程 AI 协作可行性、技术与组件库选型、任务拆分方式以及推荐目录结构。

### Current Phase
Phase B

### Phases
#### Phase A: Current State Audit
- [x] 确认仓库当前仅包含 PRD、参考设计和规划文件
- [x] 确认当前没有前端工程脚手架、依赖清单和构建配置
- [x] 确认 PRD 已覆盖 22 个页面/功能路由与完整交易链路
- **Status:** complete

#### Phase B: Solution Analysis
- [x] 分析 PRD 中适合并行开发的业务域边界
- [x] 评估微信原生小程序路线下的技术与组件库选型
- [x] 输出建议的 AI 协作方式、任务拆分和目录结构
- **Status:** complete

#### Phase C: Delivery
- [x] 向用户交付结构化分析结论
- **Status:** complete

### Key Questions
1. 在当前“仅有 PRD、尚无工程代码”的状态下，什么阶段适合多线程 AI 并行开发？
2. 微信原生小程序前端是否应引入组件库，若引入应选“基础组件库 + 业务组件自建”还是重度依赖组件库？
3. 如何把 22 个页面与关键业务链路拆成可并行执行、低冲突的开发任务？

### Follow-up Extension: 项目私有 Skills 沉淀
- [x] 将建议的 3 个项目 skill 以仓库文件形式沉淀
- [x] 为换设备场景补充安装说明文档
- [x] 为本地环境补充一键安装脚本
- **Status:** complete

### Follow-up Extension: 微信小程序脚手架
- [x] 初始化原生微信小程序工程骨架
- [x] 建立主包与分包目录结构
- [x] 建立路由常量、Mock 入口、类型定义和基础 store
- [x] 创建 4 个 TabBar 页面与 18 个二级页占位
- [x] 完成依赖安装与 TypeScript 静态校验
- **Status:** complete

## Current Resume Point

- 当前 UI 规则已调整：
  - 功能、状态和页面边界按 PRD
  - 主题、布局、卡片形态、底部导航和弹层样式按 `docs/pencil`
  - 规则沉淀文件：`docs/ui-reference-guideline.md`
- 当前已完成：PRD、项目私有 skills、原生微信小程序 scaffold、路由分包、页面占位、依赖安装、TypeScript 静态校验，以及浏览主链路和交易主链路第一批页面实现
- 当前已完成的业务实现：
  - 首页：搜索入口、活动 banner、分类导航、活动/热门商品、资讯入口，并已按 `docs/pencil` 改为电商小程序式首页布局
  - 搜索结果页：关键词回填、类目横滑、排序、更多类目抽屉、筛选侧栏、结果空态，并已改为参考稿式搜索结果布局
  - 商品详情页：图集、规格弹层、收藏、客服入口、加入购物车、立即购买、相关推荐，并已按参考稿重做价格区、规格区、店铺区和底部操作栏
  - 购物车页：本地购物车读取、勾选/全选、数量步进器、删除、失效商品清空、结算入口，并已改为参考稿式购物车布局
  - 结算页：地址/优惠券/发票容器、备注、支付方式、金额明细、提交订单入口，并已改为参考稿式确认订单布局
  - 支付结果页：成功/失败结果态壳子、订单号和金额展示、回流按钮，并已改为参考稿式结果页布局
  - 订单状态流：本地 order mock/store、下单写入、继续支付、确认收货、售后申请
  - 订单列表页：状态 Tab、订单卡片摘要、继续支付、进入详情
  - 订单详情页：状态卡、收货信息、商品明细、金额/支付/发票信息、联系客服和状态动作
  - 地址列表/编辑页：新增、编辑、删除、默认地址、结算页回流
  - 优惠券页：可用/不可用分组、门槛校验、结算页选券回流
  - 发票中心页：电子/纸质/管理 Tab、开票表单、记录列表、结算页发票回流
  - 建材资讯列表页：分类 Tab、内容卡片、下拉刷新、空态/异常态
  - 资讯详情页：正文、相关推荐、错误/离线占位
  - 客服系统首页：服务入口、服务说明、离线占位
  - 在线咨询页：欢迎语、快捷问题、Mock 自动回复、失败重发
  - 常见问题页：分类切换、问答折叠、咨询引导
  - 投诉建议页：本地草稿、订单关联、图片占位、提交反馈
  - 我的页：真实用户卡、优惠券提示、采购资产摘要、订单状态快捷入口、采购服务/账号与售后入口整理，以及 `loading` / `empty` / `error` / `offline` 状态占位
  - 收藏夹页：真实收藏列表、取消收藏、快捷加购、进入商品详情、去购物车/回首页入口，以及 `loading` / `empty` / `error` / `offline` 状态占位
- 当前尚未开始：个人信息页真实内容、微信开发者工具联调
- 建议下一步：补“剩余占位页与联调”
  - 个人信息页真实内容与资料编辑
- 当前推荐执行顺序：
  1. 先保证后续新页面都遵循 `docs/ui-reference-guideline.md`
  2. 先补个人信息页真实内容与资料编辑
  3. 再补交易链路边界态联调
  4. 最后做微信开发者工具联调和视觉验收
