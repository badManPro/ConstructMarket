import { ROUTES } from "../../constants/routes";
import { tradeCoupons } from "../../mock/trade";
import type { Coupon } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { calculateCartAmountSummary, resolveCheckoutItems } from "../../utils/trade";
import { getCartItems, getCheckoutDraft, patchCheckoutDraft } from "../../utils/storage";

type CouponView = Coupon & {
  selected: boolean;
  disabledReason: string;
};

Page({
  data: {
    scene: "profile",
    activeTab: "available",
    orderAmount: 0,
    selectedCouponId: "",
    availableCoupons: [] as CouponView[],
    unavailableCoupons: [] as CouponView[],
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      scene: options.scene === "checkout" ? "checkout" : "profile",
    });
  },
  onShow() {
    this.hydrateCoupons();
  },
  hydrateCoupons() {
    const draft = getCheckoutDraft();
    const checkoutItems = resolveCheckoutItems(draft, getCartItems()).map((item) => ({
      ...item,
      checked: true,
    }));
    const orderAmount = calculateCartAmountSummary(checkoutItems).subtotal;
    const isCheckoutScene = this.data.scene === "checkout";

    const availableCoupons = tradeCoupons
      .filter((item) => item.status === "available" && (!isCheckoutScene || orderAmount >= item.threshold))
      .map((item) => ({
        ...item,
        selected: draft.selectedCouponId === item.id,
        disabledReason: "",
      }));

    const unavailableCoupons = tradeCoupons
      .filter((item) => item.status !== "available" || (isCheckoutScene && orderAmount < item.threshold))
      .map((item) => ({
        ...item,
        selected: false,
        disabledReason:
          item.status !== "available"
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
        navigateToRoute(this.data.scene === "checkout" ? ROUTES.checkout : ROUTES.profile);
      },
    });
  },
  handleTabTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: "available" | "unavailable" };
    if (!value) return;
    this.setData({
      activeTab: value,
    });
  },
  handleSelectCoupon(event: WechatMiniprogram.Event) {
    if (this.data.scene !== "checkout") {
      wx.showToast({
        title: "请在结算页中使用优惠券",
        icon: "none",
      });
      return;
    }

    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    patchCheckoutDraft({ selectedCouponId: id });
    wx.showToast({
      title: "优惠券已选择",
      icon: "success",
    });
    this.handleGoBack();
  },
  handleClearCoupon() {
    patchCheckoutDraft({ selectedCouponId: null });
    wx.showToast({
      title: "已取消使用优惠券",
      icon: "success",
    });
    this.handleGoBack();
  },
});
