# Progress Log: 建材市场微信小程序前端 PRD

## 2026-03-25

### Session Start
- 读取仓库结构，确认当前项目只有 README、mind 图和参考设计素材
- 查看 `docs/mind.png`，抽取一级功能树
- 读取 `docs/pencil/miniapp.pen` 与参考截图，用于补充页面形态和关键交互

### Current Work
- 已完成正式 PRD 文档编写
- 已输出到 `docs/PRD-建材市场小程序前端.md`

### Verification Plan
- 核对脑图中的 6 大模块是否全部覆盖
- 核对每个页面是否包含：目标、入口、核心模块、主要交互、空态/异常态、跳转、Mock 字段
- 核对是否显式定义路由清单、数据模型、枚举、全局状态、测试场景

### Verification Result
- 已通过关键词检索核对：首页、建材资讯、购物车、我的、客服系统、支付系统、发票中心、收货地址、收藏夹、优惠券、个人信息均已覆盖
- 已确认文档明确限制为前端范围，所有数据均为 Mock
- 已确认路由清单、关键弹层、Mock 模型、枚举、全局状态、测试场景均已写入

### Files Added
- `task_plan.md`
- `findings.md`
- `progress.md`
- `docs/PRD-建材市场小程序前端.md`

### Follow-up Session: PRD 落地分析
- 读取现有规划文件、README 和 PRD，确认项目仍处于“需求已成文、工程未开始”阶段
- 核对 PRD 结构，确认包含 22 个页面/路由能力、Mock 数据模型、状态枚举、全局状态和验收场景
- 补充技术选型外部核验，重点查看微信小程序组件库和模板生态，用于组件库推荐

### Follow-up Session: 项目私有 Skills
- 在仓库内创建 `skills/` 目录，新增 3 个项目私有 skill
- 新增 `docs/skills-setup.md`，用于记录新设备上的 skill 恢复方式
- 新增 `scripts/install_project_skills.sh`，用于一键安装项目 skill 到本机 Codex 目录
- 校验安装脚本语法通过：`bash -n scripts/install_project_skills.sh`

### Follow-up Session: 微信小程序脚手架
- 新增原生微信小程序工程配置：`package.json`、`tsconfig.json`、`project.config.json`、`sitemap.json`
- 新增 `miniprogram/` 目录并建立主包、分包、路由常量、共享类型、Mock 数据和 store 入口
- 创建 4 个 TabBar 页面和 18 个二级业务页占位
- 安装依赖时，首次 `npm install` 因全局 npm cache 权限报 `EACCES`
- 改用本地缓存命令 `npm install --cache ./.npm-cache` 后成功安装依赖
- 修正 `tsconfig` 对小程序 typings 的接入方式，并将事件类型改为 `WechatMiniprogram.Event`
- `npm run typecheck` 通过

### Follow-up Session: Handoff 文档
- 更新 `task_plan.md` 中的落地分析状态，补齐已完成项
- 新增 `docs/handoff-status.md`，明确当前停留点、下一步和换设备恢复步骤

### Follow-up Session: 浏览主链路第一批实现
- 新增共享浏览 Mock：`miniprogram/mock/browse.ts`
- 新增本地状态工具：`miniprogram/utils/storage.ts`
- 新增带 query 参数的导航辅助：`miniprogram/utils/navigate.ts`
- 新增业务组件：
  - `miniprogram/components/business/product-card`
  - `miniprogram/components/business/filter-drawer`
  - `miniprogram/components/business/spec-popup`
- 完成首页真实实现：搜索入口、banner、分类导航、活动/热门商品、资讯入口
- 完成搜索结果页真实实现：关键词回填、类目切换、排序、筛选抽屉、更多类目抽屉、空态
- 完成商品详情页真实实现：图集、规格弹层、收藏、客服、加入购物车、立即购买、相关推荐
- `npm run typecheck` 通过

