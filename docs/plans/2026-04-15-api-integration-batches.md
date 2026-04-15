# ConstructMarket API Integration Batch Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不打断当前 Mock 可演示链路的前提下，把微信小程序按批次切到真实 `app` Swagger 接口，并让每一批都具备明确范围、可回写进度、可人工验收、可顺序衔接到下一批。

**Architecture:** 先补联调前置基座，再按业务域推进。页面不直接请求 Swagger，而是统一改为读取 `services/*`；`services/*` 再调用 `api/*` 和 adapter，把后端 DTO 转成当前页面已使用的 ViewModel。继续保留 `mockState` 演示态和后端缺口的 Mock fallback，避免联调中的页面状态与验收入口丢失。

**Tech Stack:** Native WeChat Mini Program, TypeScript, `wx.request`, local storage persistence, Swagger `app` 分组, WeChat DevTools Network/Storage 面板, `npm run typecheck`, `npm run build:miniapp`, `npm run verify:source-runtime`

---

## 1. 先读这个文档时要知道的事

- 当前接口映射和进度基线以 [`docs/swagger-app-接口映射.md`](/Users/casper/Documents/project/mall-applet/docs/swagger-app-接口映射.md) 为准。
- 当前页面和数据结构基线以 [`docs/PRD-建材市场小程序前端.md`](/Users/casper/Documents/project/mall-applet/docs/PRD-建材市场小程序前端.md) 为准。
- 当前工程没有真实请求层，也没有登录页或 token 管理；因此第一步不是改页面，而是补联调前置基座。
- 当前已有 Mock 页面和 `state=loading|empty|error|offline` 演示态，联调时不能删掉，后续验收仍要依赖这些入口。
- 当前已识别的后端缺口继续成立：资讯详情、优惠券整页/选择、创建订单、FAQ 列表、在线客服会话历史/回复、客服入口配置。

## 2. 统一联调规则

### 2.1 文件落点

- Create: `miniprogram/api/config.ts`
- Create: `miniprogram/api/request.ts`
- Create: `miniprogram/api/modules/home.ts`
- Create: `miniprogram/api/modules/product.ts`
- Create: `miniprogram/api/modules/trade.ts`
- Create: `miniprogram/api/modules/profile.ts`
- Create: `miniprogram/api/modules/content.ts`
- Create: `miniprogram/api/modules/support.ts`
- Create: `miniprogram/api/adapters/browse.ts`
- Create: `miniprogram/api/adapters/trade.ts`
- Create: `miniprogram/api/adapters/profile.ts`
- Create: `miniprogram/api/adapters/content.ts`
- Create: `miniprogram/api/adapters/support.ts`
- Create: `miniprogram/services/browse.ts`
- Create: `miniprogram/services/trade.ts`
- Create: `miniprogram/services/profile.ts`
- Create: `miniprogram/services/content.ts`
- Create: `miniprogram/services/support.ts`

### 2.2 改造原则

1. 页面层只依赖 `services/*`，不直接依赖 `api/modules/*`。
2. `services/*` 暴露的数据结构尽量对齐现有页面所需字段，减少大面积改模板。
3. `mock/*` 暂时不删，作为 fallback 和 blocked 模块兜底。
4. `utils/storage.ts` 在真实联调后只保留本地草稿、临时选择、演示态和少量缓存，不再作为购物车、订单、地址等核心实体的唯一来源。
5. 每批完成后，必须回写 [`docs/swagger-app-接口映射.md`](/Users/casper/Documents/project/mall-applet/docs/swagger-app-接口映射.md) 第 1、3、4 节，并在 `progress.md` 记录人工验证结果。

### 2.3 统一完成标准

- `npm run typecheck` 通过
- `npm run build:miniapp` 通过
- `npm run verify:source-runtime` 通过
- 本批相关页面至少完成 1 轮微信开发者工具人工走查
- `docs/swagger-app-接口映射.md` 已回写本批状态
- 当前批次“下一批进入条件”已满足

## 3. 联调前置批 `S0`

### Task S0: 请求基座、鉴权注入与服务层壳子

