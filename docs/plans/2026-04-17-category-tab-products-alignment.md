# 选型 Tab 对齐 mall-web Products Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让小程序 `选型` tab 在接口调用和页面展示信息上对齐 `mall-web` 的 `Products.vue`，同时保留小程序 tab 页的移动端结构。

**Architecture:** 不继续扩展当前“分类导航页 + 当前热销”壳子，而是让 `选型` tab 复用小程序现有 `search/result` 的商品列表能力，并补齐 web `Products` 所依赖的品牌筛选、商品字段映射和结果摘要。分类树保留为 tab 场景下的快速入口，但页面主内容切换为“筛选驱动的商品列表”。

**Tech Stack:** 微信原生小程序、TypeScript、现有 `miniprogram/api/*` 请求层、`services/browse.ts` 聚合层、`tests/api/*.test.cjs`

---

## 1. 任务边界

本轮只做 3 件事：

1. 调研 `mall-web` `Products` 页的接口请求、返回结构和页面实际取值。
2. 对照小程序当前 `选型` tab 与 `search/result` 能力，输出可执行的对齐方案。
3. 落地小程序 `选型` tab 的接口与展示调整，并完成静态校验与 smoke tests。

本轮不做：

- 重写 `mall-web`
- 改动商品详情、购物车、订单等其他页面逻辑
- 在小程序里完整照搬 web 桌面布局
- 引入新的页面路由替换 tab 结构

## 2. 基线文件

### Web 基线

- `../mall-web/src/views/Products.vue`
- `../mall-web/src/components/Sidebar.vue`
- `../mall-web/src/components/ProductCard.vue`
- `../mall-web/src/api/index.ts`
- `../mall-web/src/types/index.ts`

### 小程序当前实现

- `miniprogram/pages/category/index.ts`
- `miniprogram/pages/category/index.wxml`
- `miniprogram/pages/category/index.wxss`
- `miniprogram/package-catalog/search/result.ts`
- `miniprogram/package-catalog/search/result.wxml`
- `miniprogram/services/browse.ts`
- `miniprogram/api/modules/home.ts`
- `miniprogram/api/adapters/browse.ts`
- `miniprogram/components/business/product-card/*`
- `miniprogram/types/models.ts`
- `tests/api/browse-service.test.cjs`

## 3. Web Products 调研

### 3.1 页面请求链

`Products.vue` 页面初始化时会并行加载：

| 目的 | 方法 | 接口 | 文件 |
| --- | --- | --- | --- |
| 分类树 | `getCategories()` | `GET /v1/app/home/categories` | `../mall-web/src/api/index.ts` |
| 品牌筛选项 | `listHomeBrands()` | `GET /v1/app/home/brands` | `../mall-web/src/api/index.ts` |
| 商品列表 | `searchProducts(params)` | `POST /v1/app/home/search-products` | `../mall-web/src/api/index.ts` |

### 3.2 商品列表请求参数

web 页面实际传给 `searchProducts()` 的参数如下：

| 参数 | 来源 | 说明 |
| --- | --- | --- |
| `page` | 当前页码 | web 分页 |
| `pageSize` | 固定值 `12` | 每页条数 |
| `keyword` | 路由 query / 搜索输入 | 关键词 |
| `categoryId` | 左侧分类树 | 分类筛选 |
| `brandId` | 品牌多选 | 品牌筛选，数组 |
| `minPrice` | 顶部价格输入 | 价格区间 |
| `maxPrice` | 顶部价格输入 | 价格区间 |
| `sortType` | 排序按钮 | 综合/价格/评分/销量 |

补充说明：

- web 页面的 query 会同步到 URL：`keyword/category/brand/minPrice/maxPrice/sort/page`
- `searchProducts()` 虽然是 `POST`，但本质仍复用首页搜索接口
- `brandId` 已按品牌 ID 传参，不是品牌名

### 3.3 Web 页面实际消费的字段

#### 分类树与品牌

`Sidebar.vue` 实际只使用：

| 数据源 | 取值字段 |
| --- | --- |
| 分类树 | `id`、`name`、`children` |
| 品牌列表 | `id`、`name` |

#### 商品卡

`ProductCard.vue` 实际展示：

| 展示块 | 字段 |
| --- | --- |
| 图片 | `image` |
| 标签 | `tags` |
| 低库存提示 | `stock` + `unit` |
| 品牌 | `brand` |
| 商品名 | `name` |
| 规格摘要 | `specifications[].value` |
| 到手价/划线价 | `price` / `originalPrice` |
| 销量 | `salesCount` |
| 评分 | `rating` |

