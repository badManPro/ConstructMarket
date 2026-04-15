const test = require("node:test");
const assert = require("node:assert/strict");

function loadAppRuntimeModule() {
  const modulePath = require.resolve("../../miniprogram/app-runtime.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("applyApiRuntimeConfig refreshes app global data from latest storage values", () => {
  let mode = "mock";
  let baseUrl = "http://106.15.108.65:8085/api";

  global.wx = {
    getStorageSync(key) {
      const storage = {
        constructmarket_api_mode: mode,
        constructmarket_api_base_url: baseUrl,
      };

      return storage[key];
    },
  };

  const { applyApiRuntimeConfig, createInitialGlobalData } = loadAppRuntimeModule();
  const globalData = createInitialGlobalData();

  assert.equal(globalData.currentEnv, "mock");

  mode = "hybrid";
  baseUrl = "https://debug.example.com/api/";

  const config = applyApiRuntimeConfig(globalData);

  assert.equal(config.mode, "hybrid");
  assert.equal(config.baseUrl, "https://debug.example.com/api");
  assert.equal(globalData.currentEnv, "hybrid");
  assert.equal(globalData.apiBaseUrl, "https://debug.example.com/api");

  delete global.wx;
});
