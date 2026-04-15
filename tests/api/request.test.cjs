const test = require("node:test");
const assert = require("node:assert/strict");

function loadRequestModule() {
  const modulePath = require.resolve("../../miniprogram/api/request.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("apiRequest injects bearer token and unwraps success payload", async () => {
  const { apiRequest } = loadRequestModule();

  let receivedOptions = null;
  const data = await apiRequest({
    path: "/v1/app/home/banners",
    method: "GET",
    config: {
      baseUrl: "https://example.com/api",
      mode: "remote",
      token: "abc-token",
    },
    transport: async (options) => {
      receivedOptions = options;
      return {
        statusCode: 200,
        data: {
          code: 0,
          msg: "ok",
          data: [{ id: "banner-1" }],
        },
      };
    },
  });

  assert.deepEqual(data, [{ id: "banner-1" }]);
  assert.equal(receivedOptions.url, "https://example.com/api/v1/app/home/banners");
  assert.equal(receivedOptions.header.Authorization, "Bearer abc-token");
});

test("apiRequest throws normalized error on business failure", async () => {
  const { ApiRequestError, apiRequest } = loadRequestModule();

  await assert.rejects(
    () =>
      apiRequest({
        path: "/v1/app/user/cart",
        method: "GET",
        config: {
          baseUrl: "https://example.com/api",
          mode: "remote",
          token: "abc-token",
        },
        transport: async () => ({
          statusCode: 200,
          data: {
            code: 50001,
            msg: "token expired",
            data: null,
          },
        }),
      }),
    (error) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, 50001);
      assert.equal(error.message, "token expired");
      assert.equal(error.kind, "business");
      return true;
    },
  );
});

test("apiRequest throws normalized error on transport failure", async () => {
  const { ApiRequestError, apiRequest } = loadRequestModule();

  await assert.rejects(
    () =>
      apiRequest({
        path: "/v1/app/home/categories",
        method: "GET",
        config: {
          baseUrl: "https://example.com/api",
          mode: "remote",
          token: "",
        },
        transport: async () => {
          throw new Error("socket hang up");
        },
      }),
    (error) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.kind, "network");
      assert.match(error.message, /socket hang up/);
      return true;
    },
  );
});
