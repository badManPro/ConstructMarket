import { ROUTES } from "../../constants/routes";
import { getProductDetail, getRecommendedProducts } from "../../mock/browse";
import type { BrowseProductDetail, SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { addCartItem, getCartCount, getFavoriteIds, toggleFavoriteId } from "../../utils/storage";

Page({
  data: {
    productId: "p-floor-001",
    product: null as BrowseProductDetail | null,
    recommendedProducts: [] as SearchProduct[],
    selectedOptions: [] as string[],
    selectedSpecText: "请选择规格",
    quantity: 1,
    cartPreviewCount: 0,
    showSpecPopup: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const productId = typeof options.id === "string" ? options.id : "p-floor-001";
    this.setData({ productId });
    this.hydrateProductPage();
  },
  onShow() {
    this.hydrateProductPage();
  },
  hydrateProductPage() {
    const favoriteIds = getFavoriteIds();
    const product = getProductDetail(this.data.productId, favoriteIds);
    const quantity = this.data.quantity || product.minOrderQty;
    this.setData({
      product,
      quantity,
      recommendedProducts: getRecommendedProducts(this.data.productId, favoriteIds),
      cartPreviewCount: getCartCount(),
    });
  },
  openSpecPopup() {
    this.setData({ showSpecPopup: true });
  },
  closeSpecPopup() {
    this.setData({ showSpecPopup: false });
  },
  handleSpecConfirm(
    event: WechatMiniprogram.Event & {
      detail?: {
        selectedOptions?: string[];
        quantity?: number;
        isComplete?: boolean;
        selectedText?: string;
      };
    },
  ) {
    const { selectedOptions, quantity, isComplete, selectedText } = event.detail ?? {};
    if (!isComplete) {
      wx.showToast({
        title: "请完整选择规格",
        icon: "none",
      });
      return;
    }

    this.setData({
      selectedOptions: selectedOptions ?? [],
      quantity: quantity ?? this.data.quantity,
      selectedSpecText: selectedText ?? "请选择规格",
      showSpecPopup: false,
    });
  },
  handleToggleFavorite() {
    if (!this.data.product) return;
    const favoriteIds = toggleFavoriteId(this.data.product.id);
    const product = getProductDetail(this.data.product.id, favoriteIds);
    this.setData({
      product,
      recommendedProducts: getRecommendedProducts(this.data.product.id, favoriteIds),
    });
    wx.showToast({
      title: favoriteIds.includes(this.data.product.id) ? "已加入收藏" : "已取消收藏",
      icon: "none",
    });
  },
  ensureSpecSelected() {
    const product = this.data.product;
    if (!product) return false;
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
    navigateWithParams(ROUTES.supportChat, {
      source: "product",
      productId: this.data.productId,
    });
  },
  handleAddToCart() {
    const product = this.data.product;
    if (!product || !this.ensureSpecSelected()) return;

    const cartPreviewCount = addCartItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      skuId: `${product.skuId}-${this.data.selectedOptions.join("-")}`,
      name: product.name,
      cover: product.cover,
      model: this.data.selectedSpecText,
      price: product.price,
      unit: product.unit,
      quantity: this.data.quantity,
      minOrderQty: product.minOrderQty,
      checked: true,
      invalid: false,
    });

    this.setData({ cartPreviewCount });
    wx.showToast({
      title: "已加入购物车",
      icon: "success",
    });
  },
  handleBuyNow() {
    if (!this.ensureSpecSelected()) return;
    navigateWithParams(ROUTES.checkout, {
      source: "buy_now",
      productId: this.data.productId,
    });
  },
  handleGoCart() {
    navigateToRoute(ROUTES.cart);
  },
  handleProductTap(
    event: WechatMiniprogram.Event & {
      detail?: { id?: string };
    },
  ) {
    const { id } = event.detail ?? {};
    if (!id) return;
    navigateWithParams(ROUTES.productDetail, { id });
  },
  handleFavoriteTap(
    event: WechatMiniprogram.Event & {
      detail?: { id?: string };
    },
  ) {
    const { id } = event.detail ?? {};
    if (!id) return;
    const favoriteIds = toggleFavoriteId(id);
    this.setData({
      recommendedProducts: getRecommendedProducts(this.data.productId, favoriteIds),
    });
  },
});
