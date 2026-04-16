# mall-web 与 mall-applet 模块对齐走查

日期：2026-04-16  
对照对象：
- Web：`../mall-web`
- 小程序：当前仓库 `mall-applet`

## 1. 本次已执行动作

### 1.1 mall-web 代理已对齐到小程序远端

当前小程序默认远端基线：
- `miniprogram/api/config.ts`
- `DEFAULT_API_BASE_URL = "http://106.15.108.65:8085/api"`

本次已将 `mall-web` 的开发代理目标统一改为同一套远端主机：
- `../mall-web/vite.config.ts`
- `../mall-web/.env.development`
- `../mall-web/.env.test`
- `../mall-web/.env.production`

统一后的 web 代理目标：
- `http://106.15.108.65:8085`

说明：
- Web 端仍保留 `VITE_API_BASE_URL=/api`，浏览器请求仍走 `/api/...`
- 只是把 Vite 代理目标从原来的 `127.0.0.1:8080` / `106.15.108.65:8080` 改成了与小程序一致的 `106.15.108.65:8085`
- 这样 web 与小程序现在都指向同一套远端 API 主机，只是接入方式不同：
  - Web：`/api` + Vite proxy
  - 小程序：直接 `baseUrl = http://106.15.108.65:8085/api`

## 2. 代码库基线

| 项目 | 技术形态 | 页面/路由规模 | 接口接入方式 | 结构特征 |
|---|---|---:|---|---|
| `mall-web` | Vue 3 + Vite + Pinia + Axios | 25 个路由 | `src/utils/request.ts` 走 `/api`，开发期由 Vite 代理转发 | PC/H5 商城 + 官网内容混合 |
| `mall-applet` | 微信原生小程序 + TS + `wx.request` | 23 个页面 | `miniprogram/api/config.ts` + `miniprogram/api/request.ts` 直接请求远端 | 小程序业务域分包更明确 |

`mall-web` 的主要业务入口：
- 路由定义：`../mall-web/src/router/index.ts`
- 页面：`../mall-web/src/views/*.vue`
- API：`../mall-web/src/api/index.ts`

`mall-applet` 的主要业务入口：
- 页面路由：`miniprogram/app.json`
- 页面：`miniprogram/pages/*` + `miniprogram/package-*/*`
- 服务层：`miniprogram/services/*.ts`
- API 模块：`miniprogram/api/modules/*.ts`

## 3. 一句话结论

### 3.1 已经高度对齐的域
- 首页/活动 Banner/热销与上新
- 商品详情主链路
- 购物车
- 结算
- 订单列表与订单详情
- 收货地址
- 发票
- 收藏商品
- 个人中心基础资料
- 资讯列表与资讯详情

### 3.2 可以对齐，但需要改造映射的域
- 分类与搜索：web 更偏“大列表页聚合”，小程序拆成“分类页 + 搜索结果页”
- 个人中心：web 以 `MyJct` 单页承载，小程序拆成首页、资料、地址、发票、收藏、优惠券
- 帮助/客服：web 是 `HelpCenter + 官网咨询`，小程序是 `客服系统首页 + FAQ + 在线咨询 + 投诉建议`
- 官网内容：web 有完整官网/案例/官方新闻，小程序当前更适合通过 `webview` 承接而不是原生重做

### 3.3 当前明显不一致或单边存在的域
- `mall-web` 独有：登录/注册/忘记密码、店铺详情、关注店铺、我的足迹、官网首页、官网新闻、官网案例、协议、隐私
- `mall-applet` 独有：支付结果页、优惠券独立页、客服系统首页、在线咨询页、投诉建议页、`webview` 承接页

## 4. 业务域对照总表

状态说明：
- `高对齐`：两端都已有完整承接，可直接按页面/接口对齐
- `可改造对齐`：两端都有相关能力，但页面组织或交互模型不同
- `仅 web`：web 已有，小程序当前没有
- `仅小程序`：小程序已有，web 当前没有
- `明显不一致`：两端都涉及同一业务，但状态机或产品形态差异较大

