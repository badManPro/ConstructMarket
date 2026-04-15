"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const content_1 = require("../../mock/content");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
function normalizeCategory(category) {
    const tabs = (0, content_1.getArticleTabs)();
    return tabs.some((item) => item.value === category) ? category ?? "all" : "all";
}
function withCategoryLabel(article) {
    return {
        ...article,
        categoryLabel: (0, content_1.getArticleCategoryLabel)(article.category),
    };
}
Page({
    data: {
        status: "loading",
        mockState: "",
        currentCategory: "all",
        currentTabDesc: "",
        pageSubtitle: "",
        tabs: [],
        featuredArticle: null,
        articles: [],
        hasMore: false,
    },
    onLoad(options) {
        const currentCategory = normalizeCategory(options.category);
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            currentCategory,
            mockState: mockState ?? "",
        });
        this.hydrateArticles(currentCategory, mockState);
    },
    onPullDownRefresh() {
        this.hydrateArticles(this.data.currentCategory);
    },
    hydrateArticles(category, override = null) {
        const currentCategory = normalizeCategory(category ?? this.data.currentCategory);
        const tabs = (0, content_1.getArticleTabs)();
        const currentTab = tabs.find((item) => item.value === currentCategory) ?? tabs[0];
        if (override === "loading") {
            this.setData({
                status: "loading",
                currentCategory,
                tabs,
                currentTabDesc: currentTab.desc,
                pageSubtitle: `${currentTab.label} · 加载中`,
            });
            wx.stopPullDownRefresh();
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                currentCategory,
                tabs,
                currentTabDesc: currentTab.desc,
                pageSubtitle: `${currentTab.label} · 资讯状态异常`,
                featuredArticle: null,
                articles: [],
                hasMore: false,
            });
            wx.stopPullDownRefresh();
            return;
        }
        try {
            const nextArticles = (0, content_1.getArticlesByCategory)(currentCategory).map((item) => withCategoryLabel(item));
            const featuredArticle = nextArticles[0] ?? null;
            this.setData({
                status: nextArticles.length ? "ready" : "empty",
                currentCategory,
                tabs,
                currentTabDesc: currentTab.desc,
                pageSubtitle: `${currentTab.label} · ${nextArticles.length} 篇内容`,
                featuredArticle,
                articles: featuredArticle ? nextArticles.slice(1) : [],
                hasMore: nextArticles.length > 2,
            });
        }
        catch {
            this.setData({
                status: "error",
                currentCategory,
                tabs,
                currentTabDesc: currentTab.desc,
                pageSubtitle: `${currentTab.label} · 加载失败`,
                featuredArticle: null,
                articles: [],
                hasMore: false,
            });
        }
        finally {
            wx.stopPullDownRefresh();
        }
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    handleTabTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value || value === this.data.currentCategory)
            return;
        this.setData({
            currentCategory: value,
            mockState: "",
            status: "loading",
        });
        this.hydrateArticles(value);
    },
    handleOpenArticle(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.articleDetail, {
            id,
            category: this.data.currentCategory,
        });
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        this.hydrateArticles(this.data.currentCategory);
    },
    handleViewAll() {
        this.setData({
            currentCategory: "all",
            mockState: "",
            status: "loading",
        });
        this.hydrateArticles("all");
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
});
