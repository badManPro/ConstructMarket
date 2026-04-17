"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const browse_1 = require("../../services/browse");
const navigate_1 = require("../../utils/navigate");
const storage_1 = require("../../utils/storage");
function findMatchedSkuCode(product, selectedOptions) {
    const skuOptions = product.skuOptions ?? [];
    const normalizedOptions = selectedOptions.filter(Boolean);
    if (!skuOptions.length || !normalizedOptions.length) {
        return product.skuId;
    }
    const matched = skuOptions.find((item) => item.optionValues.length === normalizedOptions.length &&
        item.optionValues.every((value, index) => value === normalizedOptions[index]));
    return matched?.skuCode ?? skuOptions[0]?.skuCode ?? product.skuId;
}
Page({
    data: {
        status: "loading",
        productId: "p-floor-001",
        product: null,
        recommendedProducts: [],
        selectedOptions: [],
        selectedSkuCode: "",
        selectedSpecText: "请选择规格",
        quantity: 1,
        cartPreviewCount: 0,
        showSpecPopup: false,
    },
    onLoad(options) {
        const productId = typeof options.id === "string" ? options.id : "p-floor-001";
        this.setData({ productId });
        void this.hydrateProductPage();
        void this.recordBrowseLog(productId);
    },
    onShow() {
        void this.hydrateProductPage();
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    async hydrateProductPage() {
        this.setData({
            status: "loading",
        });
        try {
            const pageData = await (0, browse_1.createBrowseService)().getProductPageData(this.data.productId);
            const product = pageData.product;
            const quantity = this.data.quantity || product.minOrderQty;
            this.setData({
                status: "ready",
                product,
                quantity,
                selectedOptions: [],
                selectedSkuCode: "",
                selectedSpecText: product.selectedSpecText,
                recommendedProducts: pageData.recommendedProducts,
                cartPreviewCount: (0, storage_1.getCartCount)(),
            });
        }
        catch {
            this.setData({
                status: "error",
                product: null,
                recommendedProducts: [],
            });
        }
    },
    async recordBrowseLog(productId) {
        try {
            await (0, browse_1.createBrowseService)().recordProductBrowse(productId);
        }
        catch {
            // 浏览埋点失败不阻断详情页展示。
        }
    },
    openSpecPopup() {
        this.setData({ showSpecPopup: true });
    },
    closeSpecPopup() {
        this.setData({ showSpecPopup: false });
    },
    handleSpecConfirm(event) {
        const product = this.data.product;
        const { selectedOptions, quantity, isComplete, selectedText } = event.detail ?? {};
        if (!product || !isComplete) {
            wx.showToast({
                title: "请完整选择规格",
                icon: "none",
            });
            return;
        }
        const nextSelectedOptions = selectedOptions ?? [];
        const matchedSkuCode = findMatchedSkuCode(product, nextSelectedOptions);
        this.setData({
            selectedOptions: nextSelectedOptions,
            selectedSkuCode: matchedSkuCode,
            quantity: quantity ?? this.data.quantity,
            selectedSpecText: selectedText ?? "请选择规格",
            showSpecPopup: false,
        });
    },
    async handleToggleFavorite() {
        const product = this.data.product;
        if (!product)
            return;
        try {
            const result = await (0, browse_1.createBrowseService)().toggleProductFavorite(product.id, product.isFavorite);
            this.setData({
                product: {
                    ...product,
                    isFavorite: result.nextIsFavorite,
                },
            });
            wx.showToast({
                title: result.nextIsFavorite ? "已加入收藏" : "已取消收藏",
                icon: "none",
            });
        }
        catch {
            wx.showToast({
                title: "收藏操作失败",
                icon: "none",
            });
        }
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
    async handleAddToCart() {
        const product = this.data.product;
        if (!product || !this.ensureSpecSelected())
            return;
        try {
            const selectedSkuCode = this.data.selectedSkuCode || findMatchedSkuCode(product, this.data.selectedOptions);
            const result = await (0, browse_1.createBrowseService)().addProductToCart({
                product,
                quantity: this.data.quantity,
                selectedSkuCode,
                selectedSpecText: this.data.selectedSpecText,
            });
            this.setData({ cartPreviewCount: result.cartPreviewCount });
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
                skuId: this.data.selectedSkuCode || findMatchedSkuCode(product, this.data.selectedOptions),
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
    async handleFavoriteTap(event) {
        const { id } = event.detail ?? {};
        if (!id)
            return;
        const currentProduct = this.data.recommendedProducts.find((item) => item.id === id);
        if (!currentProduct)
            return;
        try {
            const result = await (0, browse_1.createBrowseService)().toggleProductFavorite(id, currentProduct.isFavorite);
            this.setData({
                recommendedProducts: this.data.recommendedProducts.map((item) => item.id === id
                    ? {
                        ...item,
                        isFavorite: result.nextIsFavorite,
                    }
                    : item),
            });
            wx.showToast({
                title: result.nextIsFavorite ? "已加入收藏" : "已取消收藏",
                icon: "none",
            });
        }
        catch {
            wx.showToast({
                title: "收藏操作失败",
                icon: "none",
            });
        }
    },
    handleRetry() {
        void this.hydrateProductPage();
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
});
