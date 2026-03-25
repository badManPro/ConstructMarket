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
