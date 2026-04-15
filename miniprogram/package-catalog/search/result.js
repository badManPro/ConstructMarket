"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../mock/browse");
const browse_2 = require("../../services/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
const page_1 = require("../../utils/page");
function countCategories(baseCategories, productList) {
    return baseCategories.map((item) => ({
        ...item,
        count: item.id === "all" ? productList.length : productList.filter((product) => product.categoryId === item.id).length,
    }));
}
Page({
    data: {
        status: "loading",
        mockState: "",
        title: "搜索结果页",
        summary: "承接搜索词和类目条件，支持排序、筛选、更多类目抽屉和商品列表浏览。",
        inputKeyword: "",
        keyword: "",
        selectedCategoryId: "all",
        selectedSort: "default",
        relatedCategories: [],
        sortOptions: [],
        filterState: { ...browse_1.defaultSearchFilterState },
        priceOptions: [],
        quantityOptions: [],
        materialOptions: [],
        productList: [],
        resultCount: 0,
        showCategoryDrawer: false,
        showFilterDrawer: false,
    },
    onLoad(options) {
        const keyword = typeof options.keyword === "string" ? decodeURIComponent(options.keyword) : "";
        const categoryId = typeof options.categoryId === "string" ? options.categoryId : "all";
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            inputKeyword: keyword,
            keyword,
            selectedCategoryId: categoryId,
            mockState: mockState ?? "",
        });
        void this.hydrateSearchPage(mockState);
    },
    onShow() {
        if (this.data.mockState)
            return;
        if (!this.data.relatedCategories.length || !this.data.sortOptions.length) {
            void this.hydrateSearchPage();
            return;
        }
        void this.refreshProductList();
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    async hydrateSearchPage(override = null) {
        const browseService = (0, browse_2.createBrowseService)();
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        try {
            const shell = await browseService.getSearchFilterShell();
            const selectedCategoryId = this.data.selectedCategoryId && this.data.selectedCategoryId !== "all"
                ? this.data.selectedCategoryId
                : shell.relatedCategories[0]?.id ?? "all";
            const selectedSort = shell.sortOptions.some((item) => item.value === this.data.selectedSort)
                ? this.data.selectedSort
                : shell.sortOptions[0]?.value ?? "default";
            if (override && override !== "ready") {
                this.setData({
                    status: override,
                    relatedCategories: shell.relatedCategories,
                    sortOptions: shell.sortOptions,
                    priceOptions: shell.priceOptions,
                    quantityOptions: shell.quantityOptions,
                    materialOptions: shell.materialOptions,
                    selectedCategoryId,
                    selectedSort,
                    filterState: this.data.filterState,
                    productList: [],
                    resultCount: 0,
                });
                return;
            }
            this.setData({
                relatedCategories: shell.relatedCategories,
                sortOptions: shell.sortOptions,
                priceOptions: shell.priceOptions,
                quantityOptions: shell.quantityOptions,
                materialOptions: shell.materialOptions,
                selectedCategoryId,
                selectedSort,
            });
            await this.refreshProductList({
                relatedCategories: shell.relatedCategories,
                selectedCategoryId,
                selectedSort,
            });
        }
        catch {
            this.setData({
                status: "error",
                productList: [],
                resultCount: 0,
            });
        }
    },
    async refreshProductList(options = {}) {
        try {
            const keyword = options.keyword ?? this.data.keyword;
            const selectedCategoryId = options.selectedCategoryId ?? this.data.selectedCategoryId;
            const selectedSort = options.selectedSort ?? this.data.selectedSort;
            const filterState = options.filterState ?? this.data.filterState;
            const result = await (0, browse_2.createBrowseService)().searchProductsPage({
                keyword,
                categoryId: selectedCategoryId,
                sortOption: selectedSort,
                filterState,
                favoriteIds: (0, storage_1.getFavoriteIds)(),
            });
            const baseCategories = options.relatedCategories ?? this.data.relatedCategories;
            const relatedCategories = countCategories(baseCategories, result.productList);
            this.setData({
                status: result.productList.length ? "ready" : "empty",
                productList: result.productList,
                resultCount: result.productList.length,
                relatedCategories,
            });
        }
        catch {
            this.setData({
                status: "error",
                productList: [],
                resultCount: 0,
            });
        }
    },
    handleKeywordInput(event) {
        this.setData({
            inputKeyword: event.detail.value,
        });
    },
    handleSearchConfirm() {
        const keyword = this.data.inputKeyword.trim();
        this.setData({
            keyword,
            status: "loading",
        });
        void this.refreshProductList({ keyword });
    },
    handleCategoryTap(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        this.setData({
            selectedCategoryId: id,
            showCategoryDrawer: false,
            status: "loading",
        });
        void this.refreshProductList({ selectedCategoryId: id });
    },
    handleSortTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        this.setData({
            selectedSort: value,
            status: "loading",
        });
        void this.refreshProductList({ selectedSort: value });
    },
    openCategoryDrawer() {
        this.setData({ showCategoryDrawer: true });
    },
    closeCategoryDrawer() {
        this.setData({ showCategoryDrawer: false });
    },
    openFilterDrawer() {
        this.setData({ showFilterDrawer: true });
    },
    closeFilterDrawer() {
        this.setData({ showFilterDrawer: false });
    },
    handleFilterApply(event) {
        const nextFilter = event.detail?.value;
        if (!nextFilter)
            return;
        this.setData({
            filterState: nextFilter,
            showFilterDrawer: false,
            status: "loading",
        });
        void this.refreshProductList({ filterState: nextFilter });
    },
    handleFilterReset() {
        const nextFilter = { ...browse_1.defaultSearchFilterState };
        this.setData({
            filterState: nextFilter,
            status: "loading",
        });
        void this.refreshProductList({ filterState: nextFilter });
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
        void this.refreshProductList();
    },
    resetSearch() {
        const nextCategoryId = this.data.relatedCategories[0]?.id ?? "all";
        const nextFilter = { ...browse_1.defaultSearchFilterState };
        this.setData({
            inputKeyword: "",
            keyword: "",
            selectedCategoryId: nextCategoryId,
            selectedSort: "default",
            filterState: nextFilter,
            status: "loading",
        });
        void this.refreshProductList({
            keyword: "",
            selectedCategoryId: nextCategoryId,
            selectedSort: "default",
            filterState: nextFilter,
        });
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        void this.hydrateSearchPage();
    },
    goHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    goCategoryPage() {
        const currentCategory = this.data.relatedCategories.find((item) => item.id === this.data.selectedCategoryId);
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.category, {
            categoryId: this.data.selectedCategoryId === "all"
                ? undefined
                : currentCategory?.parentId ?? this.data.selectedCategoryId,
        });
    },
});
