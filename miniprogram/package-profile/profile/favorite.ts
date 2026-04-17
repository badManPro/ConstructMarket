import { ROUTES } from "../../constants/routes";
import { createBrowseService } from "../../services/browse";
import type { SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import { getCartCount } from "../../utils/storage";

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
  async hydrateFavorites(override: PageStatus | null = null) {
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
      const favorites = (await createBrowseService().getFavoriteShellData()).favoriteProducts;

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
  async handleToggleFavorite(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const product = this.data.favorites.find((item) => item.id === id);
    if (!product) return;

    try {
      await createBrowseService().toggleProductFavorite(id, product.isFavorite);
      await this.hydrateFavorites();
      wx.showToast({
        title: "已取消收藏",
        icon: "none",
      });
    } catch {
      wx.showToast({
        title: "取消收藏失败",
        icon: "none",
      });
    }
  },
  async handleQuickAdd(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const product = this.data.favorites.find((item) => item.id === id);
    if (!product) return;

    try {
      const result = await createBrowseService().addProductToCart({
        product,
        quantity: product.minOrderQty,
        selectedSkuCode: product.skuId,
        selectedSpecText: product.specText || product.model,
      });

      this.setData({
        cartPreviewCount: result.cartPreviewCount,
      });

      wx.showToast({
        title: "已加入购物车",
        icon: "success",
      });
    } catch {
      wx.showToast({
        title: "加购失败",
        icon: "none",
      });
    }
  },
});