### Follow-up Session: 交易主链路第一批实现
- 扩展共享类型：新增购物车金额摘要、结算草稿、发票草稿模型
- 扩展本地状态工具：补充购物车勾选、全选、数量更新、删除、失效商品清空，以及结算草稿读写
- 新增 `miniprogram/mock/trade.ts` 和 `miniprogram/utils/trade.ts`，集中管理地址、优惠券、支付方式与金额计算逻辑
- 更新商品详情页立即购买逻辑，先写入本地结算草稿，再进入结算页
- 完成购物车页真实实现：本地商品列表、勾选/全选、数量步进器、删除、失效商品区、合计金额和结算入口
- 完成结算页第一版实现：地址/优惠券/发票容器、备注输入、支付方式选择、金额明细、提交订单
- 完成支付结果页第一版实现：成功/失败态壳子、订单号和金额展示、回首页/购物车入口
- `npm run typecheck` 通过

### Follow-up Session: UI 参考规范切换
- 明确后续规则改为“功能按 PRD，视觉按 `docs/pencil`”
- 新增 `docs/ui-reference-guideline.md`，沉淀主题、布局、卡片、CTA、TabBar 和弹层规则
- 更新项目私有 skills，使后续 UI/页面任务默认先读取 pencil 参考
- 将当前已实现页面纳入本轮 UI 重构范围：首页、搜索结果页、商品详情页、购物车页、结算页、支付结果页

### Follow-up Session: 首批页面 UI 重构
- 重写全局视觉基底：`miniprogram/app.wxss`
- 重写自定义 TabBar 样式，改为白底扁平电商风格：`miniprogram/custom-tab-bar/index.wxss`
- 重写共享商品卡、规格弹层、筛选抽屉视觉，使其贴近 pencil 参考稿
- 重构首页为“城市 + 搜索栏 + 暖色 banner + 快捷分类 + 商品信息流”布局
- 重构搜索结果页为“顶部标题栏 + 紧凑搜索区 + 文本筛选条 + 轻量抽屉/侧栏”布局
- 重构商品详情页为“标题栏 + 图集 + 价格卡 + 规格卡 + 店铺卡 + 贴底操作栏”布局
- 重构购物车、结算、支付结果页，使其与 `docs/pencil` 中的交易链路页面视觉保持一致
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 分类页真实内容
- 扩展分类页 Mock：补齐一级类目、细分类目、采购建议和知识回流信息：`miniprogram/mock/category.ts`
- 完成分类页真实实现：左侧一级类目、右侧细分类目宫格、当前类目说明、当前热销商品和采购建议卡
- 补齐分类页状态态：支持 `loading`、`empty`、`error`、`offline`
- 支持从首页与搜索结果页携带 `categoryId` 进入分类页并定位当前类目
- 更新首页分类导航：改为先进入分类页，再由分类页承接到搜索结果和商品详情
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 订单链路闭环
- 新增本地订单 Mock：`miniprogram/mock/order.ts`
- 新增订单工具：`miniprogram/utils/order.ts`
- 扩展本地存储：补充订单初始化、订单写入、继续支付、确认收货、售后申请
- 更新结算页提交流程：提交订单后写入本地订单，再进入支付结果页
- 更新支付结果页回流：成功态可直接进入订单详情
- 完成订单列表页真实实现：状态 Tab、订单卡片摘要、继续支付、空态/异常态
- 完成订单详情页真实实现：状态卡、收货信息、商品明细、金额/支付/发票信息、联系客服与状态动作
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 交易辅助页回流
- 扩展交易 Mock：新增地区选项、发票记录种子数据
- 扩展本地存储：补充地址列表初始化、默认地址切换、地址新增/编辑/删除、发票记录读写
- 更新结算页路由：地址/优惠券/发票页进入时携带 `scene=checkout`
- 完成收货地址页和地址编辑页：新增、编辑、删除、默认地址、结算回流
- 完成优惠券页：可用/不可用切换、门槛校验、选券/取消用券回流
- 完成发票中心页：电子/纸质/管理 Tab、开票表单、记录列表、结算发票回流
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 内容与服务链路
- 新增内容域 Mock：`miniprogram/mock/content.ts`
- 新增服务域 Mock：`miniprogram/mock/support.ts`
- 扩展共享类型与页面状态工具：新增资讯、客服消息、FAQ 分类、投诉建议等模型，以及 `miniprogram/utils/page.ts`
- 扩展本地存储：补充客服会话消息和投诉建议草稿读写
- 完成建材资讯列表页真实实现：分类 Tab、内容卡片、下拉刷新、空态/异常态
- 完成资讯详情页真实实现：正文内容、相关推荐、返回回流、错误/离线占位
- 完成客服系统首页真实实现：服务入口、服务说明、客服关闭占位
- 完成在线咨询页真实实现：欢迎语、快捷问题、Mock 自动回复、失败重发
- 完成 FAQ 页真实实现：分类切换、问答折叠、无数据引导
- 完成投诉建议页真实实现：联系人/手机号/订单号、问题类型、图片占位、本地草稿、提交成功反馈
- 更新订单详情页联系客服跳转：进入在线咨询时携带订单上下文
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 恢复下一步任务
- 按 `planning-with-files` 重新读取 `task_plan.md`、`findings.md`、`progress.md`
- 确认当前明确的下一步是“我的页真实用户卡、订单摘要和服务入口整理”
- 复核 PRD 6.12，确认我的页需要承接 `userProfile`、`orderSummary`、`couponCount` 以及个人中心全部服务入口
- 检查当前代码后确认：`miniprogram/pages/profile/index.ts` 仍是占位实现，`miniprogram/mock/profile.ts` 仅有入口链接数据

