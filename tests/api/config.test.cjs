const test = require("node:test");
const assert = require("node:assert/strict");

function loadConfigModule() {
  const modulePath = require.resolve("../../miniprogram/api/config.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("getApiConfig reads storage defaults and trims trailing slash", () => {
  global.wx = {
    getStorageSync(key) {
      const storage = {
        constructmarket_api_base_url: "https://example.com/gateway/",
        constructmarket_api_mode: "hybrid",
        constructmarket_dev_token: "stored-token",
      };

      return storage[key];
    },
  };

  const { getApiConfig } = loadConfigModule();
  const config = getApiConfig();

  assert.equal(config.baseUrl, "https://example.com/gateway");
  assert.equal(config.mode, "hybrid");
  assert.equal(config.token, "stored-token");

  delete global.wx;
});

test("getApiConfig prefers explicit overrides and falls back to mock mode", () => {
  global.wx = {
    getStorageSync() {
      return undefined;
    },
  };

  const { getApiConfig, DEFAULT_API_BASE_URL } = loadConfigModule();
  const config = getApiConfig({
    baseUrl: "https://override.local/root/",
    mode: "remote",
    token: "override-token",
  });

  const fallback = getApiConfig({
    mode: "invalid-mode",
  });

  assert.equal(config.baseUrl, "https://override.local/root");
  assert.equal(config.mode, "remote");
  assert.equal(config.token, "override-token");
  assert.equal(fallback.baseUrl, DEFAULT_API_BASE_URL);
  assert.equal(fallback.mode, "mock");
  assert.equal(fallback.token, "");

  delete global.wx;
});
