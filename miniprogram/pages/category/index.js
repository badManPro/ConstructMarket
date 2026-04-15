"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../services/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
const page_1 = require("../../utils/page");
Page({
    data: {
        status: "loading",
        mockState: "",
        selectedCategoryId: "",
        pageSubtitle: "",
        searchPlaceholder: "建材 / 品牌 / 型号",
        loadingSkeleton: [1, 2, 3, 4],
        rootCategories: [],
        currentCategory: null,
        subCategories: [],
        categoryProducts: [],
    },
    onLoad(options) {
        const selectedCategoryId = typeof options.categoryId === "string" ? options.categoryId : "";
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            selectedCategoryId,
            mockState: mockState ?? "",
        });
        void this.hydrateCategoryPage(selectedCategoryId, mockState);
    },
    onShow() {
        if (!this.data.selectedCategoryId || this.data.mockState)
            return;
        void this.hydrateCategoryPage(this.data.selectedCategoryId);
    },
    onPullDownRefresh() {
        void this.hydrateCategoryPage(this.data.selectedCategoryId);
    },
    async hydrateCategoryPage(categoryId, override = null) {
        const browseService = (0, browse_1.createBrowseService)();
        const selectedCategoryId = categoryId ?? this.data.selectedCategoryId;
        try {
            const pageData = await browseService.getCategoryShellData(selectedCategoryId, (0, storage_1.getFavoriteIds)());
            const currentCategory = pageData.currentCategory;
            const pageSubtitle = currentCategory ? `${currentCategory.name} · ${pageData.subCategories.length} 个细分类目` : "选型";
            if (override === "loading") {
                this.setData({
                    status: "loading",
                    selectedCategoryId: pageData.selectedCategoryId,
                    rootCategories: pageData.rootCategories,
                    currentCategory: pageData.currentCategory,
                    pageSubtitle: currentCategory ? `${currentCategory.name} · 加载中` : "选型内容加载中",
                    searchPlaceholder: currentCategory?.searchHint ?? "建材 / 品牌 / 型号",
                });
                wx.stopPullDownRefresh();
                return;
            }
            if (override && override !== "ready") {
                this.setData({
                    status: override,
                    selectedCategoryId: pageData.selectedCategoryId,
                    rootCategories: pageData.rootCategories,
                    currentCategory: pageData.currentCategory,
                    subCategories: override === "empty" ? [] : pageData.subCategories,
                    categoryProducts: [],
                    pageSubtitle: currentCategory ? `${currentCategory.name} · 状态异常` : "选型状态异常",
                    searchPlaceholder: currentCategory?.searchHint ?? "建材 / 品牌 / 型号",
                });
                wx.stopPullDownRefresh();
                return;
            }
            this.setData({
                status: pageData.subCategories.length || pageData.categoryProducts.length ? "ready" : "empty",
                selectedCategoryId: pageData.selectedCategoryId,
                rootCategories: pageData.rootCategories,
                currentCategory: pageData.currentCategory,
                subCategories: pageData.subCategories,
                categoryProducts: pageData.categoryProducts,
                pageSubtitle,
                searchPlaceholder: currentCategory?.searchHint ?? "建材 / 品牌 / 型号",
            });
        }
        catch {
            this.setData({
                status: "error",
                subCategories: [],
                categoryProducts: [],
                pageSubtitle: "选型内容加载失败",
            });
        }
        finally {
            wx.stopPullDownRefresh();
        }
    },
    handleSearchTap() {
        const currentCategory = this.data.currentCategory;
        if (!currentCategory)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, {
            categoryId: currentCategory.id,
            keyword: currentCategory.searchHint,
        });
    },
    handleRootCategoryTap(event) {
        const { id } = event.currentTarget.dataset;
        if (!id || id === this.data.selectedCategoryId)
            return;
        this.setData({
            selectedCategoryId: id,
            mockState: "",
            status: "loading",
        });
        void this.hydrateCategoryPage(id);
    },
    handleSubCategoryTap(event) {
        const { categoryId, keyword } = event.currentTarget.dataset;
        if (!categoryId)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, {
            categoryId,
            keyword,
        });
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
        (0, storage_1.toggleFavoriteId)(id);
        void this.hydrateCategoryPage(this.data.selectedCategoryId);
    },
    handleOpenAllResults() {
        const currentCategory = this.data.currentCategory;
        if (!currentCategory)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.searchResult, {
            categoryId: currentCategory.id,
            keyword: currentCategory.searchHint,
        });
    },
    handleOpenArticle() {
        const currentCategory = this.data.currentCategory;
        if (!currentCategory)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.articleList, {
            category: currentCategory.articleCategory,
        });
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        void this.hydrateCategoryPage(this.data.selectedCategoryId);
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
});
