# Findings: 建材市场微信小程序 PRD

## Source of Truth
- 主需求来源是 `/Users/casper/Documents/self/ConstructMarket/docs/mind.png`
- 参考素材位于 `/Users/casper/Documents/self/ConstructMarket/docs/pencil`
- 用户明确说明：`mind` 图为主，其它素材只做参考

## Confirmed Scope from Mind Map
- 首页设计
  - 搜索功能
  - 轮播图/装修图
  - 商品分类导航
  - 活动商品推荐
  - 热门商品推荐
- 建材资讯
  - 行业新闻
  - 产品知识
  - 装修指南
- 购物车
  - 商品添加/删除
  - 数量修改
  - 结算入口
- 我的（个人中心）
  - 订单管理
  - 发票开具
    - 电子发票
    - 纸质发票
    - 发票管理
  - 收货地址
  - 收藏夹
  - 优惠券
  - 个人信息
- 客服系统
  - 在线咨询
  - 常见问题
  - 投诉建议
- 支付系统
  - 微信支付
  - 支付宝支付
  - 银联支付

## Findings from Reference Screens / pen
- 参考稿覆盖了首页、分类/选型、搜索结果、商品详情、购物车、结算、支付结果、订单、我的、资讯、发票、地址、收藏、优惠券、个人信息、售后等页面
- 搜索结果页存在两个重要交互：查看更多类目抽屉、筛选侧栏抽屉
- 商品详情页已有清晰的底部操作区：客服、加入购物车、立即购买
- 结算页与支付结果页可支撑完整交易闭环
- 我的页参考稿里有“消息中心/订单审批/我的清单”等能力，但脑图未要求，PRD 不应作为硬需求写入

## Product Positioning Assumptions
- 默认面向工程采购/企业采购用户
- 默认采用微信原生小程序
- 所有列表、详情、状态流转、支付结果都先用 Mock 数据模拟
- 不写后端接口、后台管理、实时推送、审批流

## Follow-up Findings: PRD 落地分析
- 当前仓库没有 `package.json`、锁文件、`tsconfig`、构建配置或 `miniprogram-ci` 配置，说明尚未进入工程实现阶段
- 当前分支为 `main`，工作区干净，适合从“初始化工程基座”开始推进
- PRD 路由清单共 22 个页面能力，其中 4 个 TabBar 页面、18 个二级业务页，适合按“基础设施/交易域/内容域/个人中心与服务域”拆分
- 并行开发的前提不是页面数量，而是先冻结共用约束：设计 token、路由规范、Mock 数据模型、全局 store、基础组件封装方式
- 组件库不应承载业务心智，商品卡片、订单卡片、地址卡片、发票卡片、客服会话等业务组件仍应自建
- 外部资料初步核验显示：`TDesign Miniprogram` 提供小程序组件库与零售模板；`NutUI React` 明确面向 React/Taro 多端；因此若坚持微信原生小程序，NutUI 不是优先路线

## Follow-up Findings: 项目私有 Skills
- 已在仓库内新增 3 个项目私有 skill：`constructmarket-domain`、`wechat-miniapp-engineering`、`constructmarket-qa`
- 这 3 个 skill 选择落库到项目 `skills/` 目录，而不是只保存在本机 `$CODEX_HOME/skills`，目的是支持换设备后的快速恢复
- 已新增 `docs/skills-setup.md` 记录技能用途和安装方法
- 已新增 `scripts/install_project_skills.sh`，支持将项目内 skills 复制安装到 `${CODEX_HOME:-$HOME/.codex}/skills`
- `skill-creator` 自带初始化脚本在当前环境缺少 `PyYAML` 依赖，因此改为手工生成最小可用 skill 结构

## Follow-up Findings: 微信小程序脚手架
- 已新增原生微信小程序工程骨架：`package.json`、`tsconfig.json`、`project.config.json`、`sitemap.json`、`miniprogram/`
- `app.json` 已按 PRD 建立 4 个 TabBar 主包页面和 5 个业务分包
- 已建立 `constants/routes.ts`、`types/`、`mock/`、`store/`，作为后续并行开发的共享边界
- 已创建自定义 `custom-tab-bar`，避免在当前阶段引入图标资源阻塞
- 已用 `npm install --cache ./.npm-cache` 规避本机全局 npm cache 权限问题
- `npm run typecheck` 已通过，说明当前 scaffold 在静态类型层面自洽

