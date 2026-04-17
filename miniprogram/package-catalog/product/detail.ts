import { ROUTES } from "../../constants/routes";
import { createBrowseService } from "../../services/browse";
import type { BrowseProductDetail, SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { patchCheckoutDraft, getCartCount } from "../../utils/storage";

function findMatchedSkuCode(product: BrowseProductDetail, selectedOptions: string[]) {
  const skuOptions = product.skuOptions ?? [];
  const normalizedOptions = selectedOptions.filter(Boolean);
  if (!skuOptions.length || !normalizedOptions.length) {
    return product.skuId;
  }

  const matched = skuOptions.find(
    (item) =>
      item.optionValues.length === normalizedOptions.length &&
      item.optionValues.every((value, index) => value === normalizedOptions[index]),
  );

  return matched?.skuCode ?? skuOptions[0]?.skuCode ?? product.skuId;
}

Page({
  data: {
    status: "loading" as "loading" | "ready" | "error",
    productId: "p-floor-001",
    product: null as BrowseProductDetail | null,
    recommendedProducts: [] as SearchProduct[],
    selectedOptions: [] as string[],
    selectedSkuCode: "",
    selectedSpecText: "请选择规格",
    quantity: 1,
    cartPreviewCount: 0,
    showSpecPopup: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const productId = typeof options.id === "string" ? options.id : "p-floor-001";
    this.setData({ productId });
    void this.hydrateProductPage();
    void this.recordBrowseLog(productId);
  },
  onShow() {
    void this.hydrateProductPage();
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.home);
      },
    });
  },
  async hydrateProductPage() {
    this.setData({
      status: "loading",
    });

    try {
      const pageData = await createBrowseService().getProductPageData(this.data.productId);
      const product = pageData.product;
      const quantity = this.data.quantity || product.minOrderQty;

      this.setData({
        status: "ready",
        product,
        quantity,
        selectedOptions: [],
        selectedSkuCode: "",
        selectedSpecText: product.selectedSpecText,
        recommendedProducts: pageData.recommendedProducts,
        cartPreviewCount: getCartCount(),
      });
    } catch {
      this.setData({
        status: "error",
        product: null,
        recommendedProducts: [],
      });
    }
  },
  async recordBrowseLog(productId: string) {
    try {
      await createBrowseService().recordProductBrowse(productId);
    } catch {
      // 浏览埋点失败不阻断详情页展示。
    }
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
    const product = this.data.product;
    const { selectedOptions, quantity, isComplete, selectedText } = event.detail ?? {};

    if (!product || !isComplete) {
      wx.showToast({
        title: "请完整选择规格",
        icon: "none",
      });
      return;
    }

    const nextSelectedOptions = selectedOptions ?? [];
    const matchedSkuCode = findMatchedSkuCode(product, nextSelectedOptions);

    this.setData({
      selectedOptions: nextSelectedOptions,
      selectedSkuCode: matchedSkuCode,
      quantity: quantity ?? this.data.quantity,
      selectedSpecText: selectedText ?? "请选择规格",
      showSpecPopup: false,
    });
  },
  async handleToggleFavorite() {
    const product = this.data.product;
    if (!product) return;

    try {
      const result = await createBrowseService().toggleProductFavorite(product.id, product.isFavorite);
      this.setData({
        product: {
          ...product,
          isFavorite: result.nextIsFavorite,
        },
      });
      wx.showToast({
        title: result.nextIsFavorite ? "已加入收藏" : "已取消收藏",
        icon: "none",
      });
    } catch {
      wx.showToast({
        title: "收藏操作失败",
        icon: "none",
      });
    }
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
  async handleAddToCart() {
    const product = this.data.product;
    if (!product || !this.ensureSpecSelected()) return;

    try {
      const selectedSkuCode =
        this.data.selectedSkuCode || findMatchedSkuCode(product, this.data.selectedOptions);
      const result = await createBrowseService().addProductToCart({
        product,
        quantity: this.data.quantity,
        selectedSkuCode,
        selectedSpecText: this.data.selectedSpecText,
      });

      this.setData({ cartPreviewCount: result.cartPreviewCount });
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
  handleBuyNow() {
    const product = this.data.product;
    if (!product || !this.ensureSpecSelected()) return;

    patchCheckoutDraft({
      source: "buy_now",
      selectedCartItemIds: [],
      buyNowItem: {
        id: `buy-now-${product.id}`,
        productId: product.id,
        skuId: this.data.selectedSkuCode || findMatchedSkuCode(product, this.data.selectedOptions),
        name: product.name,
        cover: product.cover,
        model: this.data.selectedSpecText,
        price: product.price,
        unit: product.unit,
        quantity: this.data.quantity,
        minOrderQty: product.minOrderQty,
        checked: true,
        invalid: false,
      },
      selectedCouponId: null,
    });

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
  async handleFavoriteTap(
    event: WechatMiniprogram.Event & {
      detail?: { id?: string };
    },
  ) {
    const { id } = event.detail ?? {};
    if (!id) return;

    const currentProduct = this.data.recommendedProducts.find((item) => item.id === id);
    if (!currentProduct) return;

    try {
      const result = await createBrowseService().toggleProductFavorite(id, currentProduct.isFavorite);
      this.setData({
        recommendedProducts: this.data.recommendedProducts.map((item) =>
          item.id === id
            ? {
                ...item,
                isFavorite: result.nextIsFavorite,
              }
            : item,
        ),
      });
      wx.showToast({
        title: result.nextIsFavorite ? "已加入收藏" : "已取消收藏",
        icon: "none",
      });
    } catch {
      wx.showToast({
        title: "收藏操作失败",
        icon: "none",
      });
    }
  },
  handleRetry() {
    void this.hydrateProductPage();
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