### 3.4 Web 模型映射结论

`/v1/app/home/search-products`、`/v1/app/home/hot-recommend-products`、`/v1/app/home/new-arrival-products` 返回的都是 `{ product, skuList }` 结构，web 最终统一映射成 `Product`：

- 商品主字段来自 `product`
- SKU 首项补价格/图片/库存/规格
- 分类与品牌分别取 `categoryInfo`、`brandInfo`

这意味着小程序只要把同一套 DTO 收敛成稳定 ViewModel，就可以和 web 保持字段口径一致。

## 4. 小程序当前实现调研

### 4.1 当前 `选型` tab

`miniprogram/pages/category/index.ts` 当前只调用一个聚合入口：

- `browseService.getCategoryShellData(selectedCategoryId, favoriteIds)`

remote 模式下这条链只做两件事：

1. `homeApi.getCategories()` 获取一级/二级分类树
2. `homeApi.searchProducts({ categoryId, sortType: "sales_desc", pageIndex: 1, pageSize: 6 })`

最终页面只展示：

- 左侧一级分类
- 右侧二级分类
- 当前类目说明、采购建议
- 前 3 个热销商品

### 4.2 当前 `search/result`

`miniprogram/package-catalog/search/result.ts` 已具备如下能力：

- 关键词搜索
- 分类切换
- 排序切换
- 筛选抽屉
- 商品列表展示

对应服务入口：

- `browseService.getSearchFilterShell()`
- `browseService.searchProductsPage()`

当前 remote 模式已复用：

- `GET /v1/app/home/categories`
- `POST /v1/app/home/search-products`
- `GET /v1/app/dict/simple-list`
- `GET /v1/app/dict/tree-list`

### 4.3 小程序当前缺口

#### 选型 tab 缺口

与 web `Products` 相比，当前 `选型` tab 缺少：

- 品牌筛选
- 价格筛选
- 排序切换
- 当前筛选项摘要
- 商品列表主视图
- 结果总数

#### 搜索结果页缺口

虽然 `search/result` 已承接大部分列表能力，但仍缺：

- `GET /v1/app/home/brands`
- 品牌筛选状态
- 将品牌 ID 透传给 `search-products`

#### 商品卡缺口

当前小程序 `product-card` 展示字段偏简化：

| 当前已展示 | web 需要补齐 |
| --- | --- |
| `name` | `image` |
| `brand` | `originalPrice` |
| `model` | `rating` |
| `categoryName` | `stock` 低库存提示 |
| `price` | 规格摘要 |
| `minOrderQty` | 更像商品卡的图片首屏视觉 |
| `salesVolume` | - |

## 5. 差异结论

### 5.1 角色差异

- web `Products` 是“商品列表页”
- 小程序 `选型` tab 目前是“分类导航页”
- 小程序 `search/result` 才是“商品列表页”

所以本轮对齐的本质不是给旧 `category` 页补几个字段，而是把 `category` 页主能力切换到“移动端 Products 页”。

### 5.2 最合理的复用点

当前仓库里最适合复用的是：

- `search/result` 的筛选/排序/列表数据流
- `services/browse.ts` 中已有的 `searchProductsPage()` 与 `getSearchFilterShell()`

不适合继续复用的是：

- `getCategoryShellData()` 这种“分类树 + 热销 top3”的聚合模型

## 6. 方案对比

### 方案 A：推荐

让 `选型` tab 复用 `search/result` 的商品列表逻辑，再把分类树折叠为顶部快速入口或抽屉。

优点：

- 与 web `Products` 最接近
- 复用现有 service 和筛选逻辑，改动集中
- 小程序 tab 仍保留移动端结构

缺点：

- `category` 页会从“导航页”转成“列表页”，视觉变化较大

### 方案 B：继续扩展旧 `category` 页

在现有“分类树 + 热销 top3”页面上继续补品牌、价格、排序和更多商品。

问题：

- 页面会同时承担“导航页”和“商品列表页”两种角色，结构会越来越混乱
- 仍需要重复实现 `search/result` 已有的筛选逻辑

### 方案 C：tab 直接跳 `search/result`

点击 `选型` tab 直接进入 `search/result`。

问题：

- 会破坏 tab 页固定入口语义
- `app.json` 和用户操作心智都会变得不自然

## 7. 选定方案

采用 **方案 A**：

1. `选型` tab 保留现有路由 `pages/category/index`
2. 页面主数据流改为复用 `search/result`
3. 分类树改为“当前选中分类 + 快速切换入口”
4. 商品列表改成页面主内容
5. 补品牌筛选和更接近 web 的商品卡信息

