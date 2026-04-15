const test = require("node:test");
const assert = require("node:assert/strict");

function loadHomeApiModule() {
  const modulePath = require.resolve("../../miniprogram/api/modules/home.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("createHomeApi.searchProducts encodes query params in POST url", async () => {
  const { createHomeApi } = loadHomeApiModule();

  let receivedOptions = null;

  global.wx = {
    request(options) {
      receivedOptions = options;
      options.success({
        statusCode: 200,
        data: {
          success: true,
          data: [],
        },
      });
    },
  };

  const api = createHomeApi({
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "",
      timeout: 12000,
    },
  });

  await api.searchProducts({
    keyword: "切割机",
    categoryId: 101,
    sortType: "price_desc",
    minPrice: 100,
    maxPrice: 300,
    pageIndex: 1,
    pageSize: 20,
  });

  assert.ok(receivedOptions);
  assert.equal(receivedOptions.method, "POST");
  assert.match(receivedOptions.url, /\/v1\/app\/home\/search-products\?/);
  assert.match(receivedOptions.url, /keyword=%E5%88%87%E5%89%B2%E6%9C%BA/);
  assert.match(receivedOptions.url, /categoryId=101/);
  assert.match(receivedOptions.url, /sortType=price_desc/);
  assert.equal(receivedOptions.data, undefined);
});
