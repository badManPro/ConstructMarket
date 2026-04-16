"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../services/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
const page_1 = require("../../utils/page");
function withShortName(items) {
    return items.map((item) => ({
        ...item,
        shortName: item.name.slice(0, 2),
    }));
}
Page({
    data: {
        status: "loading",
        mockState: "",
        title: "建材采购首页",
        summary: "围绕工程采购场景组织主材、辅材和资讯导流，优先打通浏览到商品详情的前半链路。",
        cityLabel: "杭州",
        searchKeyword: "42.5R 水泥",
        banners: [],
        categoryNav: [],
        campaignProducts: [],
        hotProducts: [],
        articleEntrances: [],
    },
    onLoad(options) {
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            mockState: mockState ?? "",
        });
        void this.hydrateHomeSections(mockState);
    },
    onShow() {
        if (this.data.mockState)
            return;
        void this.hydrateHomeSections();
    },
    async hydrateHomeSections(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                banners: [],
                categoryNav: [],
                campaignProducts: [],
                hotProducts: [],
                articleEntrances: [],
            });
            return;
        }
        try {
            const homeData = await (0, browse_1.createBrowseService)().getHomePageData((0, storage_1.getFavoriteIds)());
            const hasContent = homeData.banners.length ||
                homeData.categoryNav.length ||
                homeData.campaignProducts.length ||
                homeData.hotProducts.length ||
                homeData.articleEntrances.length;
            this.setData({
                status: hasContent ? "ready" : "empty",
                banners: homeData.banners,
                categoryNav: withShortName(homeData.categoryNav),
                campaignProducts: homeData.campaignProducts,
                hotProducts: homeData.hotProducts,
                articleEntrances: homeData.articleEntrances,
            });
        }
        catch {
            this.setData({
                status: "error",
                banners: [],
                categoryNav: [],
                campaignProducts: [],
                hotProducts: [],
                articleEntrances: [],
            });
        }
    },
    handleSearchTap() {
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, { keyword: this.data.searchKeyword });
    },
    handleBannerTap(event) {
        const { route, params } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateWithParams)(route, params ?? {});
    },
    handleCategoryTap(event) {
        const { route, params } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateWithParams)(route, params ?? {});
    },
    handleProductTap(event) {
        const { id } = event.detail ?? {};
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.productDetail, { id });
    },
    handleFavoriteTap(event) {
        const { id } = event.detail ?? {};
        if (!id)
            return;
        const favoriteIds = (0, storage_1.toggleFavoriteId)(id);
        void this.hydrateHomeSections();
        wx.showToast({
            title: favoriteIds.includes(id) ? "已加入收藏" : "已取消收藏",
            icon: "none",
        });
    },
    handleArticleTap(event) {
        const { route, params } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateWithParams)(route, params ?? {});
    },
    handleRouteTap(event) {
        const { route } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateToRoute)(route);
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        void this.hydrateHomeSections();
    },
});
