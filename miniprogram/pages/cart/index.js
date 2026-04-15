"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
const trade_1 = require("../../utils/trade");
Page({
    data: {
        title: "购物车",
        summary: "集中管理待下单商品，先打通本地加购、勾选、数量修改和结算入口。",
        status: "loading",
        mockState: null,
        validItems: [],
        invalidItems: [],
        amountSummary: trade_1.EMPTY_CART_AMOUNT_SUMMARY,
        allChecked: false,
    },
    onLoad(options) {
        this.setData({
            mockState: (0, page_1.getPageStatusOverride)(options.state),
        });
    },
    onShow() {
        this.hydrateCart(this.data.mockState);
    },
    hydrateCart(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
                validItems: [],
                invalidItems: [],
                amountSummary: trade_1.EMPTY_CART_AMOUNT_SUMMARY,
                allChecked: false,
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                validItems: [],
                invalidItems: [],
                amountSummary: trade_1.EMPTY_CART_AMOUNT_SUMMARY,
                allChecked: false,
            });
            return;
        }
        try {
            const items = (0, storage_1.getCartItems)();
            const { validItems, invalidItems } = (0, trade_1.splitCartItems)(items);
            const amountSummary = (0, trade_1.calculateCartAmountSummary)(items);
            this.setData({
                validItems,
                invalidItems,
                amountSummary,
                allChecked: validItems.length > 0 && validItems.every((item) => item.checked),
                status: items.length > 0 ? "ready" : "empty",
            });
        }
        catch {
            this.setData({
                status: "error",
            });
        }
    },
    handleRetry() {
        this.setData({
            status: "loading",
            mockState: null,
        });
        this.hydrateCart();
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleProductTap(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.productDetail, { id });
    },
    handleToggleItem(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const current = this.data.validItems.find((item) => item.id === id);
        if (!current)
            return;
        (0, storage_1.setCartItemChecked)(id, !current.checked);
        this.hydrateCart();
    },
    handleToggleAll() {
        (0, storage_1.toggleAllCartItems)(!this.data.allChecked);
        this.hydrateCart();
    },
    changeQuantity(event, delta) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const current = this.data.validItems.find((item) => item.id === id);
        if (!current)
            return;
        const nextQuantity = current.quantity + delta;
        if (nextQuantity < current.minOrderQty) {
            wx.showToast({
                title: `起订量为 ${current.minOrderQty}${current.unit}`,
                icon: "none",
            });
            return;
        }
        (0, storage_1.updateCartItemQuantity)(id, nextQuantity);
        this.hydrateCart();
    },
    handleDecrease(event) {
        this.changeQuantity(event, -1);
    },
    handleIncrease(event) {
        this.changeQuantity(event, 1);
    },
    handleDelete(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        wx.showModal({
            title: "删除商品",
            content: "确认把当前商品从购物车移除吗？",
            success: ({ confirm }) => {
                if (!confirm)
                    return;
                (0, storage_1.removeCartItem)(id);
                this.hydrateCart();
            },
        });
    },
    handleClearInvalid() {
        wx.showModal({
            title: "清空失效商品",
            content: "确认移除所有失效商品吗？",
            success: ({ confirm }) => {
                if (!confirm)
                    return;
                (0, storage_1.clearInvalidCartItems)();
                this.hydrateCart();
            },
        });
    },
    handleCheckout() {
        const selectedItemIds = (0, trade_1.getSelectedCartItemIds)((0, storage_1.getCartItems)());
        if (!selectedItemIds.length) {
            wx.showToast({
                title: "请先勾选待结算商品",
                icon: "none",
            });
            return;
        }
        (0, storage_1.patchCheckoutDraft)({
            source: "cart",
            selectedCartItemIds: selectedItemIds,
            buyNowItem: null,
        });
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.checkout, { source: "cart" });
    },
});
