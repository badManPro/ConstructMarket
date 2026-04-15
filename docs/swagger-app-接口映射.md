# ConstructMarket Swagger 接口映射

## 1. 结论概览

| 项 | 内容 |
| --- | --- |
| Swagger 页面 | `http://106.15.108.65:8085/api/swagger-ui/index.html#/` |
| Swagger 配置 | `http://106.15.108.65:8085/api/v3/api-docs/swagger-config` |
| 用户端 OpenAPI | `http://106.15.108.65:8085/api/v3/api-docs/app` |
| 管理端 OpenAPI | `http://106.15.108.65:8085/api/v3/api-docs/plat` |
| 本次核对时间 | `2026-04-15` |
| 当前小程序页面数 | `22` 个页面路由 |
| 用户端接口数 | `63` 个 |
| 管理端接口数 | `164` 个 |

> 说明：
> 1. 当前仓库是用户端微信小程序，只需要承接 `app` 分组。
> 2. `plat` 分组属于后台/管理端接口，当前仓库没有管理后台页面，因此不纳入本轮接入范围。
> 3. 文档按“当前页面模块 -> 可接接口 -> 接口缺口 -> 全量接口清单”展开，保证用户端 `63` 个接口逐条落表。

## 2. 页面与模块接入总表

状态说明：

| 状态 | 含义 |
| --- | --- |
| 可直接对接 | Swagger 已有直接接口，页面可按现有结构接入 |
| 可组合对接 | 需要组合多个已有接口，或页面数据需要前端聚合 |
| 缺接口 | 当前页面已存在，但 Swagger 没有对应接口，暂时只能保留本地 Mock |
| 暂无页面承接 | Swagger 有接口，但当前小程序没有对应页面或模块 |

