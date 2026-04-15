"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../mock/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        productId: "p-floor-001",
        product: null,
        recommendedProducts: [],
        selectedOptions: [],
        selectedSpecText: "请选择规格",
        quantity: 1,
        cartPreviewCount: 0,
        showSpecPopup: false,
    },
    onLoad(options) {
        const productId = typeof options.id === "string" ? options.id : "p-floor-001";
        this.setData({ productId });
        this.hydrateProductPage();
    },
    onShow() {
        this.hydrateProductPage();
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    hydrateProductPage() {
        const favoriteIds = (0, storage_1.getFavoriteIds)();
        const product = (0, browse_1.getProductDetail)(this.data.productId, favoriteIds);
        const quantity = this.data.quantity || product.minOrderQty;
        this.setData({
            product,
            quantity,
            recommendedProducts: (0, browse_1.getRecommendedProducts)(this.data.productId, favoriteIds),
            cartPreviewCount: (0, storage_1.getCartCount)(),
        });
    },
    openSpecPopup() {
        this.setData({ showSpecPopup: true });
    },
    closeSpecPopup() {
        this.setData({ showSpecPopup: false });
    },
    handleSpecConfirm(event) {
        const { selectedOptions, quantity, isComplete, selectedText } = event.detail ?? {};
        if (!isComplete) {
            wx.showToast({
                title: "请完整选择规格",
                icon: "none",
            });
            return;
        }
        this.setData({
            selectedOptions: selectedOptions ?? [],
            quantity: quantity ?? this.data.quantity,
            selectedSpecText: selectedText ?? "请选择规格",
            showSpecPopup: false,
        });
    },
    handleToggleFavorite() {
        if (!this.data.product)
            return;
        const favoriteIds = (0, storage_1.toggleFavoriteId)(this.data.product.id);
        const product = (0, browse_1.getProductDetail)(this.data.product.id, favoriteIds);
        this.setData({
            product,
            recommendedProducts: (0, browse_1.getRecommendedProducts)(this.data.product.id, favoriteIds),
        });
        wx.showToast({
            title: favoriteIds.includes(this.data.product.id) ? "已加入收藏" : "已取消收藏",
            icon: "none",
        });
    },
    ensureSpecSelected() {
        const product = this.data.product;
        if (!product)
            return false;
        if (this.data.selectedOptions.length < product.specGroups.length) {
            this.setData({ showSpecPopup: true });
            wx.showToast({
                title: "请先选择规格",
                icon: "none",
            });
            return false;
        }
        return true;
    },
    handleCustomerService() {
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.supportChat, {
            source: "product",
            productId: this.data.productId,
        });
    },
    handleAddToCart() {
        const product = this.data.product;
        if (!product || !this.ensureSpecSelected())
            return;
        const cartPreviewCount = (0, storage_1.addCartItem)({
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            skuId: `${product.skuId}-${this.data.selectedOptions.join("-")}`,
            name: product.name,
            cover: product.cover,
            model: this.data.selectedSpecText,
            price: product.price,
            unit: product.unit,
            quantity: this.data.quantity,
            minOrderQty: product.minOrderQty,
            checked: true,
            invalid: false,
        });
        this.setData({ cartPreviewCount });
        wx.showToast({
            title: "已加入购物车",
            icon: "success",
        });
    },
    handleBuyNow() {
        const product = this.data.product;
        if (!product || !this.ensureSpecSelected())
            return;
        (0, storage_1.patchCheckoutDraft)({
            source: "buy_now",
            selectedCartItemIds: [],
            buyNowItem: {
                id: `buy-now-${product.id}`,
                productId: product.id,
                skuId: `${product.skuId}-${this.data.selectedOptions.join("-")}`,
                name: product.name,
                cover: product.cover,
                model: this.data.selectedSpecText,
                price: product.price,
                unit: product.unit,
                quantity: this.data.quantity,
                minOrderQty: product.minOrderQty,
                checked: true,
                invalid: false,
            },
            selectedCouponId: null,
        });
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.checkout, {
            source: "buy_now",
            productId: this.data.productId,
        });
    },
    handleGoCart() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.cart);
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
        this.setData({
            recommendedProducts: (0, browse_1.getRecommendedProducts)(this.data.productId, favoriteIds),
        });
    },
});