### Follow-up Session: 我的页真实实现
- 扩展 `miniprogram/mock/profile.ts`，新增用户卡、采购资产摘要、订单状态快捷入口和服务分组聚合逻辑
- 重写 `miniprogram/pages/profile/index.ts`，接入订单、收藏、地址、发票本地状态并支持 `state` 演示态切换
- 重写 `miniprogram/pages/profile/index.wxml`，完成深色用户卡、订单摘要区和采购服务/账号与售后入口布局
- 新增 `miniprogram/pages/profile/index.wxss`，按 `docs/pencil` 的个人中心参考实现页面视觉
- 修复一次补丁误将样式内容写入 `index.wxml` 的问题，并拆分回独立 `wxss` 文件
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 收藏夹页准备
- 重新读取 `task_plan.md`，确认当前下一步是“收藏夹页真实内容”
- 复核 PRD 6.16，确认本轮仅需实现收藏列表、取消收藏、快捷加购、商品详情跳转和空态
- 检查 `docs/pencil/miniapp.pen` 中收藏夹页参考，确认页面结构可收敛为轻量标题栏 + 单列商品卡列表
- 检查当前代码后确认：`package-profile/profile/favorite.ts` 仍是占位实现，`favorite.wxss` 尚不存在，但 `toggleFavoriteId`、`getFavoriteIds`、`addCartItem` 已可直接复用

### Follow-up Session: 收藏夹页真实实现
- 扩展 `miniprogram/mock/browse.ts`，新增 `getFavoriteProducts`，将本地收藏 ID 聚合为收藏商品列表
- 重写 `miniprogram/package-profile/profile/favorite.ts`，接入收藏读取、取消收藏、快捷加购、商品详情跳转和购物车回流
- 重写 `miniprogram/package-profile/profile/favorite.wxml`，完成标题栏、收藏概览、商品卡列表和状态壳子
- 新增 `miniprogram/package-profile/profile/favorite.wxss`，按 `docs/pencil` 的轻量收藏列表样式实现页面视觉
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 收藏夹页运行时兼容修复
- 根据微信开发者工具报错定位到 `miniprogram/utils/storage.ts`：`getCartItems()` 直接信任本地缓存是数组，旧缓存场景会导致 `getCartCount().reduce(...)` 崩溃
- 更新 `getCartItems()` 和 `getFavoriteIds()`，为本地缓存增加 `Array.isArray` 校验与自愈归一化；读取到脏缓存时自动重置为空数组

