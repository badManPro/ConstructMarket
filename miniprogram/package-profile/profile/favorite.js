"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../services/browse");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        status: "loading",
        mockState: "",
        cartPreviewCount: 0,
        favorites: [],
    },
    onLoad(options) {
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            mockState: mockState ?? "",
        });
        this.hydrateFavorites(mockState);
    },
    onShow() {
        if (!this.data.mockState) {
            this.hydrateFavorites();
        }
    },
    async hydrateFavorites(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                favorites: [],
                cartPreviewCount: (0, storage_1.getCartCount)(),
            });
            return;
        }
        try {
            const favorites = (await (0, browse_1.createBrowseService)().getFavoriteShellData()).favoriteProducts;
            this.setData({
                status: favorites.length ? "ready" : "empty",
                favorites,
                cartPreviewCount: (0, storage_1.getCartCount)(),
            });
        }
        catch {
            this.setData({
                status: "error",
                favorites: [],
                cartPreviewCount: (0, storage_1.getCartCount)(),
            });
        }
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.profile);
            },
        });
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleGoCart() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.cart);
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        this.hydrateFavorites();
    },
    handleOpenDetail(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.productDetail, {
            id,
        });
    },
    async handleToggleFavorite(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const product = this.data.favorites.find((item) => item.id === id);
        if (!product)
            return;
        try {
            await (0, browse_1.createBrowseService)().toggleProductFavorite(id, product.isFavorite);
            await this.hydrateFavorites();
            wx.showToast({
                title: "已取消收藏",
                icon: "none",
            });
        }
        catch {
            wx.showToast({
                title: "取消收藏失败",
                icon: "none",
            });
        }
    },
    async handleQuickAdd(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const product = this.data.favorites.find((item) => item.id === id);
        if (!product)
            return;
        try {
            const result = await (0, browse_1.createBrowseService)().addProductToCart({
                product,
                quantity: product.minOrderQty,
                selectedSkuCode: product.skuId,
                selectedSpecText: product.specText || product.model,
            });
            this.setData({
                cartPreviewCount: result.cartPreviewCount,
            });
            wx.showToast({
                title: "已加入购物车",
                icon: "success",
            });
        }
        catch {
            wx.showToast({
                title: "加购失败",
                icon: "none",
            });
        }
    },
});