## Follow-up Findings: 恢复点与下一步
- `task_plan.md` 当前明确的下一个实施项是先完成“我的页真实用户卡、订单摘要和服务入口整理”，而不是直接开始收藏夹页或个人信息页
- PRD 6.12 已固定我的页核心范围：用户信息卡片、订单管理快捷入口、发票中心、收货地址、收藏夹、优惠券、个人信息、客服系统入口
- 我的页当前还未满足 PRD 的 `userProfile`、`orderSummary`、`couponCount` 这组核心 Mock 字段
- `miniprogram/pages/profile/index.ts` 目前仍是占位实现，仅展示标题、摘要和 `profileLinks`
- `miniprogram/mock/profile.ts` 目前仅提供服务入口数组，尚未沉淀用户卡与订单摘要数据
- `package-profile/profile/favorite.ts` 仍是占位页，说明个人中心域后续还有连续任务，但本轮应先把 TabBar 我的页做成真实入口页

## Follow-up Findings: 我的页真实实现
- `docs/pencil/miniapp.pen` 中“我的页”结构可收敛为三块：深色用户卡、订单状态快捷入口、服务入口列表；其中“消息中心/订单审批/我的清单”不在 PRD 内，继续排除为非硬需求
- `miniprogram/types/models.ts` 已有 `UserProfile`，当前无需新增全局 store，只需在 `mock/profile.ts` 聚合本地订单、收藏、地址、发票记录即可生成我的页数据
- `miniprogram/pages/profile/index.ts` 已接入 `getOrders`、`getFavoriteIds`、`getAddresses`、`getInvoiceRecords`，可直接从现有本地状态形成订单摘要和服务角标
- 我的页已补齐 `loading` / `empty` / `error` / `offline` 状态分支，并支持通过 `state` query 做演示态切换，和内容域/服务域页面保持一致
- 当前个人中心域的下一步已前移为二级页补完：`package-profile/profile/favorite.ts` 与 `package-profile/profile/info.ts`

## Follow-up Findings: 收藏夹页实现边界
- PRD 6.16 已固定收藏夹页范围：收藏商品列表、商品卡摘要、取消收藏按钮、快捷加购按钮，以及无收藏时回首页的空态
- `docs/pencil/miniapp.pen` 中收藏夹页视觉非常轻量，适合采用“白底标题栏 + 简洁卡片列表”的电商样式，不需要引入复杂筛选或多列瀑布流
- 当前 `package-profile/profile/favorite.ts` 和 `favorite.wxml` 仍是纯占位实现，`favorite.wxss` 尚不存在
- 现有收藏能力已经完整：`getFavoriteIds` / `toggleFavoriteId` 负责收藏状态，`addCartItem` 负责快捷加购，`ROUTES.productDetail` / `ROUTES.cart` 可直接承接跳转
- 收藏夹页缺的不是底层能力，而是一个把 `baseProducts` 按 `favoriteIds` 聚合成 `favoriteProducts` 的 Mock 出口，以及页面层交互和状态壳子

## Follow-up Findings: 收藏夹页真实实现
- `miniprogram/mock/browse.ts` 已新增 `getFavoriteProducts(favoriteIds)`，按本地收藏 ID 反向聚合 `baseProducts`，让收藏页可直接复用现有商品 Mock
- 收藏夹页快捷加购不需要弹规格层，当前按商品默认 `skuId` 和 `minOrderQty` 直接写入购物车，符合 PRD 中“快捷加购”定位
- `package-profile/profile/favorite.ts` 已接入 `getFavoriteIds`、`toggleFavoriteId`、`addCartItem`、`getCartCount`，说明个人中心域可以继续沿用现有本地状态体系，不必新建 profile store
- 收藏夹页已补齐 `loading` / `empty` / `error` / `offline` 分支，并支持通过 `state` query 演示异常态
- 当前恢复点已前移到 `package-profile/profile/info.ts`，也就是个人信息页真实内容与资料编辑