| 业务域 | mall-web 已有 | mall-applet 已有 | 对齐判断 | 备注 |
|---|---|---|---|---|
| 首页运营 | `Home.vue` 含 Banner、分类、上新、热销、品牌、资讯 | `pages/home/index` 含 Banner、快捷选型、尖货榜、热门商品、资讯 | 高对齐 | 主链路一致；web 多了“品牌专区” |
| 分类/搜索/列表 | `Products.vue` 聚合搜索、分类、品牌、价格、排序；`ShopDetail.vue` 也有店铺内列表 | `pages/category/index` + `package-catalog/search/result` | 可改造对齐 | web 是一个大列表页，小程序拆成“选型页”和“搜索结果页” |
| 品牌模块 | 首页品牌专区、列表筛选、店铺页品牌筛选 | 搜索占位与 PRD 中存在品牌诉求，但当前没有独立品牌专区 | 可改造对齐 | web 更完整；小程序目前缺独立品牌承接页面 |
| 商品详情 | `ProductDetail.vue` 含规格、店铺、详情、评价、相关推荐 | `package-catalog/product/detail` 含图集、规格、店铺信息、参数、相关推荐 | 高对齐 | 商品详情主链路已能对齐；web 额外有评价区 |
| 店铺/商家 | `ShopDetail.vue`、关注店铺、店铺商品列表、店铺公告 | 商品详情中仅展示店铺卡片，无独立店铺详情页 | 仅 web | 小程序若后续要补商家域，可新增独立店铺页 |
| 收藏 | `Favorites.vue` 同时承接收藏商品与收藏店铺 | `package-profile/profile/favorite` 只承接收藏商品 | 可改造对齐 | 商品收藏能对齐；店铺关注当前无对应小程序页面 |
| 足迹 | `Footprints.vue` | 无独立页面 | 仅 web | 小程序当前未做浏览足迹页 |
| 购物车 | `Cart.vue` | `pages/cart/index` | 高对齐 | 功能基本同域 |
| 结算 | `Checkout.vue` 含地址、商品清单、支付方式、金额摘要 | `package-trade/checkout/index` 含地址、优惠券、发票、备注、支付方式、金额明细 | 高对齐 | 小程序结算承接更完整，含券/票/备注回流 |
| 支付结果 | web 无独立结果页，支付成功后更多通过订单状态回流 | `package-trade/payment/result` | 仅小程序 | 这是当前小程序交易链路的重要补充页 |
| 订单 | `Orders.vue`、`OrderDetail.vue`、取消/支付/再次购买/售后申请 | `package-trade/order/list`、`package-trade/order/detail`、继续支付、确认收货、售后申请 | 高对齐 | 订单主业务可对齐 |
| 订单状态模型 | web 本地订单是 `pending/paid/shipped/delivered/cancelled`，用户订单筛选还涉及 `PENDING_SHIP/PENDING_RECEIPT/PENDING_REVIEW/COMPLETED/CLOSED` | 小程序是 `pending_payment/pending_receipt/completed/after_sale`，另有 `payStatus = unpaid/paying/success/failed` | 明显不一致 | 若继续对齐订单域，需要先统一状态映射 |
| 个人中心 | `MyJct.vue`，集中展示用户资料、订单统计、发票、地址、浏览等 | `pages/profile/index` + `profile/info` + 各子页 | 可改造对齐 | 能力相近，但小程序拆页更细 |
| 个人资料编辑 | `MyJct.vue` 内联编辑头像/资料 | `package-profile/profile/info` 独立资料页 | 可改造对齐 | 数据可对齐，交互组织不同 |
| 地址 | `Addresses.vue` 单页完成列表 + 新增/编辑 | `profile/address/list` + `profile/address/edit` | 高对齐 | 功能一致，小程序拆成两页 |
| 发票 | `Invoices.vue` 承接抬头与开票记录 | `profile/invoice` 承接电子/纸质/管理 | 高对齐 | 能力高度相近 |
| 优惠券 | 未发现独立优惠券页或优惠券域 | `profile/coupon` 独立页，且结算页可回流选券 | 仅小程序 | 当前是小程序独有能力 |
| 资讯内容 | `BuildingNews.vue`、`BuildingNewsDetail.vue`，另有 `OfficialNews*` | `article/list`、`article/detail` | 可改造对齐 | 行业资讯能对齐；官网新闻需单独判断是否纳入 |
| 客服/帮助 | `HelpCenter.vue` 静态帮助；`OfficialSite.vue` 有咨询入口/提交咨询表单 | `support/index`、`support/chat`、`support/faq`、`support/complaint` | 可改造对齐 | 小程序客服链路更完整；web 偏说明页 + 官网咨询 |
| 投诉/咨询提交 | 官网咨询表单 `submitConsultMessage` | 投诉建议页、本地会话式在线咨询 | 可改造对齐 | 都有“联系/反馈”，但不是同一交互模型 |
| 登录/注册/忘记密码 | `Login.vue`、`Register.vue`、`ForgotPassword.vue` | 当前无登录页 | 仅 web | 小程序若走微信授权/免登录，不建议机械对齐 |
| 官网/品牌故事/案例 | `OfficialSite.vue`、`OfficialNews.vue`、`OfficialCaseDetail.vue` | 无原生官网页，但有 `package-content/webview/index` | 可改造对齐 | 推荐优先走 H5 / WebView，不建议在小程序原生重造 |
| 协议/隐私 | `UserAgreement.vue`、`PrivacyPolicy.vue` | 无独立原生页，但有 `webview` 页 | 可改造对齐 | 推荐挂到 H5 页面后由 `webview` 承接 |