**Files:**
- Create: `miniprogram/api/config.ts`
- Create: `miniprogram/api/request.ts`
- Create: `miniprogram/api/modules/home.ts`
- Create: `miniprogram/api/modules/product.ts`
- Create: `miniprogram/api/modules/trade.ts`
- Create: `miniprogram/api/modules/profile.ts`
- Create: `miniprogram/api/modules/content.ts`
- Create: `miniprogram/api/modules/support.ts`
- Create: `miniprogram/api/adapters/browse.ts`
- Create: `miniprogram/api/adapters/trade.ts`
- Create: `miniprogram/api/adapters/profile.ts`
- Create: `miniprogram/api/adapters/content.ts`
- Create: `miniprogram/api/adapters/support.ts`
- Create: `miniprogram/services/browse.ts`
- Create: `miniprogram/services/trade.ts`
- Create: `miniprogram/services/profile.ts`
- Create: `miniprogram/services/content.ts`
- Create: `miniprogram/services/support.ts`
- Modify: `README.md`
- Modify: `docs/swagger-app-接口映射.md`

**Step 1: 建立联调配置**

- 在 `miniprogram/api/config.ts` 定义 `API_BASE_URL`、`API_MODE`（`mock` / `remote` / `hybrid`）和调试 token 注入入口。
- 约定调试 token 可来自常量、`wx.getStorageSync("constructmarket_dev_token")` 或开发者工具手工注入。
- 把“当前没有登录页，因此用户态接口先靠开发联调 token”写进 `README.md`。

**Step 2: 建立统一请求包装**

- 在 `miniprogram/api/request.ts` 封装 `wx.request`，统一处理：
  - base URL 拼接
  - header 注入
  - 超时
  - 非 2xx / 业务失败 / 空数据
  - 错误对象归一化
- 让页面和 service 不直接关心 Swagger 返回包结构。

**Step 3: 建立模块 API 文件**

- 在 `miniprogram/api/modules/*.ts` 中按 Swagger 域拆分 endpoint 函数。
- 公共浏览接口放 `home.ts` / `product.ts` / `content.ts`。
- 用户态接口放 `trade.ts` / `profile.ts` / `support.ts`。

**Step 4: 建立 adapter 与 service 壳子**

- `api/adapters/*` 负责把 Swagger DTO 转成当前页面消费的类型，例如 `ProductCard`、`ProductDetail`、`Order`、`ArticleFeedItem`。
- `services/*` 对页面暴露稳定方法，例如：
  - `services/browse.ts`: `getHomePageData`、`getCategoryPageData`、`searchProductsPage`、`getProductPageData`
  - `services/trade.ts`: `getCartPageData`、`getCheckoutPageData`、`getOrderListPageData`
  - `services/profile.ts`: `getProfileHomePageData`、`getProfileInfoData`
- `services/*` 允许按 `API_MODE` 或接口可用性退回 `mock/*`。

**Step 5: 预留 blocked 模块策略**

- 在 service 层显式标记后端缺口模块继续走 Mock。
- 这些模块的 UI 上保留 `开发中` 标记，不要在页面里偷偷混成半真半假。

**Step 6: 回写基线文档**

- 在 `docs/swagger-app-接口映射.md` 追加“已具备联调前置基座”的说明。
- 在 `progress.md` 记录 token 注入方式与请求层位置。

**完成标准:**

- 工程内已有统一 `request + api/modules + adapters + services` 结构
- 已经明确调试 token 的注入方式
- 还未迁移页面也不会受影响

**人工验证步骤:**

1. 在微信开发者工具或配置文件里注入测试 token。
2. 切到 `API_MODE=remote`，用最小 smoke 接口验证至少 1 个公共接口请求成功。
3. 切到 `API_MODE=mock`，确认页面仍能正常走 Mock。
4. 切到 `API_MODE=hybrid`，确认未接批次不报错，仍能显示旧页面。
5. 运行：

```bash
npm run typecheck
npm run build:miniapp
npm run verify:source-runtime
```

**Next Batch:** `A. 首页 / 选型 / 搜索结果`

进入条件：
- 至少 1 个公共接口在 DevTools Network 面板可见且返回成功
- token 注入方式已经文档化

