"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const trade_1 = require("../../mock/trade");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
const trade_2 = require("../../utils/trade");
Page({
    data: {
        title: "结算页",
        summary: "串联地址、发票、优惠券、备注和支付方式，是交易链路里最关键的状态汇聚页。",
        status: "loading",
        mockState: null,
        sourceLabel: "购物车结算",
        items: [],
        selectedAddress: null,
        addressText: "",
        selectedCoupon: null,
        recommendedCoupon: null,
        invoiceDraft: null,
        invoiceText: "",
        paymentMethods: trade_1.tradePaymentMethods,
        selectedPaymentMethod: "wechat",
        paymentResultMode: "success",
        submitMode: "normal",
        submitErrorText: "",
        remark: "",
        amountSummary: trade_2.EMPTY_CART_AMOUNT_SUMMARY,
        submitting: false,
    },
    onLoad(options) {
        const paymentResultMode = options.paymentResult === "failed" || options.paymentResult === "processing" || options.paymentResult === "success"
            ? options.paymentResult
            : "success";
        this.setData({
            mockState: (0, page_1.getPageStatusOverride)(options.state),
            paymentResultMode,
            submitMode: options.submitMode === "submit_failed" ? "submit_failed" : "normal",
        });
    },
    onShow() {
        this.hydrateCheckout(this.data.mockState);
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.cart);
            },
        });
    },
    hydrateCheckout(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
                items: [],
                amountSummary: trade_2.EMPTY_CART_AMOUNT_SUMMARY,
                selectedAddress: null,
                addressText: "",
                selectedCoupon: null,
                recommendedCoupon: null,
                invoiceDraft: null,
                invoiceText: "",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                items: [],
                amountSummary: trade_2.EMPTY_CART_AMOUNT_SUMMARY,
                selectedAddress: null,
                addressText: "",
                selectedCoupon: null,
                recommendedCoupon: null,
                invoiceDraft: null,
                invoiceText: "",
            });
            return;
        }
        try {
            const cartItems = (0, storage_1.getCartItems)();
            const draft = (0, storage_1.getCheckoutDraft)();
            const items = (0, trade_2.resolveCheckoutItems)(draft, cartItems).map((item) => ({
                ...item,
                checked: true,
            }));
            if (!items.length) {
                this.setData({
                    status: "empty",
                    items: [],
                    amountSummary: trade_2.EMPTY_CART_AMOUNT_SUMMARY,
                    selectedCoupon: null,
                    recommendedCoupon: null,
                });
                return;
            }
            const baseSummary = (0, trade_2.calculateCartAmountSummary)(items);
            const selectedAddress = (0, storage_1.getAddressById)(draft.selectedAddressId) ?? (0, storage_1.getDefaultAddress)();
            const selectedCoupon = (0, trade_1.getCouponById)(draft.selectedCouponId);
            const recommendedCoupon = (0, trade_1.getRecommendedCoupon)(baseSummary.subtotal);
            const invoiceDraft = draft.invoiceDraft ?? trade_1.defaultInvoiceDraft;
            if (!draft.selectedAddressId && selectedAddress) {
                (0, storage_1.patchCheckoutDraft)({ selectedAddressId: selectedAddress.id });
            }
            if (!draft.invoiceDraft) {
                (0, storage_1.patchCheckoutDraft)({ invoiceDraft });
            }
            this.setData({
                status: "ready",
                sourceLabel: draft.source === "buy_now" ? "立即购买" : "购物车结算",
                items,
                selectedAddress,
                addressText: selectedAddress ? (0, trade_2.formatAddressText)(selectedAddress) : "",
                selectedCoupon,
                recommendedCoupon,
                invoiceDraft,
                invoiceText: (0, trade_2.formatInvoiceText)(invoiceDraft),
                selectedPaymentMethod: draft.paymentMethod,
                remark: draft.remark,
                amountSummary: (0, trade_2.calculateCartAmountSummary)(items, selectedCoupon),
            });
        }
        catch {
            this.setData({
                status: "error",
            });
        }
    },
    handleRouteTap(event) {
        const { route } = event.currentTarget.dataset;
        if (!route)
            return;
        if (route === routes_1.ROUTES.addressList || route === routes_1.ROUTES.coupon || route === routes_1.ROUTES.invoice) {
            (0, navigate_1.navigateWithParams)(route, {
                scene: "checkout",
            });
            return;
        }
        (0, navigate_1.navigateToRoute)(route);
    },
    handleApplyRecommendedCoupon() {
        const coupon = this.data.recommendedCoupon;
        if (!coupon)
            return;
        (0, storage_1.patchCheckoutDraft)({ selectedCouponId: coupon.id });
        this.hydrateCheckout();
    },
    handleClearCoupon() {
        (0, storage_1.patchCheckoutDraft)({ selectedCouponId: null });
        this.hydrateCheckout();
    },
    handleRemarkInput(event) {
        const remark = event.detail.value;
        this.setData({ remark });
        (0, storage_1.patchCheckoutDraft)({ remark });
    },
    handlePaymentMethodTap(event) {
        const { code } = event.currentTarget.dataset;
        if (!code)
            return;
        this.setData({
            selectedPaymentMethod: code,
        });
        (0, storage_1.patchCheckoutDraft)({ paymentMethod: code });
    },
    handlePaymentResultModeTap(event) {
        const { mode } = event.currentTarget.dataset;
        if (!mode)
            return;
        this.setData({
            paymentResultMode: mode,
        });
    },
    handleSubmitModeTap(event) {
        const { mode } = event.currentTarget.dataset;
        if (!mode)
            return;
        this.setData({
            submitMode: mode,
            submitErrorText: "",
        });
    },
    handleBackCart() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.cart);
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleSubmitOrder() {
        if (this.data.submitting)
            return;
        if (!this.data.items.length) {
            wx.showToast({
                title: "当前没有可提交商品",
                icon: "none",
            });
            return;
        }
        if (!this.data.selectedAddress) {
            wx.showToast({
                title: "请先补充收货地址",
                icon: "none",
            });
            return;
        }
        if (this.data.submitMode === "submit_failed") {
            const submitErrorText = "本地已模拟提交失败，请核对地址、商品与支付信息后重试。";
            this.setData({
                submitErrorText,
            });
            wx.showToast({
                title: "提交订单失败",
                icon: "none",
            });
            return;
        }
        const draft = (0, storage_1.getCheckoutDraft)();
        const timestamp = Date.now();
        const orderId = `order-${timestamp}`;
        const orderNo = `CM${timestamp.toString().slice(-10)}`;
        const date = new Date(timestamp);
        const createdAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        this.setData({ submitting: true });
        (0, storage_1.prependOrder)({
            id: orderId,
            orderNo,
            status: "pending_payment",
            payStatus: this.data.paymentResultMode === "failed" ? "failed" : this.data.paymentResultMode === "processing" ? "paying" : "unpaid",
            items: this.data.items.map((item) => ({ ...item })),
            address: this.data.selectedAddress,
            coupon: this.data.selectedCoupon,
            invoiceInfo: this.data.invoiceDraft,
            remark: this.data.remark,
            paymentMethod: this.data.selectedPaymentMethod,
            amount: {
                ...this.data.amountSummary,
            },
            createdAt,
        });
        if (draft.source === "cart") {
            const itemIds = draft.selectedCartItemIds.length ? draft.selectedCartItemIds : this.data.items.map((item) => item.id);
            (0, storage_1.removeCartItems)(itemIds);
        }
        (0, storage_1.clearCheckoutDraft)();
        this.setData({
            submitting: false,
            submitErrorText: "",
        });
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.paymentResult, {
            status: this.data.paymentResultMode,
            orderNo,
            amount: this.data.amountSummary.payable,
            orderId,
            paymentMethod: this.data.selectedPaymentMethod,
        });
    },
    handleRetry() {
        this.setData({
            status: "loading",
            mockState: null,
            submitErrorText: "",
        });
        this.hydrateCheckout();
    },
});