| 页面 | 路由 | 模块 | 建议对接接口 | 状态 | 说明 |
| --- | --- | --- | --- | --- | --- |
| 首页 | `pages/home/index` | Banner 轮播 | `GET /v1/app/home/banners` | 可直接对接 | 直接替换当前本地 Banner 数据 |
| 首页 | `pages/home/index` | 快捷选型/分类导航 | `GET /v1/app/home/categories` | 可直接对接 | 同时供首页和选型页复用 |
| 首页 | `pages/home/index` | 尖货榜单/新品区 | `GET /v1/app/home/new-arrival-products` | 可直接对接 | 可承接当前“尖货榜单 限时抢”模块 |
| 首页 | `pages/home/index` | 热门商品推荐 | `GET /v1/app/home/hot-recommend-products` | 可直接对接 | 商品卡结构可直接复用 |
| 首页 | `pages/home/index` | 搜索跳转 | `POST /v1/app/home/search-products` | 可直接对接 | 首页只负责带词跳转，结果页真正请求 |
| 首页 | `pages/home/index` | 建材资讯入口 | `GET /v1/app/home/news-articles`、`POST /v1/app/news/page` | 可组合对接 | 首页取轻量资讯流，列表页取完整分页数据 |
| 选型 | `pages/category/index` | 一级类目/二级类目 | `GET /v1/app/home/categories` | 可直接对接 | 当前左右分栏结构可直接吃分类树 |
| 选型 | `pages/category/index` | 当前热销 | `POST /v1/app/home/search-products` | 可直接对接 | 通过类目 ID/关键词过滤当前热销列表 |
| 选型 | `pages/category/index` | 采购建议 | `POST /v1/app/news/page` | 可组合对接 | 可按类目维度做资讯推荐，但没有独立“采购建议”接口 |
| 搜索结果 | `package-catalog/search/result` | 搜索、排序、筛选结果 | `POST /v1/app/home/search-products` | 可直接对接 | 结果列表、排序和筛选条件都应落到该接口 |
| 搜索结果 | `package-catalog/search/result` | 更多类目抽屉 | `GET /v1/app/home/categories` | 可直接对接 | 类目切换数据来自分类接口 |
| 搜索结果 | `package-catalog/search/result` | 筛选项枚举 | `GET /v1/app/dict/simple-list`、`GET /v1/app/dict/tree-list` | 可组合对接 | 当前价格/材质/起订量仍是本地静态项，可后续字典化 |
| 商品详情 | `package-catalog/product/detail` | 商品主信息 | `GET /v1/app/product/detail` | 可直接对接 | 包含图集、标题、价格、起订量、服务说明 |
| 商品详情 | `package-catalog/product/detail` | 店铺信息 | `GET /v1/app/merchant/detail` | 可直接对接 | 承接当前“店铺信息”卡片 |
| 商品详情 | `package-catalog/product/detail` | 规格参数 | `GET /v1/app/product/specs` | 可直接对接 | 对应规格弹层和商品参数区 |
| 商品详情 | `package-catalog/product/detail` | 收藏/取消收藏 | `POST /v1/app/user/favorite/product-favorites/{productId}`、`DELETE /v1/app/user/favorite/product-favorites/{productId}` | 可直接对接 | 首页、搜索页、详情页、收藏页统一复用 |
| 商品详情 | `package-catalog/product/detail` | 加入购物车 | `POST /v1/app/user/cart` | 可直接对接 | 当前按钮行为与接口动作一致 |
| 商品详情 | `package-catalog/product/detail` | 浏览记录 | `POST /v1/app/user/browse/{productId}` | 可直接对接 | 建议在详情页 `onLoad/onShow` 时补记 |
| 商品详情 | `package-catalog/product/detail` | 在线咨询入口 | `POST /v1/app/consult-messages` | 可组合对接 | 可用于发送留言，但不是完整 IM 会话 |
| 建材资讯 | `package-content/article/list` | 分类 Tab / 资讯列表 | `POST /v1/app/news/page` | 可直接对接 | 列表页主接口 |
| 资讯详情 | `package-content/article/detail` | 正文内容 | 缺少 `news detail` 类接口 | 缺接口 | 目前只有列表接口，没有独立资讯详情接口 |
| 资讯详情 | `package-content/article/detail` | 相关推荐 | `POST /v1/app/news/page` | 可组合对接 | 可按同分类再拉一页列表做兜底推荐 |
| 购物车 | `pages/cart/index` | 购物车列表 | `GET /v1/app/user/cart` | 可直接对接 | 对应列表初始化 |
| 购物车 | `pages/cart/index` | 勾选、数量、删除、清空 | `POST /v1/app/user/cart/{cartItemId}/quantity`、`DELETE /v1/app/user/cart/{cartItemId}`、`DELETE /v1/app/user/cart` | 可直接对接 | 当前页面能力与接口集合吻合 |
| 确认订单 | `package-trade/checkout/index` | 收货地址 | `GET /v1/app/user/address`、`POST /v1/app/user/address`、`PUT /v1/app/user/address/{addressId}`、`DELETE /v1/app/user/address/{addressId}` | 可组合对接 | 结算页只消费地址结果，地址维护在地址页完成 |
| 确认订单 | `package-trade/checkout/index` | 发票信息 | `GET /v1/app/user/invoice/titles`、`POST /v1/app/user/invoice/titles`、`PUT /v1/app/user/invoice/titles/{invoiceTitleId}`、`DELETE /v1/app/user/invoice/titles/{invoiceTitleId}` | 可组合对接 | 当前结算页可从发票中心回流抬头与开票信息 |
| 确认订单 | `package-trade/checkout/index` | 优惠券 | 缺少 `coupon list/select` 类接口 | 缺接口 | 当前优惠券页和结算优惠券选择只能继续保留本地 Mock |
| 确认订单 | `package-trade/checkout/index` | 支付方式 | 暂无专用配置接口 | 缺接口 | 当前微信/支付宝/银联仍需静态配置 |
| 确认订单 | `package-trade/checkout/index` | 提交订单 | 缺少 `create order` 类接口 | 缺接口 | 当前只有 `payOrder`，没有“创建订单”接口 |
| 支付结果 | `package-trade/payment/result` | 支付状态展示/继续支付 | `POST /v1/app/user/orders/pay`、`GET /v1/app/user/orders/detail` | 可组合对接 | 有订单后可用支付接口重试、详情接口回查 |
| 订单列表 | `package-trade/order/list` | 订单分页列表 | `POST /v1/app/user/orders` | 可直接对接 | 状态 Tab 与分页列表都走该接口 |
| 订单列表 | `package-trade/order/list` | 继续支付 | `POST /v1/app/user/orders/pay` | 可直接对接 | 与支付结果页联动 |
| 订单详情 | `package-trade/order/detail` | 订单详情 | `GET /v1/app/user/orders/detail` | 可直接对接 | 页面主数据来源 |
| 订单详情 | `package-trade/order/detail` | 确认收货 | `POST /v1/app/user/orders/confirm-receipt` | 可直接对接 | 对应当前主按钮 |
| 订单详情 | `package-trade/order/detail` | 申请售后 | `POST /v1/app/user/orders/after-sale` | 可直接对接 | 对应当前售后动作 |
| 订单详情 | `package-trade/order/detail` | 继续支付 | `POST /v1/app/user/orders/pay` | 可直接对接 | 待支付订单可重试 |
| 发票中心 | `package-profile/profile/invoice` | 开票记录 | `POST /v1/app/user/invoice/records` | 可直接对接 | 管理页记录列表直接承接 |
| 发票中心 | `package-profile/profile/invoice` | 提交开票申请 | `POST /v1/app/user/invoice/records/apply` | 可直接对接 | 当前“提交开票申请”动作可替换 |
| 发票中心 | `package-profile/profile/invoice` | 发票抬头管理 | `GET/POST/PUT/DELETE /v1/app/user/invoice/titles` | 可直接对接 | 当前页面可扩展成真正的抬头管理 |
| 发票中心 | `package-profile/profile/invoice` | 可开票订单 | `POST /v1/app/user/orders`、`GET /v1/app/user/orders/detail` | 可组合对接 | 没有独立“可开票订单”接口，需要从订单域筛选 |
| 收货地址 | `package-profile/profile/address/list` | 地址列表/默认地址/删除 | `GET /v1/app/user/address`、`DELETE /v1/app/user/address/{addressId}` | 可直接对接 | 默认地址字段随列表返回 |
| 地址编辑 | `package-profile/profile/address/edit` | 新增/编辑地址 | `POST /v1/app/user/address`、`PUT /v1/app/user/address/{addressId}` | 可直接对接 | 与当前表单能力一致 |
| 收藏夹 | `package-profile/profile/favorite` | 收藏商品列表 | `GET /v1/app/user/favorite/product-favorites` | 可直接对接 | 当前列表页可直接切换到接口数据 |
| 收藏夹 | `package-profile/profile/favorite` | 取消收藏 | `DELETE /v1/app/user/favorite/product-favorites/{productId}` | 可直接对接 | 与现有取消动作一致 |
| 收藏夹 | `package-profile/profile/favorite` | 快捷加购 | `POST /v1/app/user/cart` | 可直接对接 | 当前“快捷加购”不依赖额外接口 |
| 优惠券 | `package-profile/profile/coupon` | 可用券/不可用券/选择使用 | 缺少 `coupon list/select` 类接口 | 缺接口 | 整页暂无可接接口 |
| 个人信息 | `package-profile/profile/info` | 当前用户资料读取/更新 | `GET /v1/app/user/info`、`PUT /v1/app/user/info` | 可直接对接 | 当前表单结构能直接落接口 |
| 个人信息 | `package-profile/profile/info` | 实名认证 | `POST /v1/app/user/real-auth` | 可直接对接 | 但当前页面还没有实名认证 UI，需要补模块 |
| 我的 | `pages/profile/index` | 用户主页摘要 | `GET /v1/app/user/home-page` | 可直接对接 | 适合承接订单摘要、优惠券数、地址摘要 |
| 我的 | `pages/profile/index` | 收藏数/发票数/地址数汇总 | `GET /v1/app/user/favorite/product-favorites`、`POST /v1/app/user/invoice/records`、`GET /v1/app/user/address` | 可组合对接 | 当前首页摘要卡可由多个接口聚合 |
| 我的 | `pages/profile/index` | 优惠券入口 | 缺少 `coupon list` 类接口 | 缺接口 | 入口已保留，但详情页仍只能本地 Mock |
| 客服系统 | `package-support/support/index` | 客服入口卡片 | 暂无专用接口 | 缺接口 | 当前服务入口说明和卡片都是前端静态数据 |
| 在线咨询 | `package-support/support/chat` | 发送咨询消息 | `POST /v1/app/consult-messages` | 可部分对接 | 只能提交留言，缺少会话历史/客服回复接口 |
| 在线咨询 | `package-support/support/chat` | 会话历史、客服回复、重发 | 缺少 `chat session/history/reply` 类接口 | 缺接口 | 整页核心链路仍需 Mock |
| 常见问题 | `package-support/support/faq` | FAQ 分类/问题列表 | 缺少 `faq list` 类接口 | 缺接口 | 整页暂无可接接口 |
| 投诉建议 | `package-support/support/complaint` | 提交投诉建议 | `POST /v1/app/consult-messages` | 可组合对接 | 可将投诉建议也落为咨询留言 |
| 投诉建议 | `package-support/support/complaint` | 图片凭证上传 | `POST /v1/app/file/upload` | 可直接对接 | 对应当前“图片凭证”模块 |
| 投诉建议 | `package-support/support/complaint` | 关联订单 | `POST /v1/app/user/orders`、`GET /v1/app/user/orders/detail` | 可组合对接 | 用于选择/校验关联订单 |

