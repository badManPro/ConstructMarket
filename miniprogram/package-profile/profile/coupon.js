"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const trade_1 = require("../../mock/trade");
const navigate_1 = require("../../utils/navigate");
const trade_2 = require("../../utils/trade");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        scene: "profile",
        activeTab: "available",
        orderAmount: 0,
        selectedCouponId: "",
        availableCoupons: [],
        unavailableCoupons: [],
    },
    onLoad(options) {
        this.setData({
            scene: options.scene === "checkout" ? "checkout" : "profile",
        });
    },
    onShow() {
        this.hydrateCoupons();
    },
    hydrateCoupons() {
        const draft = (0, storage_1.getCheckoutDraft)();
        const checkoutItems = (0, trade_2.resolveCheckoutItems)(draft, (0, storage_1.getCartItems)()).map((item) => ({
            ...item,
            checked: true,
        }));
        const orderAmount = (0, trade_2.calculateCartAmountSummary)(checkoutItems).subtotal;
        const isCheckoutScene = this.data.scene === "checkout";
        const availableCoupons = trade_1.tradeCoupons
            .filter((item) => item.status === "available" && (!isCheckoutScene || orderAmount >= item.threshold))
            .map((item) => ({
            ...item,
            selected: draft.selectedCouponId === item.id,
            disabledReason: "",
        }));
        const unavailableCoupons = trade_1.tradeCoupons
            .filter((item) => item.status !== "available" || (isCheckoutScene && orderAmount < item.threshold))
            .map((item) => ({
            ...item,
            selected: false,
            disabledReason: item.status !== "available"
                ? "当前优惠券不可用或已过期"
                : `当前订单金额未达到 ¥${item.threshold} 使用门槛`,
        }));
        this.setData({
            orderAmount,
            selectedCouponId: draft.selectedCouponId ?? "",
            availableCoupons,
            unavailableCoupons,
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(this.data.scene === "checkout" ? routes_1.ROUTES.checkout : routes_1.ROUTES.profile);
            },
        });
    },
    handleTabTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        this.setData({
            activeTab: value,
        });
    },
    handleSelectCoupon(event) {
        if (this.data.scene !== "checkout") {
            wx.showToast({
                title: "请在结算页中使用优惠券",
                icon: "none",
            });
            return;
        }
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, storage_1.patchCheckoutDraft)({ selectedCouponId: id });
        wx.showToast({
            title: "优惠券已选择",
            icon: "success",
        });
        this.handleGoBack();
    },
    handleClearCoupon() {
        (0, storage_1.patchCheckoutDraft)({ selectedCouponId: null });
        wx.showToast({
            title: "已取消使用优惠券",
            icon: "success",
        });
        this.handleGoBack();
    },
});
