const test = require("node:test");
const assert = require("node:assert/strict");

function loadBrowseServiceModule() {
  const modulePath = require.resolve("../../miniprogram/services/browse.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("createBrowseService returns mock home data in mock mode", async () => {
  const { createBrowseService } = loadBrowseServiceModule();

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "mock",
      token: "",
    },
  });

  const homeData = await service.getHomePageData(["p-floor-001"]);

  assert.equal(homeData.source, "mock");
  assert.ok(homeData.banners.length > 0);
  assert.ok(homeData.categoryNav.length > 0);
  assert.ok(homeData.campaignProducts.length > 0);
  assert.ok(homeData.hotProducts.length > 0);
});

test("createBrowseService falls back to mock home data in hybrid mode when remote fetch fails", async () => {
  const { createBrowseService } = loadBrowseServiceModule();

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "hybrid",
      token: "",
    },
    homeApi: {
      getBanners: async () => {
        throw new Error("remote unavailable");
      },
      getCategories: async () => [],
      getNewArrivalProducts: async () => [],
      getHotRecommendProducts: async () => [],
      getNewsArticles: async () => [],
    },
  });

  const homeData = await service.getHomePageData([]);

  assert.equal(homeData.source, "mock");
  assert.ok(homeData.banners.length > 0);
});

test("createBrowseService returns remote home data for nested product payloads and grouped articles", async () => {
  const { createBrowseService } = loadBrowseServiceModule();

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "",
    },
    homeApi: {
      getBanners: async () => [
        {
          id: "banner-1",
          bannerTitle: "实时 Banner",
          bannerDesc: "来自远端首页接口",
          linkTypeCode: "INTERNAL",
          linkTargetValue: "/products",
        },
      ],
      getCategories: async () => [
        {
          id: "1",
          categoryCode: "C001",
          categoryName: "电动工具",
          children: [
            {
              id: "101",
              categoryCode: "C00101",
              categoryName: "电钻",
              children: [],
            },
          ],
        },
      ],
      getNewArrivalProducts: async () => [
        {
          product: {
            id: "200",
            categoryId: "1",
            productName: "冲击电钻",
            coverImageUrl: "drill.png",
            unitName: "台",
            salePrice: 399,
            salesQty: 88,
            tagNames: "新品,现货",
            categoryInfo: {
              categoryName: "电动工具",
            },
            brandInfo: {
              brandName: "博世",
            },
          },
          skuList: [
            {
              id: "sku-200",
              skuName: "18V",
              imageUrl: "drill-sku.png",
              salePrice: 399,
              stockQty: 10,
            },
          ],
        },
      ],
      getHotRecommendProducts: async () => [
        {
          product: {
            id: "201",
            categoryId: "1",
            productName: "无刷角磨机",
            coverImageUrl: "grinder.png",
            unitName: "台",
            salePrice: 259,
            salesQty: 108,
            tagNames: "热销,现货",
            categoryInfo: {
              categoryName: "电动工具",
            },
            brandInfo: {
              brandName: "东成",
            },
          },
          skuList: [
            {
              id: "sku-201",
              skuName: "大功率",
              imageUrl: "grinder-sku.png",
              salePrice: 259,
              stockQty: 20,
            },
          ],
        },
      ],
      getNewsArticles: async () => ({
        industryNews: [
          {
            id: "news-1",
            categoryCode: "industry_news",
            titleText: "工业品采购趋势",
            summaryText: "交付稳定性优先",
          },
        ],
        productKnowledge: [
          {
            id: "news-2",
            categoryCode: "product_knowledge",
            titleText: "电钻选型",
            summaryText: "按功率和场景选型",
          },
        ],
        decorationGuides: [],
      }),
    },
  });

  const homeData = await service.getHomePageData(["201"]);

  assert.equal(homeData.source, "remote");
  assert.equal(homeData.banners[0].title, "实时 Banner");
  assert.equal(homeData.categoryNav[0].id, "1");
  assert.equal(homeData.campaignProducts[0].id, "200");
  assert.equal(homeData.campaignProducts[0].brand, "博世");
  assert.equal(homeData.hotProducts[0].isFavorite, true);
  assert.equal(homeData.articleEntrances.length, 2);
  assert.equal(homeData.articleEntrances[0].title, "工业品采购趋势");
});

