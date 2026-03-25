import { ROUTES } from "../../constants/routes";
import {
  defaultInvoiceDraft,
  getAddressById,
  getCouponById,
  getDefaultAddress,
  getRecommendedCoupon,
  tradePaymentMethods,
} from "../../mock/trade";
import type { Address, CartAmountSummary, CartItem, Coupon, InvoiceDraft } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { clearCheckoutDraft, getCartItems, getCheckoutDraft, patchCheckoutDraft, removeCartItems } from "../../utils/storage";
import {
  calculateCartAmountSummary,
  EMPTY_CART_AMOUNT_SUMMARY,
  formatAddressText,
  formatInvoiceText,
  resolveCheckoutItems,
} from "../../utils/trade";

type CheckoutStatus = "loading" | "ready" | "empty" | "error";

Page({
  data: {
    title: "结算页",
    summary: "串联地址、发票、优惠券、备注和支付方式，是交易链路里最关键的状态汇聚页。",
    status: "loading" as CheckoutStatus,
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
    remark: "",
    amountSummary: EMPTY_CART_AMOUNT_SUMMARY as CartAmountSummary,
    submitting: false,
  },
  onShow() {
    this.hydrateCheckout();
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.cart);
      },
    });
  },
  hydrateCheckout() {
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

    const draft = getCheckoutDraft();
    const orderNo = `CM${Date.now().toString().slice(-10)}`;

    this.setData({ submitting: true });

    if (draft.source === "cart") {
      const itemIds = draft.selectedCartItemIds.length ? draft.selectedCartItemIds : this.data.items.map((item) => item.id);
      removeCartItems(itemIds);
    }

    clearCheckoutDraft();
    this.setData({ submitting: false });

    navigateWithParams(ROUTES.paymentResult, {
      status: "success",
      orderNo,
      amount: this.data.amountSummary.payable,
    });
  },
});
