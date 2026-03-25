import { ROUTES } from "../../constants/routes";
import {
  defaultInvoiceDraft,
  getCouponById,
  getRecommendedCoupon,
  tradePaymentMethods,
} from "../../mock/trade";
import type { Address, CartAmountSummary, CartItem, Coupon, InvoiceDraft, PaymentResultStatus } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import {
  clearCheckoutDraft,
  getAddressById,
  getCartItems,
  getCheckoutDraft,
  getDefaultAddress,
  patchCheckoutDraft,
  prependOrder,
  removeCartItems,
} from "../../utils/storage";
import {
  calculateCartAmountSummary,
  EMPTY_CART_AMOUNT_SUMMARY,
  formatAddressText,
  formatInvoiceText,
  resolveCheckoutItems,
} from "../../utils/trade";

type SubmitMode = "normal" | "submit_failed";

Page({
  data: {
    title: "结算页",
    summary: "串联地址、发票、优惠券、备注和支付方式，是交易链路里最关键的状态汇聚页。",
    status: "loading" as PageStatus,
    mockState: null as PageStatus | null,
    sourceLabel: "购物车结算",
    items: [] as CartItem[],
    selectedAddress: null as Address | null,
    addressText: "",
    selectedCoupon: null as Coupon | null,
    recommendedCoupon: null as Coupon | null,
    invoiceDraft: null as InvoiceDraft | null,
    invoiceText: "",
    paymentMethods: tradePaymentMethods,
    selectedPaymentMethod: "wechat",
    paymentResultMode: "success" as PaymentResultStatus,
    submitMode: "normal" as SubmitMode,
    submitErrorText: "",
    remark: "",
    amountSummary: EMPTY_CART_AMOUNT_SUMMARY as CartAmountSummary,
    submitting: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const paymentResultMode =
      options.paymentResult === "failed" || options.paymentResult === "processing" || options.paymentResult === "success"
        ? options.paymentResult
        : "success";

    this.setData({
      mockState: getPageStatusOverride(options.state),
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
        navigateToRoute(ROUTES.cart);
      },
    });
  },
  hydrateCheckout(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
        items: [],
        amountSummary: EMPTY_CART_AMOUNT_SUMMARY,
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
        amountSummary: EMPTY_CART_AMOUNT_SUMMARY,
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
      const cartItems = getCartItems();
      const draft = getCheckoutDraft();
      const items = resolveCheckoutItems(draft, cartItems).map((item) => ({
        ...item,
        checked: true,
      }));

      if (!items.length) {
        this.setData({
          status: "empty",
          items: [],
          amountSummary: EMPTY_CART_AMOUNT_SUMMARY,
          selectedCoupon: null,
          recommendedCoupon: null,
        });
        return;
      }

      const baseSummary = calculateCartAmountSummary(items);
      const selectedAddress = getAddressById(draft.selectedAddressId) ?? getDefaultAddress();
      const selectedCoupon = getCouponById(draft.selectedCouponId);
      const recommendedCoupon = getRecommendedCoupon(baseSummary.subtotal);
      const invoiceDraft = draft.invoiceDraft ?? defaultInvoiceDraft;

      if (!draft.selectedAddressId && selectedAddress) {
        patchCheckoutDraft({ selectedAddressId: selectedAddress.id });
      }

      if (!draft.invoiceDraft) {
        patchCheckoutDraft({ invoiceDraft });
      }

      this.setData({
        status: "ready",
        sourceLabel: draft.source === "buy_now" ? "立即购买" : "购物车结算",
        items,
        selectedAddress,
        addressText: selectedAddress ? formatAddressText(selectedAddress) : "",
        selectedCoupon,
        recommendedCoupon,
        invoiceDraft,
        invoiceText: formatInvoiceText(invoiceDraft),
        selectedPaymentMethod: draft.paymentMethod,
        remark: draft.remark,
        amountSummary: calculateCartAmountSummary(items, selectedCoupon),
      });
    } catch {
      this.setData({
        status: "error",
      });
    }
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;

    if (route === ROUTES.addressList || route === ROUTES.coupon || route === ROUTES.invoice) {
      navigateWithParams(route, {
        scene: "checkout",
      });
      return;
    }

    navigateToRoute(route);
  },
  handleApplyRecommendedCoupon() {
    const coupon = this.data.recommendedCoupon;
    if (!coupon) return;
    patchCheckoutDraft({ selectedCouponId: coupon.id });
    this.hydrateCheckout();
  },
  handleClearCoupon() {
    patchCheckoutDraft({ selectedCouponId: null });
    this.hydrateCheckout();
  },
  handleRemarkInput(event: WechatMiniprogram.InputEvent) {
    const remark = event.detail.value;
    this.setData({ remark });
    patchCheckoutDraft({ remark });
  },
  handlePaymentMethodTap(event: WechatMiniprogram.Event) {
    const { code } = event.currentTarget.dataset as { code?: "wechat" | "alipay" | "unionpay" };
    if (!code) return;

    this.setData({
      selectedPaymentMethod: code,
    });
    patchCheckoutDraft({ paymentMethod: code });
  },
  handlePaymentResultModeTap(event: WechatMiniprogram.Event) {
    const { mode } = event.currentTarget.dataset as { mode?: PaymentResultStatus };
    if (!mode) return;

    this.setData({
      paymentResultMode: mode,
    });
  },
  handleSubmitModeTap(event: WechatMiniprogram.Event) {
    const { mode } = event.currentTarget.dataset as { mode?: SubmitMode };
    if (!mode) return;

    this.setData({
      submitMode: mode,
      submitErrorText: "",
    });
  },
  handleBackCart() {
    navigateToRoute(ROUTES.cart);
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleSubmitOrder() {
    if (this.data.submitting) return;
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

    const draft = getCheckoutDraft();
    const timestamp = Date.now();
    const orderId = `order-${timestamp}`;
    const orderNo = `CM${timestamp.toString().slice(-10)}`;
    const date = new Date(timestamp);
    const createdAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    this.setData({ submitting: true });

    prependOrder({
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
      removeCartItems(itemIds);
    }

    clearCheckoutDraft();
    this.setData({
      submitting: false,
      submitErrorText: "",
    });

    navigateWithParams(ROUTES.paymentResult, {
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