test("createBrowseService returns remote category shell data with remote ids and hot products", async () => {
  const { createBrowseService } = loadBrowseServiceModule();
  const captured = [];

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "",
    },
    homeApi: {
      getCategories: async () => [
        {
          id: "1",
          categoryCode: "C001",
          categoryName: "电动工具",
          children: [{ id: "101", categoryCode: "C00101", categoryName: "电钻", children: [] }],
        },
        {
          id: "2",
          categoryCode: "C002",
          categoryName: "劳保用品",
          children: [{ id: "201", categoryCode: "C00201", categoryName: "安全鞋", children: [] }],
        },
      ],
      searchProducts: async (params) => {
        captured.push(params);
        return [
          {
            product: {
              id: "500",
              categoryId: "2",
              productName: "防砸安全鞋",
              coverImageUrl: "shoe.png",
              unitName: "双",
              salePrice: 168,
              salesQty: 45,
              tagNames: "防护,热销",
              categoryInfo: {
                categoryName: "劳保用品",
              },
              brandInfo: {
                brandName: "霍尼韦尔",
              },
            },
            skuList: [
              {
                id: "sku-500",
                skuName: "42码",
                imageUrl: "shoe-sku.png",
                salePrice: 168,
              },
            ],
          },
        ];
      },
    },
  });

  const pageData = await service.getCategoryShellData("2", []);

  assert.equal(pageData.source, "remote");
  assert.equal(pageData.selectedCategoryId, "2");
  assert.equal(pageData.rootCategories.length, 2);
  assert.equal(pageData.currentCategory.name, "劳保用品");
  assert.equal(pageData.subCategories[0].routeCategoryId, "201");
  assert.equal(pageData.categoryProducts[0].id, "500");
  assert.deepEqual(captured[0], {
    categoryId: 2,
    sortType: "sales_desc",
    pageIndex: 1,
    pageSize: 6,
  });
});

test("createBrowseService returns remote search shell and keeps search filters usable", async () => {
  const { createBrowseService } = loadBrowseServiceModule();
  const captured = [];

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "",
    },
    homeApi: {
      getCategories: async () => [
        {
          id: "1",
          categoryCode: "C001",
          categoryName: "电动工具",
          children: [],
        },
      ],
      getDictSimpleList: async () => [
        {
          dictTypeCode: "product_material",
          dictItemValue: "metal",
          dictItemName: "金属",
        },
      ],
      getDictTreeList: async () => [
        {
          dictTypeCode: "price_range",
          dictItemValue: "all",
          dictItemName: "全部价格",
          children: [
            { dictTypeCode: "price_range", dictItemValue: "budget", dictItemName: "100 以下" },
            { dictTypeCode: "price_range", dictItemValue: "premium", dictItemName: "200 以上" },
          ],
        },
      ],
      searchProducts: async (params) => {
        captured.push(params);
        return [
          {
            product: {
              id: "901",
              categoryId: "1",
              productName: "金属切割机",
              coverImageUrl: "cutter.png",
              unitName: "台",
              salePrice: 268,
              salesQty: 91,
              tagNames: "热销",
              categoryInfo: {
                categoryName: "电动工具",
              },
              brandInfo: {
                brandName: "牧田",
              },
            },
            skuList: [
              {
                id: "sku-901",
                skuName: "标准款",
                imageUrl: "cutter-sku.png",
                salePrice: 268,
              },
            ],
          },
          {
            product: {
              id: "902",
              categoryId: "1",
              productName: "入门电磨",
              coverImageUrl: "grind.png",
              unitName: "台",
              salePrice: 89,
              salesQty: 20,
              tagNames: "入门",
              categoryInfo: {
                categoryName: "电动工具",
              },
              brandInfo: {
                brandName: "东成",
              },
            },
            skuList: [
              {
                id: "sku-902",
                skuName: "基础款",
                imageUrl: "grind-sku.png",
                salePrice: 89,
              },
            ],
          },
        ];
      },
    },
  });

  const filterShell = await service.getSearchFilterShell();
  const result = await service.searchProductsPage({
    keyword: "切割",
    categoryId: "1",
    sortOption: "price_desc",
    filterState: {
      priceRange: "premium",
      minOrder: "all",
      material: "all",
    },
    favoriteIds: [],
  });

  assert.equal(filterShell.source, "remote");
  assert.equal(filterShell.relatedCategories[1].id, "1");
  assert.equal(filterShell.materialOptions[1].value, "metal");
  assert.equal(result.source, "remote");
  assert.equal(result.productList.length, 1);
  assert.equal(result.productList[0].id, "901");
  assert.deepEqual(captured[0], {
    keyword: "切割",
    categoryId: 1,
    sortType: "price_desc",
    minPrice: 200,
    pageIndex: 1,
    pageSize: 20,
  });
});
