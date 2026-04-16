const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function loadBrowseAdapterModule() {
  const modulePath = require.resolve("../../miniprogram/api/adapters/browse.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

function loadRoutesModule() {
  const modulePath = require.resolve("../../miniprogram/constants/routes.js");
  delete require.cache[modulePath];
  return require(modulePath);
}

test("adaptBannerCards keeps real banner image and link semantics for carousel items", () => {
  const { adaptBannerCards } = loadBrowseAdapterModule();
  const { ROUTES } = loadRoutesModule();

  const banners = adaptBannerCards([
    {
      id: "banner-2",
      bannerTitle: "外部活动",
      bannerDesc: "跳转外部链接",
      imageUrl: "https://cdn.example.com/banner-2.png",
      linkTypeCode: "EXTERNAL",
      linkTargetValue: "https://chat.deepseek.com/",
      sortNo: 2,
    },
    {
      id: "banner-1",
      bannerTitle: "工业品一站式采购",
      bannerDesc: null,
      imageUrl: "",
      linkTypeCode: "INTERNAL",
      linkTargetValue: "/products",
      sortNo: 1,
    },
  ]);

  assert.equal(banners[0].id, "banner-1");
  assert.equal(banners[0].route, ROUTES.searchResult);
  assert.equal(banners[0].params, undefined);
  assert.equal(banners[1].imageUrl, "https://cdn.example.com/banner-2.png");
  assert.equal(banners[1].linkType, "external");
  assert.equal(banners[1].route, ROUTES.webview);
  assert.equal(banners[1].actionText, "打开活动");
  assert.deepEqual(banners[1].params, {
    url: "https://chat.deepseek.com/",
    title: "外部活动",
  });
});

test("app registers the shared webview page in package-content", () => {
  const appJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../miniprogram/app.json"), "utf8"),
  );
  const contentPackage = appJson.subPackages.find((item) => item.root === "package-content");

  assert.ok(contentPackage);
  assert.ok(contentPackage.pages.includes("webview/index"));
});

test("home page banner template renders each banner inside swiper-item", () => {
  const filePath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxml");
  const wxml = fs.readFileSync(filePath, "utf8");

  assert.match(wxml, /<swiper-item[^>]*wx:for="\{\{banners\}\}"/);
});
