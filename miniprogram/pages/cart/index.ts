import { ROUTES } from "../../constants/routes";
import type { CartAmountSummary, CartItem } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import {
  clearInvalidCartItems,
  getCartItems,
  patchCheckoutDraft,
  removeCartItem,
  setCartItemChecked,
  toggleAllCartItems,
  updateCartItemQuantity,
} from "../../utils/storage";
import {
  calculateCartAmountSummary,
  EMPTY_CART_AMOUNT_SUMMARY,
  getSelectedCartItemIds,
  splitCartItems,
} from "../../utils/trade";

Page({
  data: {
    title: "购物车",
    summary: "集中管理待下单商品，先打通本地加购、勾选、数量修改和结算入口。",
    status: "loading" as PageStatus,
    mockState: null as PageStatus | null,
    validItems: [] as CartItem[],
    invalidItems: [] as CartItem[],
    amountSummary: EMPTY_CART_AMOUNT_SUMMARY as CartAmountSummary,
    allChecked: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      mockState: getPageStatusOverride(options.state),
    });
  },
  onShow() {
    this.hydrateCart(this.data.mockState);
  },
  hydrateCart(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
        validItems: [],
        invalidItems: [],
        amountSummary: EMPTY_CART_AMOUNT_SUMMARY,
        allChecked: false,
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        validItems: [],
        invalidItems: [],
        amountSummary: EMPTY_CART_AMOUNT_SUMMARY,
        allChecked: false,
      });
      return;
    }

    try {
      const items = getCartItems();
      const { validItems, invalidItems } = splitCartItems(items);
      const amountSummary = calculateCartAmountSummary(items);

      this.setData({
        validItems,
        invalidItems,
        amountSummary,
        allChecked: validItems.length > 0 && validItems.every((item) => item.checked),
        status: items.length > 0 ? "ready" : "empty",
      });
    } catch {
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
    navigateToRoute(ROUTES.home);
  },
  handleProductTap(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;
    navigateWithParams(ROUTES.productDetail, { id });
  },
  handleToggleItem(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const current = this.data.validItems.find((item) => item.id === id);
    if (!current) return;

    setCartItemChecked(id, !current.checked);
    this.hydrateCart();
  },
  handleToggleAll() {
    toggleAllCartItems(!this.data.allChecked);
    this.hydrateCart();
  },
  changeQuantity(event: WechatMiniprogram.Event, delta: number) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const current = this.data.validItems.find((item) => item.id === id);
    if (!current) return;

    const nextQuantity = current.quantity + delta;
    if (nextQuantity < current.minOrderQty) {
      wx.showToast({
        title: `起订量为 ${current.minOrderQty}${current.unit}`,
        icon: "none",
      });
      return;
    }

    updateCartItemQuantity(id, nextQuantity);
    this.hydrateCart();
  },
  handleDecrease(event: WechatMiniprogram.Event) {
    this.changeQuantity(event, -1);
  },
  handleIncrease(event: WechatMiniprogram.Event) {
    this.changeQuantity(event, 1);
  },
  handleDelete(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    wx.showModal({
      title: "删除商品",
      content: "确认把当前商品从购物车移除吗？",
      success: ({ confirm }) => {
        if (!confirm) return;
        removeCartItem(id);
        this.hydrateCart();
      },
    });
  },
  handleClearInvalid() {
    wx.showModal({
      title: "清空失效商品",
      content: "确认移除所有失效商品吗？",
      success: ({ confirm }) => {
        if (!confirm) return;
        clearInvalidCartItems();
        this.hydrateCart();
      },
    });
  },
  handleCheckout() {
    const selectedItemIds = getSelectedCartItemIds(getCartItems());
    if (!selectedItemIds.length) {
      wx.showToast({
        title: "请先勾选待结算商品",
        icon: "none",
      });
      return;
    }

    patchCheckoutDraft({
      source: "cart",
      selectedCartItemIds: selectedItemIds,
      buyNowItem: null,
    });

    navigateWithParams(ROUTES.checkout, { source: "cart" });
  },
});