## 3. 已识别的接口缺口与“开发中”标记

以下模块当前已在页面中补充 `开发中` 标记，用于提示研发和测试同学该模块暂时只能保留本地演示态。

| 页面 | 路由 | 缺口模块 | 当前缺少的后端接口 | 页面标记位置 |
| --- | --- | --- | --- | --- |
| 资讯详情 | `package-content/article/detail` | 正文内容 | 缺少资讯详情接口 | `正文内容` 区块标题 |
| 确认订单 | `package-trade/checkout/index` | 优惠券 | 缺少优惠券列表/选择接口 | `优惠券` 行标题 |
| 确认订单 | `package-trade/checkout/index` | 提交订单 | 缺少创建订单接口 | `提交订单` 联调标题 |
| 我的 | `pages/profile/index` | 优惠券入口 | 缺少优惠券接口 | `优惠券` 服务入口标题 |
| 优惠券 | `package-profile/profile/coupon` | 整页 | 缺少优惠券相关全部接口 | 页面主标题 |
| 客服系统 | `package-support/support/index` | 在线咨询入口 | 缺少完整在线客服会话接口 | `在线咨询` 卡片标题 |
| 客服系统 | `package-support/support/index` | 常见问题入口 | 缺少 FAQ 列表接口 | `常见问题` 卡片标题 |
| 在线咨询 | `package-support/support/chat` | 整页核心链路 | 缺少消息列表、客服回复、历史会话接口 | 页面主标题 |
| 常见问题 | `package-support/support/faq` | 整页 | 缺少 FAQ 列表接口 | 页面主标题 |

