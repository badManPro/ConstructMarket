"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../mock/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        title: "建材采购首页",
        summary: "围绕工程采购场景组织主材、辅材和资讯导流，优先打通浏览到商品详情的前半链路。",
        cityLabel: "杭州",
        messageBadge: "消息 99+",
        searchKeyword: "42.5R 水泥",
        keywordSuggestions: browse_1.hotSearchKeywords,
        banners: browse_1.homeBanners,
        categoryNav: browse_1.homeCategoryNav.map((item) => ({
            ...item,
            shortName: item.name.slice(0, 2),
        })),
        campaignProducts: [],
        hotProducts: [],
        articleEntrances: browse_1.articleEntrances,
    },
    onLoad() {
        this.hydrateHomeSections();
    },
    onShow() {
        this.hydrateHomeSections();
    },
    hydrateHomeSections() {
        const favoriteIds = (0, storage_1.getFavoriteIds)();
        const sections = (0, browse_1.getHomeSections)(favoriteIds);
        this.setData(sections);
    },
    handleSearchTap() {
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, { keyword: this.data.searchKeyword });
    },
    handleKeywordTap(event) {
        const { keyword } = event.currentTarget.dataset;
        if (!keyword)
            return;
        this.setData({ searchKeyword: keyword });
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, { keyword });
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
        this.setData((0, browse_1.getHomeSections)(favoriteIds));
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
});
