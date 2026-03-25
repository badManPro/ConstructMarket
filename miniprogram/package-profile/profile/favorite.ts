import { ROUTES } from "../../constants/routes";
import { getFavoriteProducts } from "../../mock/browse";
import type { SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import { addCartItem, getCartCount, getFavoriteIds, toggleFavoriteId } from "../../utils/storage";

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    cartPreviewCount: 0,
    favorites: [] as SearchProduct[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const mockState = getPageStatusOverride(options.state);

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
  hydrateFavorites(override: PageStatus | null = null) {
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
        cartPreviewCount: getCartCount(),
      });
      return;
    }

    try {
      const favorites = getFavoriteProducts(getFavoriteIds());

      this.setData({
        status: favorites.length ? "ready" : "empty",
        favorites,
        cartPreviewCount: getCartCount(),
      });
    } catch {
      this.setData({
        status: "error",
        favorites: [],
        cartPreviewCount: getCartCount(),
      });
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.profile);
      },
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleGoCart() {
    navigateToRoute(ROUTES.cart);
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    this.hydrateFavorites();
  },
  handleOpenDetail(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.productDetail, {
      id,
    });
  },
  handleToggleFavorite(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    toggleFavoriteId(id);
    this.hydrateFavorites();
    wx.showToast({
      title: "已取消收藏",
      icon: "none",
    });
  },
  handleQuickAdd(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const product = this.data.favorites.find((item) => item.id === id);
    if (!product) return;

    const cartPreviewCount = addCartItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      skuId: product.skuId,
      name: product.name,
      cover: product.cover,
      model: product.model,
      price: product.price,
      unit: product.unit,
      quantity: product.minOrderQty,
      minOrderQty: product.minOrderQty,
      checked: true,
      invalid: false,
    });

    this.setData({
      cartPreviewCount,
    });

    wx.showToast({
      title: "已加入购物车",
      icon: "success",
    });
  },
});
