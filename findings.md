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