## 8. 具体改造设计

### 8.1 API / Service 层

#### 目标

让小程序具备与 web `Products` 对齐的请求能力：

- 分类树
- 品牌列表
- 商品搜索
- 分类/品牌/价格/排序组合筛选

#### 文件与改动

**Modify:** `miniprogram/api/modules/home.ts`

- 新增 `getBrands()`
- 对应接口：`GET /v1/app/home/brands`

**Modify:** `miniprogram/services/browse.ts`

- 为筛选壳子增加品牌选项获取
- 为商品搜索增加品牌 ID 参数透传
- 新增或重构一个面向 `选型` tab 的列表页聚合方法，建议命名：
  - `getCategoryProductsPageData()`
  - 或直接扩展 `getSearchFilterShell()` / `searchProductsPage()`

建议收敛后的页面入参：

```ts
{
  keyword: string;
  categoryId: string;
  sortOption: string;
  selectedBrandIds: string[];
  filterState: SearchFilterState;
  favoriteIds?: string[];
}
```

**Modify:** `miniprogram/types/models.ts`

- 新增品牌筛选选项类型，例如：

```ts
export type BrandFilterOption = {
  id: string;
  name: string;
};
```

- 为 `SearchProduct` 补充更贴近 web 卡片的字段：
  - `originalPrice?: number`
  - `rating?: number`
  - `stock?: number`
  - `specText?: string`

**Modify:** `miniprogram/api/adapters/browse.ts`

- 在 `mapSearchProduct()` 中补齐：
  - 原价
  - 评分
  - 库存
  - 规格摘要
- 继续兼容 `{ product, skuList }` 扁平化逻辑

### 8.2 页面层

#### 目标

把 `pages/category/index` 从“分类导航页”改成“选型商品列表页”。

#### 页面结构建议

从上到下：

1. 页面标题区
2. 搜索框
3. 分类切换入口
4. 品牌筛选横向 chips
5. 排序栏
6. 筛选摘要 / 结果数
7. 商品列表
8. 空态 / 错误态 / 离线态

#### 保留的小程序差异

以下差异保留，不做强行桌面化：

- 不使用 web 左侧固定侧栏，改为移动端横向 chips / 弹层
- 不做桌面分页按钮，先保留单页结果流
- 采购建议卡下沉或移除，不再占据页面主结构

#### 文件与改动

**Modify:** `miniprogram/pages/category/index.ts`

- 改为复用 `search/result` 的 hydrate / refresh 模式
- 页面状态至少包含：
  - `keyword`
  - `selectedCategoryId`
  - `selectedBrandIds`
  - `selectedSort`
  - `filterState`
  - `resultCount`
  - `productList`
  - `relatedCategories`
  - `brandOptions`

**Modify:** `miniprogram/pages/category/index.wxml`

- 去掉当前以“细分类目”和“当前热销”为主的主体结构
- 改成 Products 风格的结果页结构

**Modify:** `miniprogram/pages/category/index.wxss`

- 用当前项目已有的搜索结果页和商品列表视觉语言
- 保持 tab 页面首屏稳定，不引入复杂动画

### 8.3 组件层

**Modify:** `miniprogram/components/business/product-card/index.wxml`

- 改为真正展示商品图，而不是把 `cover` 当文案展示
- 补充：
  - 划线价
  - 评分
  - 低库存提示
  - 规格摘要

**Modify:** `miniprogram/components/business/product-card/index.wxss`

- 适配新的图片卡片布局

说明：

- 这是共享组件，`search/result` 等列表页也会同步受益
- 若影响过大，再退回为 `variant="products"` 方案

## 9. TDD 落地计划

### Task 1: 先补红测

**Files:**

- Modify: `tests/api/browse-service.test.cjs`
- Test: `tests/api/browse-service.test.cjs`

**Step 1: 写失败用例**

覆盖至少 3 个场景：

1. `getSearchFilterShell()` 返回品牌列表
2. `searchProductsPage()` 透传 `brandId`
3. `SearchProduct` adapter 补齐 `originalPrice/rating/stock/specText`

**Step 2: 运行红测**

Run:

```bash
node --test tests/api/browse-service.test.cjs
```

Expected:

- 断言失败，提示品牌列表或品牌参数缺失

### Task 2: API / Service 实现

**Files:**

- Modify: `miniprogram/api/modules/home.ts`
- Modify: `miniprogram/services/browse.ts`
- Modify: `miniprogram/api/adapters/browse.ts`
- Modify: `miniprogram/types/models.ts`