## Follow-up Findings: 个人信息页真实实现
- 个人信息页不需要新建全局 profile store，沿用本地 `storage.ts` 即可同时承接 `userProfile` 和 `profileDraft`
- “我的页”若继续使用 `seededUserProfile`，编辑结果不会回流，因此资料聚合必须改为读取本地持久化后的真实 `userProfile`
- PRD 中“未完善企业信息时展示补充引导”更适合放在 ready 页内的建议卡，而不是把页面整体降级为 empty 态
- 当前恢复点已前移到“交易链路边界态联调”和微信开发者工具视觉验收

## Follow-up Findings: 输入框文字裁切
- 微信小程序开发者工具下，单行 `input` 若只靠纵向 `padding` 撑高而没有显式 `height/line-height`，容易出现文本只渲染半行、聚焦后偶发恢复的现象
- 当前项目中该写法同时出现在个人信息、地址、发票、投诉建议等多个页面，因此需要按“样式基线问题”统一修，而不是逐页打补丁

## Follow-up Findings: 交易链路边界态联调
- 现有交易链路的主要偏差在于：结算页提交后直接把订单写成 `pending_receipt/success`，跳过了 PRD 明确要求的 `pending_payment -> pending_receipt` 支付状态机
- 交易边界态最适合集中到支付结果页处理，而不是把“继续支付”分散在结算页、订单列表页和订单详情页里各自改订单状态
- 在纯 Mock 小程序里，结算页保留“联调模拟”入口最有效：可直接切换“提交失败 / 支付成功 / 支付中 / 支付失败”，便于微信开发者工具做回流 smoke
- 订单列表页与订单详情页若继续直接 `markOrderPaid`，会绕过支付失败与处理中态；改为统一进入支付结果页后，待支付订单的所有回流才能保持一致
- 当前恢复点已前移到“微信开发者工具联调和视觉验收”

## Follow-up Findings: Swagger 接口映射
- 已验证 Swagger 配置入口为 `http://106.15.108.65:8085/api/v3/api-docs/swagger-config`
- 当前 Swagger 中存在两个分组：`app`（用户端，63 个接口）和 `plat`（管理端，164 个接口）
- 当前仓库是微信小程序前台工程，因此本轮只需要承接 `app` 分组；`plat` 分组应视为后台工程范围，不应混入当前仓库
- 已新增 `docs/swagger-app-接口映射.md`，把 22 个小程序页面与 63 个用户端接口逐条落表
- 当前明确的页面级接口缺口有 5 类：
  - 资讯详情缺少独立详情接口
  - 结算页缺少优惠券接口
  - 结算页缺少创建订单接口
  - 优惠券页缺少整页接口
  - FAQ / 在线咨询缺少完整客服能力接口
- 当前已把缺口模块在页面标题处标记为 `开发中`，覆盖了优惠券、FAQ、在线咨询、资讯详情正文、结算页优惠券和提交订单等位置

## Follow-up Findings: Swagger 接口进度文档化
- 当前代码中还没有真实 API 请求层，也没有 `wx.request` / 网络 client 封装，因此真实接口对接基线应为 `0 / 58` 个页面模块已完成，而不是“已有部分接口接入”
- `docs/swagger-app-接口映射.md` 已从“静态映射表”改造成“概览 + 维护规则 + 分批推进看板 + 行级进度表 + 缺口表 + 待承接接口表 + 全量接口索引”的单文档模式
- 已按当前代码状态初始化对接进度：`48` 个 `待接入`、`1` 个 `前端待补`、`9` 个 `后端阻塞`
- 后续真实接口对接可直接按批次推进：A. 首页 / 选型 / 搜索结果，B. 商品详情 / 收藏加购，C. 购物车 / 地址 / 发票基础能力，D. 下单 / 支付 / 订单域，E. 个人中心，F. 资讯 / 客服 / 投诉建议

## Follow-up Findings: DevTools 启动报错根因
- 当前仓库的正确运行时代码来自 TypeScript 编译产物；`dist/` 经过 `npm run build:miniapp` 后，`custom-tab-bar/index.js`、`components/business/product-card/index.js` 以及所有页面/工具模块都能完整产出
- 启动时报错的直接原因不是组件路径写错，而是源码目录 `miniprogram/` 下的运行时 `.js` 长期未与 `.ts` 同步：部分文件缺失，部分页面仍停留在开发者工具初始化生成的占位 JS
- 这解释了两类现象为何同时出现：
  - `module ... is not defined`：缺少 `custom-tab-bar` / 业务组件的实际 JS 文件
  - `handleRouteTap` 不存在：页面真实逻辑写在 `.ts`，但运行时执行的是旧占位 `index.js`