## 5. web 路由到小程序页面映射

| mall-web 路由 | web 页面职责 | 小程序对应页 | 当前判断 | 备注 |
|---|---|---|---|---|
| `/` | 商城首页 | `pages/home/index` | 对齐 | 首页主入口 |
| `/products` | 商品列表/搜索/筛选 | `pages/category/index`、`package-catalog/search/result` | 半对齐 | web 合并，小程序拆分 |
| `/product/:id` | 商品详情 | `package-catalog/product/detail` | 对齐 | 主体功能一致 |
| `/cart` | 购物车 | `pages/cart/index` | 对齐 | 一致 |
| `/checkout` | 结算 | `package-trade/checkout/index` | 对齐 | 小程序比 web 多券/票承接 |
| `/login` | 登录 | 无 | web 独有 | 小程序无账号登录页 |
| `/register` | 注册 | 无 | web 独有 | 同上 |
| `/forgot-password` | 找回密码 | 无 | web 独有 | 同上 |
| `/orders` | 订单列表 | `package-trade/order/list` | 对齐 | 一致 |
| `/my-jct` | 个人中心聚合页 | `pages/profile/index`、`profile/info`、`profile/address/*`、`profile/invoice`、`profile/favorite` | 半对齐 | 小程序拆分更细 |
| `/favorites` | 收藏商品 + 收藏店铺 | `profile/favorite` | 半对齐 | 小程序只有商品收藏 |
| `/footprints` | 我的足迹 | 无 | web 独有 | 小程序未承接 |
| `/addresses` | 地址列表 + 编辑 | `profile/address/list`、`profile/address/edit` | 对齐 | 一致 |
| `/invoices` | 发票抬头/记录 | `profile/invoice` | 对齐 | 一致 |
| `/order/:id` | 订单详情 | `package-trade/order/detail` | 对齐 | 一致 |
| `/shop/:id` | 店铺详情 | 无 | web 独有 | 小程序仅有商品详情中的店铺卡 |
| `/help-center` | 帮助中心/FAQ | `support/index`、`support/faq` | 半对齐 | 小程序拆成客服中心与 FAQ |
| `/terms` | 用户协议 | `package-content/webview/index` | 可转接 | 建议走 H5 |
| `/privacy` | 隐私政策 | `package-content/webview/index` | 可转接 | 建议走 H5 |
| `/building-news` | 行业资讯列表 | `package-content/article/list` | 对齐 | 一致 |
| `/building-news/:slug` | 行业资讯详情 | `package-content/article/detail` | 对齐 | 一致 |
| `/official` | 官网首页/品牌展示/咨询转化 | `package-content/webview/index` | 可转接 | 不建议小程序原生重造 |
| `/official/news` | 官网新闻列表 | `package-content/webview/index` 或 `article/list` | 半对齐 | 若纳入内容域可改造成资讯列表，否则优先 H5 |
| `/official/news/:slug` | 官网新闻详情 | `package-content/webview/index` 或 `article/detail` | 半对齐 | 同上 |
| `/official/cases/:slug` | 官网案例详情 | `package-content/webview/index` | 可转接 | 小程序无原生案例页 |