### Follow-up Session: 个人信息页真实实现
- 扩展共享类型：新增 `ProfileDraft`，用于区分已保存资料和编辑中草稿
- 扩展 `miniprogram/mock/profile.ts`：新增头像选项、推荐采购身份、资料补全提示和 `buildProfileDraft`
- 扩展 `miniprogram/utils/storage.ts`：新增 `userProfile/profileDraft` 本地持久化、重置和保存回流能力
- 更新 `miniprogram/pages/profile/index.ts`：我的页改为读取真实 `userProfile`，确保个人信息保存后立即回流
- 重写 `miniprogram/package-profile/profile/info.ts`、`info.wxml`、`info.wxss`：完成个人信息页真实内容、头像切换、昵称/企业/身份编辑、手机号只读提示、草稿恢复和保存
- 修复一次补丁误将样式内容写入 `info.wxml` 的问题，并重新拆分到独立 `info.wxss`
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 输入框文字裁切修复
- 根据开发者工具截图复核当前表单样式，确认多个单行 `input` 依赖纵向 `padding` 撑高，存在文字基线裁切风险
- 统一修正搜索、个人信息、地址、发票、投诉建议和在线咨询的输入框样式：改为显式 `height + line-height + 横向 padding`
- 补充 `box-sizing`、`display: block` 和文本颜色，避免微信开发者工具里出现“只显示半行字，点击后偶尔恢复”的现象
- 保留 `textarea` 的纵向 padding，但补齐 `line-height` 和基础文本样式
- `npm run build:miniapp` 通过

### Follow-up Session: 交易链路边界态联调
- 扩展共享类型与订单工具：新增支付结果态类型，并补齐 `paying / failed / success` 文案映射
- 扩展本地订单状态工具：新增统一支付状态更新入口，让支付结果页驱动 `pending_payment -> pending_receipt` 的状态流转
- 更新购物车页：补齐 `loading / offline` 演示态分支，便于交易域统一 smoke
- 更新结算页：新增 `state` 演示态支持，以及“提交失败 / 支付成功 / 支付中 / 支付失败”联调开关
- 调整结算提交流程：提交订单后先写入 `pending_payment` 订单，再带支付结果态进入支付结果页
- 重写支付结果页：补齐 `success / processing / failed` 三态、支付方式展示、失败重试和本地强制切换入口
- 更新订单列表页和订单详情页：待支付订单的“继续支付”统一进入支付结果页，不再直接把订单改成已支付
- 更新订单详情页支付信息展示：由二态文案改为 `待支付 / 支付处理中 / 已支付 / 支付失败`
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: Swagger 接口对齐
- 读取 Swagger UI 页面、初始化脚本和 `swagger-config`，确认用户端文档地址为 `http://106.15.108.65:8085/api/v3/api-docs/app`
- 结构化提取 `app` 分组全部 `63` 个接口，并确认 `plat` 分组有 `164` 个后台接口
- 对照 `miniprogram/app.json` 的 `22` 个页面路由，完成“页面/模块 -> 接口 -> 缺口”逐项映射
- 新增 `docs/swagger-app-接口映射.md`，整理页面接入总表、接口缺口表、暂无页面承接接口表，以及用户端全量接口清单
- 在以下页面/模块补充 `开发中` 标记：
  - 我的页的“优惠券”入口
  - 优惠券页标题
  - 客服系统页中的“在线咨询 / 常见问题”卡片
  - 在线咨询页标题
  - FAQ 页标题
  - 资讯详情页“正文内容”标题
  - 结算页“优惠券 / 提交订单”标题
- 新增全局样式工具：`title-with-badge`、`developing-badge`
- `npm run typecheck` 通过
- `npm run build:miniapp` 通过

### Follow-up Session: 接口对接文档进度化
- 重新读取 `docs/swagger-app-接口映射.md`、`task_plan.md`、`findings.md`、`progress.md`，确认需要把接口文档改造成可持续更新的进度看板
- 复核 `miniprogram/` 当前还没有真实 API 层或 `wx.request` 调用，确认真实接口接入基线应为 `0 / 58`
- 重构 `docs/swagger-app-接口映射.md`：
  - 新增文档概览和真实对接进度总览
  - 新增状态定义和维护规则
  - 新增 6 个批次的分批推进看板
  - 为 58 个页面模块补齐行级 `对接进度`
  - 为“Swagger 有接口但暂无承接”的接口补齐 `当前进度`
- 本轮未运行 `npm run typecheck` / `npm run build:miniapp`，因为只涉及文档改造，没有代码变更