- 解决方式应落在构建链路，而不是逐页补丁：构建完成后把 `dist` 中编译出的 JS 同步回 `miniprogram/`，保证开发者工具无论预览 `dist/` 还是直接加载源码目录，都不会再读到过期运行时代码

## Follow-up Findings: 真实接口联调计划
- 当前仓库仍没有任何真实请求层：未发现 `wx.request`、统一 `request` client、API config、service/repository 层，因此真实联调不能从页面直接起手
- 当前页面组织方式是“页面直接依赖 `mock/*`，交易与资料草稿依赖 `utils/storage.ts`”，说明联调最稳妥的切入点是新增 `services/*` 封装，让页面从 Mock 读取切换为服务读取，而不是直接把页面改成网络请求堆叠
- 真实接口联调的第一批不应直接从 `/user/*` 业务能力开始，因为当前仓库没有登录页、token 管理或鉴权注入机制；需要先增加联调前置批，解决 `baseUrl`、header、错误归一化和测试 token 注入
- 现有批次顺序里，`A. 首页 / 选型 / 搜索结果` 最适合作为真实联调首批，因为主要依赖公共浏览接口；`B/C/E` 才会明显依赖用户鉴权
- `D. 下单 / 支付结果 / 订单域` 不能完整闭环，主要受三个 Swagger 缺口影响：缺少优惠券接口、缺少支付方式配置接口、缺少创建订单接口；任务文档中应明确该批次只能做“可接部分 + Mock 保留部分”
- `F. 资讯 / 客服 / 投诉建议` 同样不能一次性全部切真实接口；资讯详情、FAQ、在线咨询会话历史与客服回复仍是后端阻塞，只能把资讯列表、投诉建议提交、图片上传等可接部分先落掉
- 已新增详细任务文档：`docs/plans/2026-04-15-api-integration-batches.md`

## Follow-up Findings: S0 联调前置批已完成
- 当前仓库已新增真实接口联调基座，不再是“完全没有请求层”的状态：
  - `miniprogram/api/config.ts`：统一 `API_MODE`、`baseUrl`、开发 token 注入
  - `miniprogram/api/request.ts`：统一 header、超时、业务错误和网络错误归一化
  - `miniprogram/api/modules/*`：按 `home/product/trade/profile/content/support` 分域拆分接口入口
  - `miniprogram/api/adapters/*`：为后续 DTO -> 页面 ViewModel 转换预留稳定层
  - `miniprogram/services/*`：建立页面侧统一读取入口，当前以 Mock shell 和 `browse` 域的 remote/hybrid 起步
- 由于当前没有登录页，`S0` 采用“开发 token + storage 注入”的方式承接 `/user/*` 接口联调，而不是反向先补登录页
- 已新增 Node 侧 smoke tests：`tests/api/config.test.cjs`、`tests/api/request.test.cjs`、`tests/api/browse-service.test.cjs`
- `README.md` 已补齐以下联调说明：
  - `constructmarket_api_mode`
  - `constructmarket_api_base_url`
  - `constructmarket_dev_token`
- `docs/swagger-app-接口映射.md` 现在可以把下一步明确前移到 `A. 首页 / 选型 / 搜索结果`

## Follow-up Findings: currentEnv 刷新时序问题
- `miniprogram/app.ts` 原先在模块顶层执行 `getApiConfig()`，因此 `globalData.currentEnv` 只会在小程序首次加载时读取一次 storage
- 若在微信开发者工具里先启动小程序，再执行 `wx.setStorageSync("constructmarket_api_mode", "hybrid")`，`getApp().globalData.currentEnv` 仍会保持旧值 `mock`
- 这个现象不是 storage 写入失败，而是读取时序问题
- 当前已修复为：
  - 新增 `miniprogram/app-runtime.ts`
  - `onLaunch` 和 `onShow` 都会刷新 runtime config
  - 可在控制台手动执行 `getApp().refreshRuntimeConfig()` 后立即查看最新 `globalData`