## 6. 小程序独有页索引

| 小程序页面 | 当前职责 | web 是否已有直接对应 | 结论 |
|---|---|---|---|
| `package-trade/payment/result` | 支付成功/失败/处理中结果页 | 无 | 小程序独有，建议保留 |
| `package-profile/profile/coupon` | 优惠券列表与结算回流 | 无 | 小程序独有 |
| `package-support/support/index` | 客服系统首页 | `HelpCenter` 仅部分对应 | 需要以小程序为准单独保留 |
| `package-support/support/chat` | 在线咨询会话 | 无直接对应 | 小程序独有 |
| `package-support/support/complaint` | 投诉建议表单 | 官网咨询表单仅部分对应 | 小程序更完整 |
| `package-content/webview/index` | H5 承接壳子 | web 自身不是“壳子”页 | 这是小程序用于承接官网/协议的基础设施 |

## 7. 重点不一致项

### 7.1 订单状态机不一致

web 端：
- 订单态更多沿用传统商城语义：`pending / paid / shipped / delivered / cancelled`
- 用户订单分页还涉及后端态：`PENDING_SHIP / PENDING_RECEIPT / PENDING_REVIEW / COMPLETED / CLOSED`

小程序：
- 订单态是：`pending_payment / pending_receipt / completed / after_sale`
- 支付态是独立字段：`unpaid / paying / success / failed`
- 还有单独的 `payment/result` 页面承接支付过程

结论：
- 如果后续要让两个端“订单模块完全对齐”，必须先整理一张状态映射表
- 否则页面按钮、状态文案、筛选 tab、支付回流逻辑会持续不一致

### 7.2 分类/搜索组织方式不同

web：
- 一个 `/products` 页里同时做搜索词、分类、品牌、价格、排序、筛选标签

小程序：
- `pages/category/index` 更像“选型入口页”
- `package-catalog/search/result` 才是“搜索结果页”

结论：
- 业务上可以对齐
- 但页面层不要要求“一页一比一”
- 更合理的对齐方式是按“分类入口 / 搜索结果 / 筛选能力”三层拆解

### 7.3 收藏域口径不同

web：
- 收藏商品
- 收藏店铺

小程序：
- 仅收藏商品

结论：
- 如果后续要补齐商家域，小程序还需要新增“关注店铺”承接页或在个人中心新增入口

### 7.4 客服域实现方式不同

web：
- `HelpCenter` 偏内容说明
- `OfficialSite` 有咨询入口和咨询提交

小程序：
- `support/index`
- `support/faq`
- `support/chat`
- `support/complaint`

结论：
- 小程序的客服/售后链路更接近“交易后服务闭环”
- web 当前更偏“官网咨询 + 帮助说明”
- 后续对齐时，应先按“FAQ / 在线咨询 / 投诉反馈 / 服务入口”拆分，而不是直接拿 `HelpCenter` 去对 `support/index`

### 7.5 官网内容更适合通过 WebView 承接

web 已有：
- 官网首页
- 官网新闻
- 官网案例
- 协议
- 隐私

小程序已有：
- `package-content/webview/index`

结论：
- 这些模块不建议优先原生重写
- 更合适的对齐方案是：
  1. web 继续承担内容载体
  2. 小程序通过 `webview` 打开对应 H5 页面
  3. 只把必须原生化的交易页或列表页单独重做

## 8. 各自独有能力清单

### 8.1 mall-web 独有
- 登录
- 注册
- 忘记密码
- 店铺详情
- 收藏店铺
- 我的足迹
- 官网首页
- 官网新闻
- 官网案例
- 用户协议
- 隐私政策
- 品牌专区（当前比小程序更完整）
- 商品评价区（当前比小程序更完整）

### 8.2 mall-applet 独有
- 支付结果页
- 优惠券页
- 客服系统首页
- 在线咨询页
- 投诉建议页
- WebView 承接页
- 结算页中的联调模拟能力

## 9. 建议的后续对齐优先级

### 优先级 A：直接对齐
- 首页
- 搜索/分类
- 商品详情
- 购物车
- 结算
- 订单列表/详情
- 地址
- 发票
- 收藏商品

### 优先级 B：拆域后对齐
- 个人中心
- 资讯内容
- FAQ / 帮助
- 投诉/咨询