## 4. 批次 A

### Task A: 首页 / 选型 / 搜索结果

**Files:**
- Modify: `miniprogram/services/browse.ts`
- Modify: `miniprogram/api/modules/home.ts`
- Modify: `miniprogram/api/adapters/browse.ts`
- Modify: `miniprogram/pages/home/index.ts`
- Modify: `miniprogram/pages/category/index.ts`
- Modify: `miniprogram/package-catalog/search/result.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `GET /v1/app/home/banners`
- `GET /v1/app/home/categories`
- `GET /v1/app/home/new-arrival-products`
- `GET /v1/app/home/hot-recommend-products`
- `GET /v1/app/home/news-articles`
- `POST /v1/app/home/search-products`
- `GET /v1/app/dict/simple-list`
- `GET /v1/app/dict/tree-list`

**Step 1: 首页数据改服务读取**

- 把 `pages/home/index.ts` 从 `mock/browse.ts` 切到 `services/browse.ts`。
- 统一让 Banner、分类导航、新品区、热门推荐、首页资讯入口都走服务返回的 ViewModel。

**Step 2: 选型页切分类树与热销商品**

- `pages/category/index.ts` 继续保留左右结构，但分类树改为 `home/categories`。
- “当前热销”走 `search-products`，不要继续直接读本地商品种子。

**Step 3: 搜索结果页切真实列表**

- `package-catalog/search/result.ts` 把关键词、排序、筛选条件组装成 `search-products` 请求。
- 类目抽屉继续复用分类树接口。
- `dict/*` 先承接筛选项；若字段暂时对不上，可先做 adapter 映射，不改 UI 结构。

**Step 4: 维持页面状态壳子**

- 保留 `loading / empty / error / offline`，请求失败时走统一错误分支。
- 不要因为切接口删除本来已有的异常态。

**Step 5: 回写进度**

- 将批次 A 对应行改成 `已完成` 或 `进行中`。
- 更新第 1、3、4 节中的已完成数量。

**完成标准:**

- 首页、选型页、搜索结果页均已不再直接读取 `mock/browse.ts` 或 `mock/category.ts`
- 搜索结果的关键词、排序、筛选、类目切换都能打到真实接口
- 首页和选型页的商品 ID / 类目 ID 已与真实后端数据打通

**人工验证步骤:**

1. 打开首页，确认 Banner、分类、商品流、资讯入口都来自 Network 返回数据。
2. 点击任一分类进入选型页，确认左侧类目、右侧子类目、热销商品都刷新为真实数据。
3. 在搜索结果页分别验证：
   - 带关键词进入
   - 切换排序
   - 打开更多类目抽屉
   - 打开筛选抽屉并应用筛选
4. 断网或手动让请求失败，确认页面进入 `error` / `offline` 分支而不是白屏。
5. 回写 [`docs/swagger-app-接口映射.md`](/Users/casper/Documents/project/mall-applet/docs/swagger-app-接口映射.md) 的 A 批状态。

**Next Batch:** `B. 商品详情 / 收藏加购 / 浏览记录`

进入条件：
- 搜索结果页拿到的真实 `productId`、`skuId`、`categoryId` 已可直接传给商品详情和收藏/加购动作

## 5. 批次 B

### Task B: 商品详情 / 收藏加购 / 浏览记录

**Files:**
- Modify: `miniprogram/services/browse.ts`
- Modify: `miniprogram/api/modules/product.ts`
- Modify: `miniprogram/api/modules/profile.ts`
- Modify: `miniprogram/api/adapters/browse.ts`
- Modify: `miniprogram/package-catalog/product/detail.ts`
- Modify: `miniprogram/package-profile/profile/favorite.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `GET /v1/app/product/detail`
- `GET /v1/app/product/specs`
- `GET /v1/app/merchant/detail`
- `POST /v1/app/user/favorite/product-favorites/{productId}`
- `DELETE /v1/app/user/favorite/product-favorites/{productId}`
- `GET /v1/app/user/favorite/product-favorites`
- `POST /v1/app/user/cart`
- `POST /v1/app/user/browse/{productId}`
- `POST /v1/app/consult-messages`

**Step 1: 商品详情页切真实详情**

- `package-catalog/product/detail.ts` 改为从 `services/browse.ts` 读取商品详情、规格、店铺信息和相关推荐兜底数据。
- 详情页进入时补记浏览记录。

**Step 2: 收藏动作切真实接口**

- 首页、搜索结果、商品详情、收藏夹统一经由服务层做收藏/取消收藏。
- 不再直接用 `toggleFavoriteId` 作为真实收藏主源，只允许它在 Mock fallback 模式下工作。

**Step 3: 加购动作切真实接口**

- 商品详情页“加入购物车”和收藏夹页“快捷加购”都统一调用 `POST /user/cart`。
- 加购成功后再拉一次购物车数量或更新本地预览数字。

**Step 4: 收藏夹列表切真实收藏列表**

- `package-profile/profile/favorite.ts` 改为读取真实收藏商品列表。
- 若接口只返回收藏关系而不返回完整商品卡，先在 adapter 层补齐页面需要字段，不要把 DTO 直接喂给页面。

**Step 5: 客服入口仅切可接部分**

- 商品详情页的“在线咨询入口”可以继续走 `POST /consult-messages` 作为留言入口。
- 不要在这一批试图解决完整会话历史和客服回复。

**完成标准:**

- 商品详情、收藏夹、首页/搜索结果收藏按钮已切真实接口
- 收藏和加购成功后，后续页面能看到真实联动结果
- 浏览记录写入逻辑已接入服务层

**人工验证步骤:**

1. 从首页或搜索结果进入商品详情，确认详情、规格、店铺数据来自真实接口。
2. 在详情页点收藏，再去收藏夹确认列表变化。
3. 在收藏夹取消收藏，确认详情页或搜索页再次进入时状态一致。
4. 在详情页加购、在收藏夹快捷加购，确认购物车角标或后续购物车页可看到新增商品。
5. 进入在线咨询入口，确认至少“发送留言”可成功落到真实接口。

**Next Batch:** `C. 购物车 / 地址 / 发票基础能力`

进入条件：
- 商品详情页和收藏夹产生的加购动作已稳定写入真实购物车
- 收藏状态不再依赖纯本地存储

## 6. 批次 C

### Task C: 购物车 / 地址 / 发票基础能力

**Files:**
- Modify: `miniprogram/services/trade.ts`
- Modify: `miniprogram/api/modules/trade.ts`
- Modify: `miniprogram/api/adapters/trade.ts`
- Modify: `miniprogram/pages/cart/index.ts`
- Modify: `miniprogram/package-profile/profile/address/list.ts`
- Modify: `miniprogram/package-profile/profile/address/edit.ts`
- Modify: `miniprogram/package-profile/profile/invoice.ts`
- Modify: `miniprogram/package-trade/checkout/index.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `GET /v1/app/user/cart`
- `POST /v1/app/user/cart/{cartItemId}/quantity`
- `DELETE /v1/app/user/cart/{cartItemId}`
- `DELETE /v1/app/user/cart`
- `GET /v1/app/user/address`
- `POST /v1/app/user/address`
- `PUT /v1/app/user/address/{addressId}`
- `DELETE /v1/app/user/address/{addressId}`
- `GET /v1/app/user/invoice/titles`
- `POST /v1/app/user/invoice/titles`
- `PUT /v1/app/user/invoice/titles/{invoiceTitleId}`
- `DELETE /v1/app/user/invoice/titles/{invoiceTitleId}`
- `POST /v1/app/user/invoice/records`
- `POST /v1/app/user/invoice/records/apply`

**Step 1: 购物车页切真实列表与操作**

- `pages/cart/index.ts` 改成读取真实购物车列表。
- 数量修改、删除、清空动作都走真实接口。
- 勾选态如果后端无对应字段，可先保留前端本地选择态，但商品数据源必须来自真实接口。

**Step 2: 地址页切真实 CRUD**

- 地址列表页改真实列表。
- 地址编辑页改真实新增 / 编辑。
- 默认地址策略优先吃后端字段，前端不要再自己长期持有默认地址真相。

**Step 3: 发票中心切真实抬头和记录**

- 发票记录走 `invoice/records`。
- 发票抬头管理走 `invoice/titles`。
- 结算页只消费发票结果，不在这一批解决下单提交。

**Step 4: 结算页切可接部分**

- 收货地址、发票信息改读真实接口。
- 优惠券、支付方式、创建订单仍保留 Mock/静态，并继续显示 `开发中`。

**完成标准:**

- 购物车、地址、发票基础能力都不再以 `utils/storage.ts` 为主数据源
- 结算页地址和发票回流已切真实
- blocked 的优惠券与提交订单仍然清晰标记为 Mock

**人工验证步骤:**

1. 在商品详情或收藏夹加购后进入购物车，确认商品来自真实购物车接口。
2. 在购物车页修改数量、删除商品、清空购物车，确认 Network 和 UI 同步。
3. 新增一个地址、编辑一个地址、删除一个地址，返回结算页确认回流成功。
4. 在发票中心新增/编辑/删除抬头，提交一条开票申请，确认记录列表可见。
5. 在结算页确认地址和发票数据来自真实接口，优惠券和提交订单仍保持 `开发中`。

**Next Batch:** `D. 下单 / 支付结果 / 订单域`

进入条件：
- 真实购物车、地址、发票都已稳定
- 已明确本批中的后端阻塞仍然存在，后续仅做可接部分

## 7. 批次 D

### Task D: 下单 / 支付结果 / 订单域

**Files:**
- Modify: `miniprogram/services/trade.ts`
- Modify: `miniprogram/api/modules/trade.ts`
- Modify: `miniprogram/api/adapters/trade.ts`
- Modify: `miniprogram/package-trade/checkout/index.ts`
- Modify: `miniprogram/package-trade/payment/result.ts`
- Modify: `miniprogram/package-trade/order/list.ts`
- Modify: `miniprogram/package-trade/order/detail.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `POST /v1/app/user/orders`
- `GET /v1/app/user/orders/detail`
- `POST /v1/app/user/orders/pay`
- `POST /v1/app/user/orders/confirm-receipt`
- `POST /v1/app/user/orders/after-sale`

**后端阻塞:**

- 缺少 `create order`
- 缺少优惠券选择接口
- 缺少支付方式配置接口

**Step 1: 订单列表与订单详情切真实**

- `package-trade/order/list.ts` 改用真实订单分页接口。
- `package-trade/order/detail.ts` 改用真实订单详情接口。

**Step 2: 支付结果页切真实“继续支付”与回查**

- `package-trade/payment/result.ts` 改为：
  - 重试支付：`POST /user/orders/pay`
  - 刷新详情：`GET /user/orders/detail`
- 保留现有 `success / processing / failed` 三态 UI。

**Step 3: 确认收货与售后切真实**

- 订单详情页的“确认收货”和“申请售后”改走真实接口。
- 成功后刷新订单详情和订单列表状态。

**Step 4: 结算页只切“可接部分的边界”**

- 结算页仍保留本地“创建订单模拟”或 `开发中` 提示，直到后端补齐创建订单接口。
- 不要伪造半真实下单流程，否则支付和订单来源会失真。

**完成标准:**

- 订单列表、详情、确认收货、售后、继续支付都已切真实接口
- 结算页的下单动作是否真实可用，在 UI 与文档中是明确的，而不是含混状态

**人工验证步骤:**

1. 进入订单列表，确认分页和状态 Tab 来自真实接口。
2. 打开订单详情，确认金额、收货信息、商品信息与列表一致。
3. 对待支付订单执行“继续支付”，确认调用 `orders/pay`，并可通过详情回查状态。
4. 对待收货订单执行“确认收货”，确认列表和详情页状态同步变化。
5. 对已完成或可售后订单执行“申请售后”，确认 UI 有成功回执。
6. 在结算页确认“创建订单”仍是 `开发中` 或 Mock，不混淆为真实可用。

**Next Batch:** `E. 个人中心`

进入条件：
- 订单域数据已经可作为“我的页摘要”和“发票中心可开票订单”真实来源

## 8. 批次 E

### Task E: 个人中心

**Files:**
- Modify: `miniprogram/services/profile.ts`
- Modify: `miniprogram/api/modules/profile.ts`
- Modify: `miniprogram/api/adapters/profile.ts`
- Modify: `miniprogram/pages/profile/index.ts`
- Modify: `miniprogram/package-profile/profile/info.ts`
- Modify: `miniprogram/package-profile/profile/favorite.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `GET /v1/app/user/home-page`
- `GET /v1/app/user/info`
- `PUT /v1/app/user/info`
- `GET /v1/app/user/favorite/product-favorites`
- `GET /v1/app/user/address`
- `POST /v1/app/user/invoice/records`
- `POST /v1/app/user/real-auth`

**后端阻塞:**

- 优惠券入口仍缺整页接口
- 实名认证当前只有接口，没有现成 UI

**Step 1: 我的页切真实主页摘要**

- `pages/profile/index.ts` 改为优先吃 `user/home-page`。
- 收藏数、地址数、发票数等可按需要聚合其他真实接口，但聚合逻辑放在 service 层。

**Step 2: 个人信息页切真实读写**

- `package-profile/profile/info.ts` 改为：
  - 读取：`GET /user/info`
  - 保存：`PUT /user/info`
- `profileDraft` 仅保留本地草稿体验，不作为真实资料源。

**Step 3: 收藏夹页跟随真实收藏服务**

- 若批次 B 已切收藏列表，这一批只做个人中心入口和摘要回流。
- 若 B 仍保留部分 Mock，这一批补齐“我的页 -> 收藏夹 -> 返回我的页”的真实计数联动。

**Step 4: 实名认证只在 UI 准备好时接入**

- 若本轮不补 UI，则继续保持 `前端待补`。
- 如果补 UI，必须在 `package-profile/profile/info.ts` 内明确新增认证模块，而不是隐藏接接口。

**完成标准:**

- 我的页和个人信息页的核心资料不再依赖本地种子数据
- 收藏、地址、发票摘要能从真实接口回流到我的页
- 实名认证的状态要么明确接入，要么继续明确标记待补

**人工验证步骤:**

1. 打开我的页，确认用户资料、订单摘要、收藏/地址/发票摘要来自真实接口。
2. 进入个人信息页，修改昵称或企业名称并保存，返回我的页确认立即回流。
3. 再次进入个人信息页，确认真实资料而不是旧本地种子值被读取。
4. 若已接实名认证 UI，执行 1 次提交并确认结果提示。
5. 若实名认证 UI 仍未补，确认映射文档与页面状态仍标记 `前端待补`。

**Next Batch:** `F. 资讯 / 客服 / 投诉建议`

进入条件：
- 个人中心摘要数据已稳定，blocked 项与真实项边界清楚

## 9. 批次 F

### Task F: 资讯 / 客服 / 投诉建议

**Files:**
- Modify: `miniprogram/services/content.ts`
- Modify: `miniprogram/services/support.ts`
- Modify: `miniprogram/api/modules/content.ts`
- Modify: `miniprogram/api/modules/support.ts`
- Modify: `miniprogram/api/adapters/content.ts`
- Modify: `miniprogram/api/adapters/support.ts`
- Modify: `miniprogram/package-content/article/list.ts`
- Modify: `miniprogram/package-content/article/detail.ts`
- Modify: `miniprogram/package-support/support/index.ts`
- Modify: `miniprogram/package-support/support/chat.ts`
- Modify: `miniprogram/package-support/support/faq.ts`
- Modify: `miniprogram/package-support/support/complaint.ts`
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `progress.md`

**接口范围:**

- `POST /v1/app/news/page`
- `POST /v1/app/consult-messages`
- `POST /v1/app/file/upload`
- `POST /v1/app/user/orders`
- `GET /v1/app/user/orders/detail`

**后端阻塞:**

- 缺少资讯详情接口
- 缺少 FAQ 列表接口
- 缺少在线咨询会话历史 / 客服回复接口
- 缺少客服系统首页配置接口

**Step 1: 资讯列表切真实**

- `package-content/article/list.ts` 用 `news/page` 替换本地列表。
- 分类 Tab 若后端没有单独分类接口，可继续根据现有枚举或列表聚合。

**Step 2: 资讯详情做“半真实兜底”**

- 正文详情接口缺失，因此 `article/detail.ts` 仅把相关推荐改成真实列表兜底。
- 正文继续保留 Mock，并明确 `开发中`。

**Step 3: 投诉建议切真实提交与上传**

- `package-support/support/complaint.ts` 提交动作走 `consult-messages`。
- 图片上传走 `file/upload`。
- 关联订单选择继续复用订单接口。

**Step 4: 在线咨询只切留言入口**

- `package-support/support/chat.ts` 仅切“发送留言”能力。
- 会话历史、客服回复、重发逻辑继续保留 Mock。

**Step 5: FAQ 与客服首页维持 blocked 标识**

- `support/index.ts` 和 `support/faq.ts` 不要伪造真实化，继续清晰标记后端缺口。

**完成标准:**

- 资讯列表、投诉建议、图片上传、在线咨询留言已切真实可接部分
- 资讯详情正文、FAQ、在线咨询会话仍明确是 blocked，不与真实部分混淆

**人工验证步骤:**

1. 打开资讯列表，切换分类并下拉刷新，确认列表来自真实接口。
2. 打开资讯详情，确认相关推荐可刷新，但正文仍保持 `开发中` 提示。
3. 在投诉建议页填写内容并上传图片，确认上传和提交都成功。
4. 在在线咨询页发送 1 条消息，确认留言可提交到真实接口。
5. 打开 FAQ 和客服首页，确认 blocked 状态仍然清楚，没有误报成“已接入”。

**Next Batch:** `收尾批`

进入条件：
- 所有可接接口已切完
- 剩余项仅剩后端阻塞或前端待补

## 10. 收尾批

### Task Z: 收尾与看板校准

**Files:**
- Modify: `docs/swagger-app-接口映射.md`
- Modify: `docs/handoff-status.md`
- Modify: `progress.md`

**Step 1: 统一回写真实进度**

- 对照第 4 节逐行确认 `已完成 / 进行中 / 后端阻塞 / 前端待补`。
- 更新第 1 节总进度数字与第 3 节批次看板。

**Step 2: 清点仍保留 Mock 的模块**

- 明确哪些是“因为后端缺口保留 Mock”，哪些是“还没排到”。
- 避免把临时 fallback 留成长期隐患。

**Step 3: 更新交接文档**

- 在 `docs/handoff-status.md` 写明：
  - 哪些批次已经完成
  - 哪些接口仍 blocked
  - token 配置方式
  - 下一位接手者的起点

**人工验证步骤:**

1. 对照 `docs/swagger-app-接口映射.md` 和真实页面逐页 spot check。
2. 在 DevTools 中抽查首页、商品详情、购物车、订单、我的、资讯、投诉建议至少各 1 页。
3. 确认 blocked 项仍显示 `开发中`。

## 11. 执行顺序摘要

1. `S0` 请求基座、token 注入、service 壳子
2. `A` 首页 / 选型 / 搜索结果
3. `B` 商品详情 / 收藏加购 / 浏览记录
4. `C` 购物车 / 地址 / 发票基础能力
5. `D` 下单可接部分 / 支付结果 / 订单域
6. `E` 个人中心
7. `F` 资讯 / 客服 / 投诉建议
8. `Z` 收尾与看板校准

## 12. 每批完成后必须执行的回写动作

1. 更新 [`docs/swagger-app-接口映射.md`](/Users/casper/Documents/project/mall-applet/docs/swagger-app-接口映射.md) 第 1、3、4 节。
2. 在 `progress.md` 记录：
   - 本批完成日期
   - 已切接口
   - 保留 Mock 的模块
   - 人工验证结果
   - 下一批入口条件是否满足
3. 若出现新后端缺口，立即把相关页面模块改成 `后端阻塞`，不要继续按“待接入”推进。
4. 若某一批验证未通过，不进入下一批，先回到当前批补齐。