**Step 1: 实现 `getBrands()`**

调用：

```ts
GET /v1/app/home/brands
```

**Step 2: 扩展筛选壳子**

- 在 `getSearchFilterShell()` 返回品牌选项

**Step 3: 扩展搜索请求**

- 在 `searchProductsPage()` / request params 中加入 `brandId`

**Step 4: 补齐商品字段映射**

- `originalPrice`
- `rating`
- `stock`
- `specText`

**Step 5: 跑测试**

Run:

```bash
node --test tests/api/browse-service.test.cjs
```

Expected:

- 相关 browse service 测试通过

### Task 3: 选型页切换为 Products 风格数据流

**Files:**

- Modify: `miniprogram/pages/category/index.ts`
- Modify: `miniprogram/pages/category/index.wxml`
- Modify: `miniprogram/pages/category/index.wxss`

**Step 1: 改页面状态模型**

- 接入品牌、排序、结果数、商品列表

**Step 2: 改 hydrate/refresh 逻辑**

- 页面初始化时：
  - 取筛选壳子
  - 取商品列表

**Step 3: 改页面结构**

- 主体切到商品列表
- 分类树改为快速切换入口

**Step 4: 本地验证**

页面至少验证：

- 初始进入
- 切分类
- 切品牌
- 切排序
- 空态
- error/offline 演示态

### Task 4: 商品卡展示对齐

**Files:**

- Modify: `miniprogram/components/business/product-card/index.wxml`
- Modify: `miniprogram/components/business/product-card/index.wxss`

**Step 1: 先按 web 字段补展示**

- 图片
- 规格摘要
- 原价
- 评分
- 库存提醒

**Step 2: 复查其它使用页**

- `pages/category/index`
- `package-catalog/search/result`

若共享样式影响过大，再改成变体方案。

## 10. 验证命令

按顺序执行：

```bash
node --test tests/api/browse-service.test.cjs
npm run typecheck
npm run build:miniapp
npm run test:node
npm run verify:source-runtime
```

## 11. 完成标准

满足以下条件才算完成：

1. 小程序 `选型` tab 首屏已变成商品列表主视图，不再只是分类导航页。
2. 页面已接入品牌筛选，并能把品牌 ID 传给 `/v1/app/home/search-products`。
3. 商品卡展示字段明显向 web `Products` 靠拢。
4. 现有 `search/result` 能力没有被破坏。
5. 上述验证命令通过。

## 12. 实施顺序

1. 先补测试，锁定品牌筛选和字段映射缺口。
2. 再改 API / adapter / service。
3. 然后改 `pages/category/index`。
4. 最后改共享 `product-card` 并做验证。

## 13. 实际落地结果

本次已按上面的实施顺序完成落地。

### 已完成改动

- 数据层
  - `miniprogram/api/modules/home.ts`：新增 `getBrands()`
  - `miniprogram/services/browse.ts`：`getSearchFilterShell()` 增加 `brandOptions`，`searchProductsPage()` 增加 `selectedBrandIds` 和 `brandId` 透传
  - `miniprogram/api/adapters/browse.ts`：补齐 `brandId / originalPrice / rating / stock / specText`
  - `miniprogram/types/models.ts`：补充品牌筛选类型与商品卡扩展字段
  - `miniprogram/mock/browse.ts`：补充 mock 品牌筛选项与 mock 品牌过滤
- 页面层
  - `miniprogram/pages/category/index.*`：`选型` tab 已从“分类导航页”切为“Products 风格商品列表页”
  - 页面现在支持：
    - 关键词搜索
    - 分类切换
    - 品牌筛选
    - 排序切换
    - 筛选抽屉
    - 当前筛选项摘要
    - 商品列表主视图
- 组件层
  - `miniprogram/components/business/product-card/*`：补齐图片承载、规格摘要、原价、评分和低库存提示
- 测试
  - `tests/api/browse-service.test.cjs`：新增品牌筛选与商品字段映射断言

### 验证结果

已顺序执行并通过：

```bash
node --test tests/api/browse-service.test.cjs
npm run typecheck
npm run build:miniapp
npm run test:node
npm run verify:source-runtime
```

### 仍需人工确认

- 微信开发者工具内走查 `选型` tab 的交互与视觉
- 重点看：
  - 分类切换是否顺手
  - 品牌 chips 数量多时是否需要折叠/更多
  - 商品卡在 mock 数据场景下的图片 fallback 是否符合预期
