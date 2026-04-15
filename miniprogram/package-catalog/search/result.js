"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../mock/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        title: "搜索结果页",
        summary: "承接搜索词和类目条件，支持排序、筛选、更多类目抽屉和商品列表浏览。",
        inputKeyword: "",
        keyword: "",
        selectedCategoryId: "all",
        selectedSort: "default",
        relatedCategories: browse_1.relatedCategories,
        sortOptions: browse_1.sortOptions,
        filterState: browse_1.defaultSearchFilterState,
        priceOptions: browse_1.priceFilterOptions,
        quantityOptions: browse_1.minOrderFilterOptions,
        materialOptions: browse_1.materialFilterOptions,
        productList: [],
        resultCount: 0,
        showCategoryDrawer: false,
        showFilterDrawer: false,
    },
    onLoad(options) {
        const keyword = typeof options.keyword === "string" ? decodeURIComponent(options.keyword) : "";
        const categoryId = typeof options.categoryId === "string" ? options.categoryId : "all";
        this.setData({
            inputKeyword: keyword,
            keyword,
            selectedCategoryId: categoryId,
        });
        this.refreshProductList();
    },
    onShow() {
        this.refreshProductList();
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    refreshProductList() {
        const productList = (0, browse_1.searchProducts)({
            keyword: this.data.keyword,
            categoryId: this.data.selectedCategoryId,
            sortOption: this.data.selectedSort,
            filterState: this.data.filterState,
            favoriteIds: (0, storage_1.getFavoriteIds)(),
        });
        this.setData({
            productList,
            resultCount: productList.length,
        });
    },
    handleKeywordInput(event) {
        this.setData({
            inputKeyword: event.detail.value,
        });
    },
    handleSearchConfirm() {
        this.setData({
            keyword: this.data.inputKeyword.trim(),
        });
        this.refreshProductList();
    },
    handleCategoryTap(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        this.setData({
            selectedCategoryId: id,
            showCategoryDrawer: false,
        });
        this.refreshProductList();
    },
    handleSortTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        this.setData({
            selectedSort: value,
        });
        this.refreshProductList();
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
        });
        this.refreshProductList();
    },
    handleFilterReset() {
        this.setData({
            filterState: { ...browse_1.defaultSearchFilterState },
        });
        this.refreshProductList();
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
        const productList = (0, browse_1.searchProducts)({
            keyword: this.data.keyword,
            categoryId: this.data.selectedCategoryId,
            sortOption: this.data.selectedSort,
            filterState: this.data.filterState,
            favoriteIds,
        });
        this.setData({
            productList,
            resultCount: productList.length,
        });
    },
    resetSearch() {
        this.setData({
            inputKeyword: "",
            keyword: "",
            selectedCategoryId: "all",
            selectedSort: "default",
            filterState: { ...browse_1.defaultSearchFilterState },
        });
        this.refreshProductList();
    },
    goHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    goCategoryPage() {
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.category, {
            categoryId: this.data.selectedCategoryId === "all" ? undefined : this.data.selectedCategoryId,
        });
    },
});