## 4. Swagger 有接口，但当前小程序暂无页面承接

| 接口 | 说明 | 建议后续承接页面 |
| --- | --- | --- |
| `POST /v1/app/login/register` | 用户注册 | 登录/注册页 |
| `POST /v1/app/login/user` | 普通用户登录 | 登录/注册页 |
| `POST /v1/app/login/logout` | 用户登出 | 设置页 / 账号页 |
| `POST /v1/app/login/sms-code/send` | 发送验证码 | 登录/注册页 |
| `GET /v1/app/login/wechat/authorize-url` | 微信扫码授权地址 | 启动授权页 |
| `POST /v1/app/login/wechat/code` | 微信 code 登录 | 启动授权页 |
| `POST /v1/app/login/wechat/bind-mobile` | 微信绑定手机号 | 手机绑定页 |
| `GET /v1/app/notices` | 平台公告列表 | 首页公告栏 / 公告页 |
| `GET /v1/app/notices/detail` | 平台公告详情 | 公告详情页 |
| `GET /v1/app/home/brands` | 品牌列表 | 首页品牌专区 / 搜索品牌筛选 |
| `POST /v1/app/merchant/products` | 商户商品列表 | 店铺主页 / 商户商品页 |
| `POST /v1/app/product/reviews` | 商品评价列表 | 商品评价页 / 详情评价模块 |
| `GET /v1/app/file/download` | 文件下载 | 发票下载 / 附件下载 |
| `DELETE /v1/app/user/browse` | 清空浏览记录 | 浏览足迹页 |
| `POST /v1/app/user/browse` | 浏览记录分页列表 | 浏览足迹页 |
| `DELETE /v1/app/user/browse/{browseLogId}` | 删除浏览记录 | 浏览足迹页 |
| `GET /v1/app/user/favorite/merchant-follows` | 关注店铺列表 | 关注店铺页 |
| `POST /v1/app/user/favorite/merchant-follows/{merchantId}` | 关注店铺 | 商品详情店铺模块 / 店铺页 |
| `DELETE /v1/app/user/favorite/merchant-follows/{merchantId}` | 取消关注店铺 | 关注店铺页 |
| `POST /v1/app/user/orders/cancel` | 取消订单 | 订单列表 / 订单详情取消按钮 |
| `POST /v1/app/user/orders/review` | 提交订单评价 | 评价页 |
| `POST /v1/app/user/real-auth` | 用户实名认证 | 个人信息页新增认证模块 |