## Follow-up Findings: A 批真实接口实现
- 已用 live Swagger 与真实接口样本确认 A 批公共接口无需鉴权即可联调：`home/banners`、`home/categories`、`home/new-arrival-products`、`home/hot-recommend-products`、`home/news-articles`
- `/v1/app/home/search-products` 的真实形态是 `POST` 请求，但筛选条件走 query 参数；直接用 `GET` 会返回 `Request method 'GET' is not supported`
- `home/new-arrival-products`、`home/hot-recommend-products`、`home/search-products` 返回的是 `{ product, skuList }` 嵌套 DTO，而不是页面原先假设的扁平商品对象
- `home/news-articles` 返回的是 `{ industryNews, productKnowledge, decorationGuides }` 分组对象，因此首页资讯入口需要先拍平后再转 ViewModel
- 当前线上分类数据已不是建材场景种子，而是更泛的工业品分类（例如电动工具、劳保用品、手动工具）；分类页不能继续复用原来的建材 mock 文案，只能生成通用类目说明
- 搜索接口当前没有 `material` / `minOrder` 的显式后端参数，因此本轮实现采用“价格区间走服务端、`material/minOrder` 先由前端在真实结果上兼容细筛”的折中方案

## Follow-up Findings: mall-web 对齐走查（进行中）
- 当前小程序远程接口默认基线已明确落在 `miniprogram/api/config.ts`：`DEFAULT_API_BASE_URL = "http://106.15.108.65:8085/api"`
- `mall-web` 当前开发代理入口位于 `../mall-web/vite.config.ts`，默认目标仍是 `VITE_API_PROXY_TARGET || "http://127.0.0.1:8080"`
- `mall-web` 的 axios 基础地址位于 `../mall-web/src/utils/request.ts`，默认走 `import.meta.env.VITE_API_BASE_URL || "/api"`，说明开发期主要依赖 Vite 代理而不是在代码里写死远端
- 因此本轮代理修正的最小正确改动点应优先落在 `mall-web/vite.config.ts`，把默认代理目标切到与小程序一致的 `http://106.15.108.65:8085`
- 当前对齐文档需要至少覆盖两类信息：
  - 业务域维度：首页/分类搜索/商品/购物车结算/订单/个人中心/内容资讯/客服售后
  - 页面模块维度：web 实际页面路由与小程序 `app.json + 分包` 页面路由

## Follow-up Findings: mall-web 对齐走查（完成）
- `mall-web` 当前共有 `25` 个路由；当前小程序共有 `23` 个页面（含分包）
- 两端高度对齐的主链路主要集中在：首页、商品列表/搜索、商品详情、购物车、结算、订单、地址、发票、收藏商品、资讯
- `mall-web` 明显更强的模块有：登录注册找回密码、店铺详情/关注店铺、我的足迹、品牌专区、商品评价、官网首页/官网新闻/官网案例、协议与隐私
- 小程序明显更强的模块有：支付结果页、优惠券独立页、客服系统首页、在线咨询、投诉建议、`webview` 承接页
- 两端最关键的不一致不是页面数量，而是 3 个模型层问题：
  - 订单状态机不同
  - 收藏域口径不同（商品收藏 vs 商品+店铺收藏）
  - 客服域产品形态不同（帮助说明/官网咨询 vs 客服中心/FAQ/聊天/投诉）
- 官网内容、协议和隐私页不适合优先原生重写；更稳妥的对齐方式是让 web 继续作为内容载体，由小程序 `webview` 承接

## Follow-up Findings: 选型 Tab 对齐 mall-web Products（进行中）
- 小程序 `选型` tab 的真实入口是 `miniprogram/pages/category/index`，当前它在导航层被定义为 TabBar 页面，而不是搜索结果子页
- `mall-web` 中与其最接近的 web 基线页是 `src/views/Products.vue`，其路由入口为 `/products`
- 当前小程序 `选型` tab 与 web `Products` 的角色并不完全一致：
  - 小程序更偏“分类导航 + 当前分类热销”
  - web 更偏“商品列表 + 左侧分类树 + 顶部筛选摘要”
- 这意味着本轮改造重点不应是强行复制 web 布局，而是把接口来源、商品信息口径和分类字段对齐到 web，再在小程序 tab 场景下做信息重组
- 下一步调研必须覆盖 3 层：
  - web 页面层：`Products.vue` 实际展示哪些字段