### Follow-up Session: DevTools 运行时同步修复
- 根据启动日志先锁定关键症状：`custom-tab-bar/index.js` 与 `components/business/product-card/index.js` 缺失，同时首页还报 `handleRouteTap` 方法不存在
- 对比 `miniprogram/` 和 `dist/` 后确认根因：`dist/` 的 TS 编译产物完整，但源码目录里缺少大量运行时 JS，已有的页面 JS 也还是开发者工具初始化的占位内容
- 新增 `scripts/verify-source-runtime-sync.mjs` 与 `npm run verify:source-runtime`，用于检查每个 `miniprogram/**/*.ts` 是否都有与 `dist/` 一致的源码侧 `.js`
- 首次运行 `npm run verify:source-runtime` 失败，准确暴露出缺失和过期的运行时文件清单
- 更新 `scripts/build-miniapp.mjs`：在构建 `dist/` 后，把所有 TS 编译得到的 `.js` 同步回 `miniprogram/`
- 更新 `README.md`，补充新的构建/校验流程说明
- 重新运行 `npm run build:miniapp`
- 重新运行 `npm run verify:source-runtime`，结果通过：`46` 个 TypeScript 文件的源码运行时 JS 已与编译输出对齐

### Follow-up Session: 真实接口联调批次计划
- 重新读取 `docs/swagger-app-接口映射.md`、`docs/handoff-status.md`、`task_plan.md`、`findings.md`、`progress.md`，确认用户当前目标不是立即接代码，而是先产出定制化联调任务文档
- 复核工程结构，确认当前没有 `wx.request` 封装、API config、service 层或 repository 层；页面仍主要直接依赖 `mock/*` 与 `utils/storage.ts`
- 识别接口联调的关键前置约束：当前没有登录页和 token 管理，但 `B/C/D/E/F` 多个批次会命中 `/user/*` 接口，因此需要先补联调前置批
- 新增 `docs/plans/2026-04-15-api-integration-batches.md`，把真实接口联调拆成 `S0 + A-F` 七个批次，并为每批补齐：
  - 接口范围与目标页面
  - 建议创建/修改的文件
  - 完成标准
  - 人工验证步骤
  - 完成本批后下一批该接什么
- 同步更新 `task_plan.md` 与 `findings.md`，记录本轮恢复点和批次规划依据
- 本轮未运行 `npm run typecheck` / `npm run build:miniapp`，因为仅新增与更新文档，没有代码变更

### Follow-up Session: S0 联调前置批实现
- 先按 TDD 新增 Node 侧红测：
  - `tests/api/config.test.cjs`
  - `tests/api/request.test.cjs`
  - `tests/api/browse-service.test.cjs`
- 首次运行 `node --test tests/api/*.test.cjs` 失败，原因符合预期：`miniprogram/api/config.js`、`miniprogram/api/request.js`、`miniprogram/services/browse.js` 尚不存在
- 新增真实接口联调基座：
  - `miniprogram/api/config.ts`
  - `miniprogram/api/request.ts`
  - `miniprogram/api/modules/home.ts`
  - `miniprogram/api/modules/product.ts`
  - `miniprogram/api/modules/trade.ts`
  - `miniprogram/api/modules/profile.ts`
  - `miniprogram/api/modules/content.ts`
  - `miniprogram/api/modules/support.ts`
  - `miniprogram/api/adapters/browse.ts`
  - `miniprogram/api/adapters/content.ts`
  - `miniprogram/api/adapters/profile.ts`
  - `miniprogram/api/adapters/trade.ts`
  - `miniprogram/api/adapters/support.ts`
  - `miniprogram/services/browse.ts`
  - `miniprogram/services/trade.ts`
  - `miniprogram/services/profile.ts`
  - `miniprogram/services/content.ts`
  - `miniprogram/services/support.ts`
- 更新 `miniprogram/app.ts`，让 `globalData.currentEnv` 直接读取新的 API mode
- 更新 `package.json`，新增 `npm run test:node`
- 更新 `README.md`，补齐 `API_MODE` / `baseUrl` / `dev token` 联调说明
- 执行并通过：
  - `npm run typecheck`
  - `npm run build:miniapp`
  - `npm run test:node`
  - `npm run verify:source-runtime`
- 回写 `docs/swagger-app-接口映射.md`，将 `S0` 标记为已完成，并将下一步前移到 `A. 首页 / 选型 / 搜索结果`