### 优先级 C：暂不强行原生化
- 官网首页
- 官网新闻
- 官网案例
- 协议/隐私

### 优先级 D：需要先补产品决策
- 登录/注册是否要进小程序
- 是否新增店铺详情页
- 是否补浏览足迹
- 是否补“关注店铺”
- 是否让小程序承接品牌专区

## 10. 后续检索锚点

这一节是给后续人工和 AI 继续查模块时用的。

| 域 | mall-web 检索入口 | mall-applet 检索入口 |
|---|---|---|
| 路由总表 | `../mall-web/src/router/index.ts` | `miniprogram/app.json` |
| 首页/浏览 | `../mall-web/src/views/Home.vue`、`../mall-web/src/api/index.ts` | `miniprogram/pages/home/index.*`、`miniprogram/services/browse.ts`、`miniprogram/api/modules/home.ts` |
| 分类/搜索 | `../mall-web/src/views/Products.vue`、`../mall-web/src/components/Sidebar.vue` | `miniprogram/pages/category/index.*`、`miniprogram/package-catalog/search/result.*`、`miniprogram/services/browse.ts` |
| 商品详情 | `../mall-web/src/views/ProductDetail.vue` | `miniprogram/package-catalog/product/detail.*`、`miniprogram/services/browse.ts` |
| 店铺/商家 | `../mall-web/src/views/ShopDetail.vue`、`../mall-web/src/stores/favorites.ts` | 当前无独立页；可从 `miniprogram/package-catalog/product/detail.*` 中的店铺卡开始追 |
| 购物车 | `../mall-web/src/views/Cart.vue`、`../mall-web/src/stores/cart.ts` | `miniprogram/pages/cart/index.*`、`miniprogram/services/trade.ts` |
| 结算/支付 | `../mall-web/src/views/Checkout.vue` | `miniprogram/package-trade/checkout/index.*`、`miniprogram/package-trade/payment/result.*`、`miniprogram/services/trade.ts` |
| 订单 | `../mall-web/src/views/Orders.vue`、`../mall-web/src/views/OrderDetail.vue` | `miniprogram/package-trade/order/list.*`、`miniprogram/package-trade/order/detail.*`、`miniprogram/utils/order.ts` |
| 个人中心 | `../mall-web/src/views/MyJct.vue` | `miniprogram/pages/profile/index.*`、`miniprogram/package-profile/profile/info.*`、`miniprogram/services/profile.ts` |
| 地址 | `../mall-web/src/views/Addresses.vue`、`../mall-web/src/stores/addresses.ts` | `miniprogram/package-profile/profile/address/*`、`miniprogram/services/trade.ts` |
| 发票 | `../mall-web/src/views/Invoices.vue`、`../mall-web/src/stores/invoices.ts` | `miniprogram/package-profile/profile/invoice.*`、`miniprogram/services/trade.ts` |
| 收藏 | `../mall-web/src/views/Favorites.vue`、`../mall-web/src/stores/favorites.ts` | `miniprogram/package-profile/profile/favorite.*`、`miniprogram/utils/storage.ts` |
| 足迹 | `../mall-web/src/views/Footprints.vue` | 当前无独立小程序页 |
| 资讯 | `../mall-web/src/views/BuildingNews*.vue`、`../mall-web/src/views/OfficialNews*.vue` | `miniprogram/package-content/article/*`、`miniprogram/services/content.ts` |
| 客服/帮助 | `../mall-web/src/views/HelpCenter.vue`、`../mall-web/src/views/OfficialSite.vue` | `miniprogram/package-support/support/*`、`miniprogram/services/support.ts` |
| 协议/隐私/官网内容 | `../mall-web/src/views/UserAgreement.vue`、`PrivacyPolicy.vue`、`OfficialSite.vue` | `miniprogram/package-content/webview/index.*` |

## 11. 结论性建议

如果后续要继续做“web 与小程序模块对齐”，建议遵循这三个原则：

1. 先按业务域对齐，不要按页面壳子强行一比一。
2. 交易主链路优先原生对齐，官网内容优先 `webview` 承接。
3. 在开始补差之前，先统一订单状态、客服域口径、收藏域口径这三类模型，否则页面越做越散。
