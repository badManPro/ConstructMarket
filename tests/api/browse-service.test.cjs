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
  assert.equal(homeData.hotProducts[0].isFavorite, false);
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
      getBrands: async () => [
        {
          id: "11",
          brandCode: "MT",
          brandName: "牧田",
        },
        {
          id: "22",
          brandCode: "DC",
          brandName: "东成",
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
              marketPrice: 329,
              ratingScore: 4.8,
              stockQty: 8,
              salesQty: 91,
              tagNames: "热销",
              categoryInfo: {
                categoryName: "电动工具",
              },
              brandInfo: {
                id: "11",
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
              marketPrice: 109,
              ratingScore: 4.2,
              stockQty: 18,
              salesQty: 20,
              tagNames: "入门",
              categoryInfo: {
                categoryName: "电动工具",
              },
              brandInfo: {
                id: "22",
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
    selectedBrandIds: ["11"],
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
  assert.deepEqual(filterShell.brandOptions, [
    {
      id: "11",
      name: "牧田",
    },
    {
      id: "22",
      name: "东成",
    },
  ]);
  assert.equal(result.source, "remote");
  assert.equal(result.productList.length, 1);
  assert.equal(result.productList[0].id, "901");
  assert.equal(result.productList[0].originalPrice, 329);
  assert.equal(result.productList[0].rating, 4.8);
  assert.equal(result.productList[0].stock, 8);
  assert.equal(result.productList[0].specText, "标准款");
  assert.deepEqual(captured[0], {
    keyword: "切割",
    categoryId: 1,
    brandId: [11],
    sortType: "price_desc",
    minPrice: 200,
    pageIndex: 1,
    pageSize: 20,
  });
});

test("createBrowseService adapts remote product detail, specs, merchant, and recommendations", async () => {
  const { createBrowseService } = loadBrowseServiceModule();

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "token",
    },
    productApi: {
      getProductDetail: async () => ({
        product: {
          id: "200",
          merchantId: "300",
          categoryId: "10",
          productName: "激光测距仪",
          productSubtitle: "适合工地测量",
          detailContent: "<p>支持高精度测距</p>",
          coverImageUrl: "measure-cover.png",
          imageAlbum: ["measure-1.png", "measure-2.png"],
          unitName: "台",
          salePrice: 299,
          marketPrice: 359,
          stockQty: 12,
          salesQty: 58,
          ratingScore: 4.9,
          tagNames: "热销,支持开票",
          brandInfo: {
            id: "brand-1",
            brandName: "博世",
          },
          categoryInfo: {
            id: "10",
            categoryName: "测量仪器",
          },
          isFavorited: true,
        },
        merchant: {
          id: "300",
          merchantName: "博世官方旗舰店",
          ratingScore: 4.7,
          merchantTags: "正品,极速发货",
        },
        skuList: [
          {
            id: "sku-1",
            skuCode: "LASER-001",
            skuName: "50米款",
            imageUrl: "measure-sku.png",
            salePrice: 299,
            marketPrice: 359,
            stockQty: 12,
            specSnapshot: {
              specs: [
                { specName: "量程", specValue: "50米", sortNo: 1 },
                { specName: "套装", specValue: "标准版", sortNo: 2 },
              ],
              displayText: "50米 / 标准版",
            },
          },
        ],
      }),
      getProductSpecs: async () => ({
        productId: "200",
        specs: [
          {
            specName: "量程",
            values: [{ specValue: "50米", sortNo: 1 }],
          },
          {
            specName: "套装",
            values: [{ specValue: "标准版", sortNo: 1 }],
          },
        ],
      }),
      getMerchantDetail: async () => ({
        id: "300",
        merchantName: "博世官方旗舰店",
        ratingScore: 4.8,
        merchantTags: "正品,极速发货",
      }),
    },
    homeApi: {
      searchProducts: async () => [
        {
          product: {
            id: "200",
            categoryId: "10",
            productName: "激光测距仪",
            coverImageUrl: "measure-cover.png",
            unitName: "台",
            salePrice: 299,
            salesQty: 58,
            brandInfo: { brandName: "博世" },
            categoryInfo: { categoryName: "测量仪器" },
          },
          skuList: [{ skuCode: "LASER-001", skuName: "50米款", salePrice: 299 }],
        },
        {
          product: {
            id: "201",
            categoryId: "10",
            productName: "电子水平仪",
            coverImageUrl: "level.png",
            unitName: "台",
            salePrice: 189,
            salesQty: 42,
            brandInfo: { brandName: "东成" },
            categoryInfo: { categoryName: "测量仪器" },
          },
          skuList: [{ skuCode: "LEVEL-001", skuName: "标准款", salePrice: 189 }],
        },
      ],
    },
  });

  const pageData = await service.getProductPageData("200");

  assert.equal(pageData.source, "remote");
  assert.equal(pageData.product.id, "200");
  assert.equal(pageData.product.isFavorite, true);
  assert.equal(pageData.product.shopInfo.shopName, "博世官方旗舰店");
  assert.equal(pageData.product.description, "支持高精度测距");
  assert.equal(pageData.product.specGroups.length, 2);
  assert.equal(pageData.product.skuOptions[0].skuCode, "LASER-001");
  assert.deepEqual(pageData.product.skuOptions[0].optionValues, ["50米", "标准版"]);
  assert.equal(pageData.recommendedProducts.length, 1);
  assert.equal(pageData.recommendedProducts[0].id, "201");
});