## Follow-up Findings: B 批真实接口实现
- 当前 Swagger `app` 文档里，`/v1/app/product/detail` 实际返回 `product + merchant + skuList` 组合 DTO，而不是单一扁平商品对象
- `/v1/app/product/specs` 的真实结构是 `specs[]` 包裹在对象里，规格值字段为 `specValue`
- `/v1/app/merchant/detail` 的查询参数名是 `id`，不是 `merchantId`
- `/v1/app/user/cart` 的新增请求体需要 `merchantId + productId + skuCode + quantity`；仅有页面侧的 `skuId` 概念不足以直接加购，必须先把详情页规格选择和真实 `skuCode` 对齐
- 首页公共商品流可以匿名访问，但真实商品详情接口在未带 token 的 live 请求下会返回 `401`；因此 B 批实现必须默认支持“带开发 token 联调，缺 token 时在 hybrid 模式 fallback 到 mock”
- 收藏列表接口 `GET /v1/app/user/favorite/product-favorites` 返回的不是纯商品列表，而是“收藏记录 + 嵌套 product + skuList”；页面不能直接吃 DTO，必须先在 adapter 层拍平成当前 `SearchProduct`
- `consult-messages` 适合在 B 批只做“发送留言”这一小段：把聊天输入提交到真实接口，同时继续保留本地欢迎语、自动回复和失败重发；不要提前把 F 批会话历史一起卷进来
- 当前用户已明确：A、B 两批先跳过微信开发者工具人工走查，因此文档状态应保持 `进行中`，并显式写明 `未走查`
  - web 数据层：`api/index.ts`、`stores/products.ts`、类型定义怎样组织请求和返回
  - 小程序数据层：`pages/category/index.ts`、`services/browse.ts`、`api/adapters/browse.ts` 当前怎么组装分类页数据

## Follow-up Findings: 选型 Tab 对齐 mall-web Products（第一轮代码读取）
- web `Products.vue` 当前直接请求 3 类数据：
  - `getCategories()`：左侧分类树
  - `listHomeBrands()`：品牌筛选项
  - `searchProducts(params)`：商品分页列表
- web 商品列表请求参数由页面直接组装，关键参数为：
  - `page` / `pageSize`
  - `keyword`
  - `categoryId`
  - `brandId`（字符串数组）
  - `minPrice` / `maxPrice`
  - `sortType`
- web 页面通过路由 query 持久化筛选条件，当前 URL 参数包括：
  - `keyword`
  - `category`
  - `brand`
  - `minPrice`
  - `maxPrice`
  - `sort`
  - `page`
- web `searchProducts()` 的接口地址是 `/v1/app/home/search-products`，调用方式是 `POST form`，说明 `Products.vue` 实际也在复用首页搜索接口，而不是单独的商品列表接口
- web `SearchParams` 类型里声明了 `brand` 和 `brandId` 两套品牌字段，但 `Products.vue` 实际传的是 `brandId`; 这说明品牌筛选已经按接口口径对齐到 ID，而不是品牌名
- web 当前消费的商品列表结果是标准分页结构：`list / total / page / pageSize / totalPages`
- 小程序 `pages/category/index.ts` 当前只调用一个聚合入口：`browseService.getCategoryShellData(selectedCategoryId, favoriteIds)`
- 小程序 `getCategoryShellData()` 在 remote 模式下当前只做两件事：
  - 调 `homeApi.getCategories()` 生成一级/二级分类树
  - 再用当前一级类目调一次 `homeApi.searchProducts({ categoryId, sortType: "sales_desc", pageSize: 6 })`，取前 `3` 条做“当前热销”
- 小程序当前选型页没有承接 web `Products` 的以下能力：
  - 品牌筛选
  - 价格筛选
  - 排序切换
  - 分页
  - 当前筛选项摘要
  - 商品列表主视图
- 小程序选型页当前展示字段集中在 3 组：
  - 分类树：`rootCategories / subCategories`
  - 当前类目引导信息：`summary / sceneTags / guideTitle / guideSummary / articleTitle`
  - 热销商品：`categoryProducts`
- 小程序 remote 分类树和商品列表已经部分复用与 web 相同的后端接口，但页面信息组织仍然沿用 tab 导航页思路，因此本轮更像“从分类导航页向商品列表入口页靠拢”的改造，而不是简单字段补齐

