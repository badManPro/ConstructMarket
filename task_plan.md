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
- 个人信息页：头像标识切换、昵称/企业名称/采购身份编辑、手机号只读展示、资料补全提示、草稿本地保存与“我的页”回流
- 已完成交易链路边界态联调：
  - 结算页新增 Mock 联调开关，支持“提交失败 / 支付成功 / 支付中 / 支付失败”切换
  - 提交订单后先创建 `pending_payment` 订单，再由支付结果页驱动 `success / failed / processing` 三态回流
  - 订单列表页与订单详情页的“继续支付”改为统一进入支付结果页，不再直接跳成支付成功
  - 购物车、结算、订单列表、订单详情补齐 `loading / error / offline` 演示态入口
- 当前尚未开始：微信开发者工具联调与视觉验收
- 建议下一步：做“微信开发者工具联调和视觉验收”
- 当前已新增 Swagger 接口映射文档：`docs/swagger-app-接口映射.md`
- 当前已完成用户端 `app` 分组 `63` 个接口与 `22` 个小程序页面的逐页映射
- 当前已将 `docs/swagger-app-接口映射.md` 改造为“接口映射 + 进度看板”单文档；后续每完成一批真实接口对接，优先更新第 `1`、`3`、`4` 节
- 当前真实接口对接基线为：`0 / 58` 个页面模块已完成，`48` 个 `待接入`，`1` 个 `前端待补`，`9` 个 `后端阻塞`
- 当前已确认的主要接口缺口：
  - 资讯详情缺少独立 `news detail` 接口
  - 结算页缺少优惠券接口和创建订单接口
  - 优惠券页缺少整页接口
  - 在线咨询缺少会话历史/客服回复接口
  - FAQ 缺少问题列表接口
- 上述缺口对应页面已补充 `开发中` 标记，便于后续联调和验收识别
- 当前推荐执行顺序：
  1. 先保证后续新页面都遵循 `docs/ui-reference-guideline.md`
  2. 做微信开发者工具联调和视觉验收
  3. 若开始真实接口对接，按 `docs/swagger-app-接口映射.md` 的批次 A -> B -> C 顺序推进，并在每次完成后回写进度
- 当前微信开发者工具运行前置条件已补齐：
  - `npm run build:miniapp` 现在除了生成 `dist/`，还会把编译后的运行时 JS 同步回 `miniprogram/`
  - 可用 `npm run verify:source-runtime` 快速检查源码目录和编译产物是否仍然一致

## Follow-up Task: 真实接口联调分批计划

### Goal
基于现有 Swagger 映射文档和小程序工程结构，输出一份可执行的真实接口联调任务文档，明确联调前置基座、每一批的接入范围、建议改动文件、完成标准、人工验证步骤，以及完成本批后下一批该接什么。

### Current Phase
Phase C

### Phases
#### Phase A: Audit
- [x] 复核 `docs/swagger-app-接口映射.md`、`docs/handoff-status.md` 和现有 planning files
- [x] 复核工程结构，确认当前页面主要直接依赖 `mock/*` 与 `utils/storage.ts`
- [x] 识别真实联调前的关键前置：请求层为空、服务层为空、`/user/*` 接口缺少鉴权承接
- **Status:** complete

#### Phase B: Planning
- [x] 设计联调前置批与 A-F 业务批次顺序
- [x] 为每一批明确接口范围、建议文件、进入条件、退出标准和下一批衔接关系
- [x] 为每一批补齐人工验证步骤和文档回写要求
- **Status:** complete

#### Phase C: Delivery
- [x] 输出任务文档到 `docs/plans/2026-04-15-api-integration-batches.md`
- [x] 将关键发现和恢复点同步到 `findings.md` 与 `progress.md`
- [x] 完成文档自检，确认每批均包含“人工验证”和“下一批”说明
- **Status:** complete

### Key Questions
1. 如何在不破坏当前 Mock 可演示链路的前提下切入真实接口？
2. 哪些批次可以先接公共接口，哪些必须等鉴权/测试 token 就绪后再推进？
3. 每一批完成后，如何用最少的人工步骤确认可以安全进入下一批？

### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 先补联调前置批，再执行 A-F 业务批次 | 当前仓库没有真实请求层、服务层或 token 管理，直接逐页切接口会造成重复改造 |
| 页面不直接请求 Swagger 接口，而是统一经由 `services/*` + adapter 层 | 当前页面直接依赖 `mock/*`，引入一层服务封装可以最小化页面改动并保留 Mock fallback |
| 批次顺序继续沿用 `A -> B -> C -> D -> E -> F`，但增加 `S0` 前置批 | `A` 主要是公共浏览接口，最适合先验证请求链路；后续多个批次依赖 `/user/*` 鉴权 |
| 每批完成后必须先回写 `docs/swagger-app-接口映射.md` 第 1、3、4 节，再进入下一批 | 当前接口映射文档已经承担进度看板职责，若不及时回写，后续恢复点会漂移 |
| 后端缺口模块继续保留 Mock，并在任务文档与页面上保持 `开发中` 标记 | 资讯详情、优惠券、创建订单、FAQ、在线客服会话等缺口当前无法通过前端单独闭合 |

### Current Resume Point
- 本次已新增任务文档：`docs/plans/2026-04-15-api-integration-batches.md`
- 文档中已拆出 `S0` 联调前置批，以及 `A-F` 六个业务批次
- 每批都已写明：
  - 要接的接口与页面范围
  - 建议新增/修改的文件
  - 完成标准
  - 人工验证步骤
  - 完成本批后下一批该接什么
- 当前已完成 `S0` 联调前置批：
  - 新增 `miniprogram/api/config.ts`、`miniprogram/api/request.ts`
  - 新增 `miniprogram/api/modules/*`、`miniprogram/api/adapters/*`、`miniprogram/services/*`
  - `README.md` 已补齐联调 token 与 `API_MODE` 配置说明
  - `package.json` 已新增 `npm run test:node`
  - 已通过 `npm run typecheck`、`npm run build:miniapp`、`npm run test:node`、`npm run verify:source-runtime`
- 当前已完成 `A. 首页 / 选型 / 搜索结果` 的代码接入与自动化验证：
  - `home` / `category` / `search/result` 已切到 `services/browse`
  - `search-products` 已按 Swagger 实际形态改为 `POST + query`
  - Node 侧红测与 smoke tests 已覆盖首页聚合、分类树、热销搜索和筛选壳子
- 当前阻断项：
  - `A 批 DevTools Smoke Checklist` 仍未完成
  - 下次开始任何新实现前，必须先提醒用户完成或明确跳过这轮走查，不能直接进入 `B. 商品详情 / 收藏加购 / 浏览记录`
- 当前下一步：
  1. 按 `docs/plans/2026-04-15-api-integration-batches.md` 中的 `A 批 DevTools Smoke Checklist（2026-04-16）` 完成人工走查
  2. 将走查结果回写到 `progress.md`
  3. 若走查通过，再把 A 批改成 `已完成`，并进入 `B. 商品详情 / 收藏加购 / 浏览记录`

## Follow-up Task: mall-web 对齐走查与代理修正

### Goal
读取同级目录 `../mall-web`，将其本地 `localhost` 接口代理改为与当前小程序一致的远程地址，并在当前仓库内输出一份“mall-web vs mall-applet”的模块对齐走查文档，明确双方已有模块、差异模块、可对齐模块和当前不一致点。

### Current Phase
Phase C

### Phases
#### Phase A: Audit
- [x] 确认小程序当前远程接口基线与 `mall-web` 当前代理配置
- [x] 盘点 `mall-web` 页面/模块结构
- [x] 盘点当前小程序页面/模块结构
- **Status:** complete

#### Phase B: Change & Analysis
- [x] 修改 `mall-web` 的代理目标
- [x] 建立 web / 小程序模块对照表
- [x] 按模块分类输出“一致 / 可对齐 / 不一致 / 各自独有”
- **Status:** complete

#### Phase C: Delivery
- [x] 将对齐文档写入当前仓库 `docs/`
- [x] 自检文档可检索性与分类完整性
- **Status:** complete

### Key Questions
1. `mall-web` 当前实际走的是哪套构建配置与代理入口？
2. 两个项目的模块边界应该按“页面路由”还是“业务域”做主表？
3. 哪些差异是终端形态差异，哪些是功能缺失，哪些只是命名不一致？

### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 对齐文档写在当前仓库，不写入 `mall-web` | 用户已明确要求 |
| 以“小程序当前远程地址”为代理目标真值 | 用户要求 web 跟小程序对齐远程地址 |
| 对齐文档同时保留“按业务域”和“按页面/模块”两层索引 | 方便后续人工和 AI 查询 |
| `mall-web` 的协议/隐私/官网内容优先通过小程序 `webview` 承接 | 这些页面当前更像内容载体，不适合优先原生重做 |
| 订单域在继续对齐前必须先整理状态映射 | 两端状态模型明显不同，直接比页面会持续错位 |

