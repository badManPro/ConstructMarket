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
  assert.equal(banners[1].actionText, "立即前往");
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
  assert.match(wxml, /indicator-dots/);
  assert.doesNotMatch(wxml, /banner-swiper__arrow|prevBanner|nextBanner/);
  assert.match(wxml, /banner-card__action--solid/);
});

test("home page template does not render keyword suggestion chips below search", () => {
  const filePath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxml");
  const wxml = fs.readFileSync(filePath, "utf8");

  assert.doesNotMatch(wxml, /keywordSuggestions/);
  assert.doesNotMatch(wxml, /home-chip-row/);
  assert.doesNotMatch(wxml, /handleKeywordTap/);
});

test("home page header removes message badge and tightens search-to-banner spacing", () => {
  const wxmlPath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxml");
  const wxssPath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxss");
  const wxml = fs.readFileSync(wxmlPath, "utf8");
  const wxss = fs.readFileSync(wxssPath, "utf8");
  const headerBlock = wxss.match(/\.home-header\s*\{([^}]*)\}/);
  const bannerWrapBlock = wxss.match(/\.home-banner-wrap\s*\{([^}]*)\}/);

  assert.doesNotMatch(wxml, /messageBadge/);
  assert.doesNotMatch(wxml, /home-header__badge/);
  assert.ok(headerBlock, "expected .home-header styles");
  assert.ok(bannerWrapBlock, "expected .home-banner-wrap styles");
  assert.match(headerBlock[1], /padding:\s*20rpx 24rpx 16rpx/);
  assert.match(bannerWrapBlock[1], /margin:\s*12rpx 24rpx 0/);
});

test("home page banner uses outer viewport clipping instead of rounding each slide", () => {
  const filePath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxss");
  const wxss = fs.readFileSync(filePath, "utf8");
  const wrapBlock = wxss.match(/\.home-banner-wrap\s*\{([^}]*)\}/);
  const cardBlock = wxss.match(/\.banner-card\s*\{([^}]*)\}/);

  assert.ok(wrapBlock, "expected .home-banner-wrap styles");
  assert.ok(cardBlock, "expected .banner-card styles");
  assert.match(wrapBlock[1], /border-radius:\s*24rpx/);
  assert.match(wrapBlock[1], /overflow:\s*hidden/);
  assert.doesNotMatch(cardBlock[1], /border-radius:/);
  assert.doesNotMatch(cardBlock[1], /overflow:\s*hidden/);
});

test("home page banner CTA uses compact mobile padding", () => {
  const filePath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxss");
  const wxss = fs.readFileSync(filePath, "utf8");
  const actionBlock = wxss.match(/\.banner-card__action\s*\{([^}]*)\}/);

  assert.ok(actionBlock, "expected .banner-card__action styles");
  assert.match(actionBlock[1], /padding:\s*10rpx 18rpx/);
  assert.match(actionBlock[1], /font-size:\s*20rpx/);
  assert.doesNotMatch(actionBlock[1], /min-width:/);
});

test("home page banner widens title and subtitle boxes to avoid awkward wraps", () => {
  const filePath = path.resolve(__dirname, "../../miniprogram/pages/home/index.wxss");
  const wxss = fs.readFileSync(filePath, "utf8");
  const titleBlock = wxss.match(/\.banner-card__title\s*\{([^}]*)\}/);
  const subtitleBlock = wxss.match(/\.banner-card__subtitle\s*\{([^}]*)\}/);

  assert.ok(titleBlock, "expected .banner-card__title styles");
  assert.ok(subtitleBlock, "expected .banner-card__subtitle styles");
  assert.match(titleBlock[1], /max-width:\s*500rpx/);
  assert.match(subtitleBlock[1], /max-width:\s*520rpx/);
});