## Follow-up Findings: 选型 Tab 对齐 mall-web Products（第二轮代码读取）
- web `Products` 页最终展示字段并不只来自 `Products.vue` 自身模板，真正落到商品卡上的字段来自 `src/components/ProductCard.vue`：
  - 图片：`product.image`
  - 标签：`product.tags`
  - 低库存提示：`product.stock` + `product.unit`
  - 品牌：`product.brand`
  - 商品名：`product.name`
  - 规格摘要：`product.specifications[].value`
  - 价格：`product.price` / `product.originalPrice`
  - 销量：`product.salesCount`
  - 评分：`product.rating`
- web 分类侧栏 `Sidebar.vue` 实际只消费分类树的 `id / name / children` 和品牌列表的 `id / name`，没有依赖分类说明、采购建议这类扩展字段
- web `mapHomeCategory()` 直接把 `/v1/app/home/categories` 返回映射为 `Category`，核心字段是：
  - `id`
  - `parentId`
  - `categoryCode`
  - `categoryName -> name`
  - `categoryLevel`
  - `imageUrl`
  - `sortNo`
  - `children`
- web `mapHomeHotRecommendProduct()` 最终仍走 `mapProductDetailToProduct()`，说明 `/v1/app/home/search-products`、`/hot-recommend-products`、`/new-arrival-products` 在 web 端都被收敛成同一个 `Product` 结构
- 小程序 `SearchProduct` 当前字段是：
  - `id / spuId / skuId`
  - `name / cover / brand / model`
  - `price / unit / minOrderQty / salesVolume`
  - `stockStatus / tags / supportInvoice / isFavorite`
  - `categoryId / categoryName / material / coverTone`
- 小程序 `components/business/product-card` 当前实际展示字段是：
  - 顶部封面区只显示 `cover` 文本、`brand`、`model`
  - 正文区显示 `name`
  - 副信息显示 `categoryName + brand/model`
  - 底部显示 `price / unit / minOrderQty / salesVolume`
  - 不显示 web 卡片里的真实图片、原价、评分、库存提醒、规格值列表
- 小程序现有 `package-catalog/search/result` 页面已经具备 web `Products` 的大部分能力：
  - 关键词搜索
  - 分类切换
  - 排序切换
  - 筛选抽屉
  - 商品列表
- 小程序 `search/result` 当前仍与 web `Products` 有两个关键缺口：
  - 缺少品牌筛选及 `listHomeBrands()` 请求链
  - 商品卡展示信息仍沿用小程序 `SearchProduct` 口径，没有体现 web 商品卡的图片/原价/评分/库存信息
- 小程序 `createHomeApi()` 当前没有 `getBrands()` 能力，`createBrowseService()` 也没有品牌过滤参数透传，这会是本轮对齐的核心改造点
- 因此本轮最稳妥的实现方向应为：
  - `选型` tab 页面改为复用 `search/result` 的查询与列表能力
  - 在 browse service / home api 层补品牌筛选数据和请求参数
  - 在小程序商品卡或选型页列表中补齐更接近 web `Products` 的展示字段

## Follow-up Findings: 选型 Tab 对齐 mall-web Products（已落地）
- `选型` tab 最终没有继续沿用旧的 `getCategoryShellData()` 页面模型，而是改为复用 `search/result` 的商品列表能力
- 小程序现在已经具备 web `Products` 页缺失的品牌筛选基础能力：
  - `createHomeApi()` 新增 `getBrands()`
  - `getSearchFilterShell()` 新增 `brandOptions`
  - `searchProductsPage()` 新增 `selectedBrandIds -> brandId` 请求透传
- `SearchProduct` / 商品卡字段已向 web 收敛，新增或补齐：
  - `brandId`
  - `specText`
  - `originalPrice`
  - `rating`
  - `stock`
- `pages/category/index` 当前主视图已变为：
  - 搜索框
  - 分类 chips / 全部分类抽屉
  - 品牌 chips
  - 排序行
  - 当前筛选项摘要
  - 商品列表
- 当前仍保留的小程序差异是有意为之：
  - 不做桌面左侧固定侧栏
  - 不做桌面分页按钮
  - 价格/材质/起订量继续放在小程序筛选抽屉里
- 共享 `product-card` 已补齐 web 商品卡关键展示信息，因此 `search/result` 与新的 `选型` tab 会同时获得更高信息密度