### Current Resume Point
- `mall-web` 代理已改到 `http://106.15.108.65:8085`
- 已修改文件：
  - `../mall-web/vite.config.ts`
  - `../mall-web/.env.development`
  - `../mall-web/.env.test`
  - `../mall-web/.env.production`
- 已完成构建校验：`cd ../mall-web && npm run build` 通过
- 当前正式对齐文档：`docs/mall-web-小程序模块对齐走查.md`
- 文档已包含：
  - 代理调整说明
  - 业务域对照总表
  - web 路由到小程序页面映射
  - 小程序独有页索引
  - 重点不一致项
  - 后续检索锚点

## Follow-up Task: 选型 Tab 对齐 mall-web Products

### Goal
以 `../mall-web/src/views/Products.vue` 为基线，先调研 web 端接口请求、接口返回与页面实际取用字段，再对照小程序 `选型` tab 当前实现，输出详细对齐文档，最后再落地小程序接口调用和页面展示字段调整。

### Current Phase
Phase D

### Phases
#### Phase A: Research
- [x] 确认 web `Products.vue` 直接/间接调用的接口、请求参数和触发时机
- [x] 确认接口返回结构以及 web 页面实际消费的字段
- [x] 确认小程序 `pages/category/index` 与相关 service 当前请求链和展示字段
- **Status:** complete

#### Phase B: Documentation
- [x] 输出一份对齐文档，包含 web / 小程序对照、字段映射、差异项、改造清单
- [x] 明确哪些字段直接复用，哪些字段需要兼容兜底，哪些交互保持小程序差异
- **Status:** complete

#### Phase C: Implementation
- [x] 按文档调整小程序 `选型` tab 的接口调用
- [x] 按文档调整小程序页面展示信息与文案
- [x] 补齐必要的类型、adapter 或 service 映射
- **Status:** complete

#### Phase D: Verification
- [x] 运行静态校验与必要的构建验证
- [x] 复核页面展示是否与调研文档一致
- [x] 回写 planning files 和对齐文档中的最终结果
- **Status:** complete

### Key Questions
1. web `Products.vue` 的商品列表页到底由哪些接口共同驱动，分别承载分类树、筛选项和商品列表的哪部分信息？
2. web 页面真正展示了哪些商品/分类字段，哪些返回字段其实没有被页面消费？
3. 小程序 `选型` tab 当前更接近“分类导航页”还是“商品列表页”，与 web Products 的差异应该如何收敛？

### Decisions Made
| Decision | Rationale |
|----------|-----------|
| 先做接口和字段调研，再改代码 | 用户已明确要求“先写调研和文档，再落实代码” |
| 对齐基线锁定为 `mall-web` 的 `Products.vue` 页面，而不是整个 web 站点分类体系 | 本轮目标聚焦在小程序 `选型` tab 调整适配 |
| 小程序页面可保留 tab 场景下的交互壳子，但接口数据和核心信息口径优先向 web 看齐 | 保持小程序导航结构不变，同时减少商品信息口径分叉 |

### Current Resume Point
- 已完成调研文档：`docs/plans/2026-04-17-category-tab-products-alignment.md`
- 已完成数据层改造：
  - `miniprogram/api/modules/home.ts` 新增 `getBrands()`
  - `miniprogram/services/browse.ts` 新增品牌筛选壳子与 `brandId` 透传
  - `miniprogram/api/adapters/browse.ts` 补齐 `originalPrice / rating / stock / specText`
- 已完成页面层改造：
  - `miniprogram/pages/category/index.*` 已切为 Products 风格商品列表页
  - `miniprogram/components/business/product-card/*` 已按 web 商品卡补齐关键信息
- 已完成验证：
  - `node --test tests/api/browse-service.test.cjs`
  - `npm run typecheck`
  - `npm run build:miniapp`
  - `npm run test:node`
  - `npm run verify:source-runtime`
- 当前下一步：
  1. 在微信开发者工具里人工走查 `选型` tab 的分类、品牌、排序、筛选和空态
  2. 若视觉还需继续贴近 web，再决定是否把 `search/result` 同步为同一版筛选头部布局
