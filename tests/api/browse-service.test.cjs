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