## 5. 用户端 `app` 全量接口清单

### 5.1 登录接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/app/login/logout` | 用户登出 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/login/register` | 普通用户注册 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/login/sms-code/send` | 发送登录/注册验证码 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/login/user` | 普通用户登录 | 当前暂无页面承接 | 暂无页面承接 |
| `GET` | `/v1/app/login/wechat/authorize-url` | 获取微信扫码授权地址 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/login/wechat/bind-mobile` | 微信绑定手机号 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/login/wechat/code` | 微信 code 登录 | 当前暂无页面承接 | 暂无页面承接 |

### 5.2 平台公告前台接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/notices` | 查询平台公告列表 | 首页公告栏（待新增） | 暂无页面承接 |
| `GET` | `/v1/app/notices/detail` | 查询平台公告详情 | 公告详情页（待新增） | 暂无页面承接 |

### 5.3 商户接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/merchant/detail` | 获取商户详情 | 商品详情页 `店铺信息` | 可直接对接 |
| `POST` | `/v1/app/merchant/products` | 分页获取商户商品列表 | 店铺主页 / 商户商品页（待新增） | 暂无页面承接 |

### 5.4 商品接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/product/detail` | 获取商品详情 | 商品详情页主信息 | 可直接对接 |
| `POST` | `/v1/app/product/reviews` | 分页获取商品评价列表和评分 | 商品评价模块（待新增） | 暂无页面承接 |
| `GET` | `/v1/app/product/specs` | 获取商品规格参数 | 商品详情页规格弹层/参数区 | 可直接对接 |