test("createBrowseService returns remote favorite products for favorite page", async () => {
  const { createBrowseService } = loadBrowseServiceModule();

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "token",
    },
    profileApi: {
      getProductFavorites: async () => [
        {
          id: "favorite-1",
          createdAt: "2026-04-17T09:30:00Z",
          merchantName: "霍尼韦尔旗舰店",
          product: {
            id: "500",
            merchantId: "88",
            categoryId: "2",
            productName: "安全帽",
            coverImageUrl: "helmet.png",
            unitName: "顶",
            salePrice: 49,
            salesQty: 120,
            tagNames: "劳保,现货",
            brandInfo: {
              id: "brand-5",
              brandName: "霍尼韦尔",
            },
            categoryInfo: {
              categoryName: "劳保用品",
            },
            isFavorited: true,
          },
          skuList: [
            {
              skuCode: "HELMET-001",
              skuName: "黄色",
              imageUrl: "helmet-yellow.png",
              salePrice: 49,
              stockQty: 25,
            },
          ],
        },
      ],
    },
  });

  const favoriteData = await service.getFavoriteShellData();

  assert.equal(favoriteData.source, "remote");
  assert.equal(favoriteData.favoriteProducts.length, 1);
  assert.equal(favoriteData.favoriteProducts[0].id, "500");
  assert.equal(favoriteData.favoriteProducts[0].merchantId, "88");
  assert.equal(favoriteData.favoriteProducts[0].skuId, "HELMET-001");
  assert.equal(favoriteData.favoriteProducts[0].isFavorite, true);
});

test("createBrowseService builds remote cart payload and refreshes remote cart count", async () => {
  const { createBrowseService } = loadBrowseServiceModule();
  let receivedPayload = null;

  const service = createBrowseService({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "token",
    },
    tradeApi: {
      addCartItem: async (payload) => {
        receivedPayload = payload;
        return {
          id: "cart-1",
          quantity: 2,
        };
      },
      getCart: async () => [
        { id: "cart-1", quantity: 2 },
        { id: "cart-2", quantity: 3 },
      ],
    },
  });

  const result = await service.addProductToCart({
    product: {
      id: "900",
      merchantId: "901",
      name: "工程对讲机",
      skuId: "RADIO-DEFAULT",
      price: 599,
      skuOptions: [
        {
          skuId: "sku-900",
          skuCode: "RADIO-001",
          name: "标准款",
          displayText: "标准款 / 5公里",
          optionValues: ["标准款", "5公里"],
          imageUrl: "radio.png",
          price: 599,
        },
      ],
    },
    quantity: 2,
    selectedSkuCode: "RADIO-001",
    selectedSpecText: "标准款 / 5公里",
  });

  assert.equal(result.source, "remote");
  assert.equal(result.cartPreviewCount, 5);
  assert.deepEqual(receivedPayload, {
    merchantId: 901,
    productId: 900,
    skuCode: "RADIO-001",
    quantity: 2,
    selectedFlag: 1,
    unitPrice: 599,
    snapshotJson: JSON.stringify({
      productId: "900",
      productName: "工程对讲机",
      skuCode: "RADIO-001",
      specText: "标准款 / 5公里",
      quantity: 2,
    }),
  });
});