### 5.5 首页接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/home/banners` | 获取首页 Banner 列表 | 首页 Banner | 可直接对接 |
| `GET` | `/v1/app/home/brands` | 获取品牌列表 | 首页品牌专区（待新增） | 暂无页面承接 |
| `GET` | `/v1/app/home/categories` | 获取商品分类列表 | 首页快捷选型、选型页、搜索类目抽屉 | 可直接对接 |
| `GET` | `/v1/app/home/hot-recommend-products` | 获取商品热门推荐列表 | 首页热门商品推荐 | 可直接对接 |
| `GET` | `/v1/app/home/new-arrival-products` | 获取新品上架商品列表 | 首页尖货榜单 / 新品区 | 可直接对接 |
| `GET` | `/v1/app/home/news-articles` | 获取首页新闻资讯列表 | 首页资讯入口 | 可直接对接 |
| `POST` | `/v1/app/home/search-products` | 分页获取商品搜索列表 | 首页搜索跳转、搜索结果、选型页热销 | 可直接对接 |

### 5.6 文件接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/file/download` | 下载文件 | 当前暂无页面承接 | 暂无页面承接 |
| `POST` | `/v1/app/file/upload` | 上传文件 | 投诉建议页 `图片凭证` | 可直接对接 |

### 5.7 新闻资讯前台接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/app/news/page` | 分页查询新闻资讯 | 资讯列表页、首页查看更多、选型页采购建议 | 可直接对接 |

### 5.8 用户订单接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/app/user/orders` | 分页获取用户订单列表 | 订单列表页、发票中心可开票订单、投诉建议关联订单 | 可直接对接 |
| `POST` | `/v1/app/user/orders/after-sale` | 申请订单售后 | 订单详情页售后动作 | 可直接对接 |
| `POST` | `/v1/app/user/orders/cancel` | 取消订单 | 订单列表/详情取消按钮（待补 UI） | 暂无页面承接 |
| `POST` | `/v1/app/user/orders/confirm-receipt` | 确认收货 | 订单详情页主按钮 | 可直接对接 |
| `GET` | `/v1/app/user/orders/detail` | 获取订单详情 | 订单详情页、支付结果页回查 | 可直接对接 |
| `POST` | `/v1/app/user/orders/pay` | 用户订单支付 | 支付结果页、订单列表继续支付、订单详情继续支付 | 可直接对接 |
| `POST` | `/v1/app/user/orders/review` | 提交订单评价 | 评价页（待新增） | 暂无页面承接 |

### 5.9 用户发票接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/app/user/invoice/records` | 分页获取用户发票申请记录 | 发票中心记录列表 | 可直接对接 |
| `POST` | `/v1/app/user/invoice/records/apply` | 提交用户开票申请 | 发票中心提交申请 | 可直接对接 |
| `GET` | `/v1/app/user/invoice/titles` | 获取用户发票抬头列表 | 发票中心、结算页发票选择 | 可直接对接 |
| `POST` | `/v1/app/user/invoice/titles` | 新增用户发票抬头 | 发票中心 | 可直接对接 |
| `DELETE` | `/v1/app/user/invoice/titles/{invoiceTitleId}` | 删除用户发票抬头 | 发票中心 | 可直接对接 |
| `PUT` | `/v1/app/user/invoice/titles/{invoiceTitleId}` | 编辑用户发票抬头 | 发票中心 | 可直接对接 |

### 5.10 用户购物车接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `DELETE` | `/v1/app/user/cart` | 清空当前用户购物车 | 购物车页清空/清空失效商品 | 可直接对接 |
| `GET` | `/v1/app/user/cart` | 获取当前用户购物车列表 | 购物车页初始化 | 可直接对接 |
| `POST` | `/v1/app/user/cart` | 添加商品到当前用户购物车 | 商品详情页、收藏夹快捷加购 | 可直接对接 |
| `DELETE` | `/v1/app/user/cart/{cartItemId}` | 删除购物车商品 | 购物车页删除 | 可直接对接 |
| `POST` | `/v1/app/user/cart/{cartItemId}/quantity` | 修改购物车商品数量 | 购物车页数量步进器 | 可直接对接 |

### 5.11 用户浏览记录接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `DELETE` | `/v1/app/user/browse` | 清空用户浏览记录 | 浏览足迹页（待新增） | 暂无页面承接 |
| `POST` | `/v1/app/user/browse` | 分页获取用户浏览记录列表 | 浏览足迹页（待新增） | 暂无页面承接 |
| `DELETE` | `/v1/app/user/browse/{browseLogId}` | 删除用户浏览记录 | 浏览足迹页（待新增） | 暂无页面承接 |
| `POST` | `/v1/app/user/browse/{productId}` | 新增用户浏览记录 | 商品详情页埋点 | 可直接对接 |

### 5.12 用户收藏关注接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/user/favorite/merchant-follows` | 获取关注店铺列表 | 关注店铺页（待新增） | 暂无页面承接 |
| `DELETE` | `/v1/app/user/favorite/merchant-follows/{merchantId}` | 取消关注店铺 | 关注店铺页（待新增） | 暂无页面承接 |
| `POST` | `/v1/app/user/favorite/merchant-follows/{merchantId}` | 用户关注店铺 | 商品详情店铺模块（待新增） | 暂无页面承接 |
| `GET` | `/v1/app/user/favorite/product-favorites` | 获取收藏商品列表 | 收藏夹页、我的页汇总数 | 可直接对接 |
| `DELETE` | `/v1/app/user/favorite/product-favorites/{productId}` | 取消收藏商品 | 收藏夹页、商品卡取消收藏 | 可直接对接 |
| `POST` | `/v1/app/user/favorite/product-favorites/{productId}` | 用户收藏商品 | 首页、搜索页、选型页、商品详情页 | 可直接对接 |

### 5.13 用户收货地址接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/user/address` | 获取用户收货地址列表 | 地址页、结算页、我的页摘要 | 可直接对接 |
| `POST` | `/v1/app/user/address` | 新增用户收货地址 | 地址编辑页 | 可直接对接 |
| `DELETE` | `/v1/app/user/address/{addressId}` | 删除用户收货地址 | 地址列表页 | 可直接对接 |
| `PUT` | `/v1/app/user/address/{addressId}` | 编辑用户收货地址 | 地址编辑页 | 可直接对接 |

### 5.14 用户信息接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/user/home-page` | 获取当前登录用户主页信息 | 我的页 | 可直接对接 |
| `GET` | `/v1/app/user/info` | 获取当前登录用户信息 | 个人信息页 | 可直接对接 |
| `PUT` | `/v1/app/user/info` | 编辑当前登录用户信息 | 个人信息页 | 可直接对接 |
| `POST` | `/v1/app/user/real-auth` | 提交用户实名认证 | 个人信息页实名认证模块（待新增） | 暂无页面承接 |

### 5.15 咨询留言前台接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/app/consult-messages` | 提交咨询留言 | 在线咨询页发送消息、投诉建议页提交表单 | 可部分对接 |

### 5.16 字典接口

| Method | Path | 摘要 | 当前承接页面/模块 | 状态 |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/app/dict/simple-list` | 获取字典简单列表 | 搜索筛选项、表单枚举（可后续接入） | 可组合对接 |
| `GET` | `/v1/app/dict/tree-list` | 获取字典树形列表 | 分类树、树状筛选项（可后续接入） | 可组合对接 |

## 6. 管理端 `plat` 处理结论

| 分组 | 接口数 | 是否纳入当前仓库 | 原因 |
| --- | --- | --- | --- |
| `plat` 管理端 | `164` | 否 | 当前仓库只有微信小程序前台页面，没有后台管理页面、后台登录、角色权限、商户管理、平台商品管理等承接路由 |

管理端当前只需要保留一条实现结论：如果后续要做运营后台或商家后台，应该新开独立前端工程，不建议混入当前小程序仓库。
