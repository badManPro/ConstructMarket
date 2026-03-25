import { ROUTES } from "../../constants/routes";
import {
  getCategoryPageData,
  normalizeRootCategoryId,
  type CatalogRootCategory,
  type CatalogSubCategory,
} from "../../mock/category";
import type { SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getFavoriteIds, toggleFavoriteId } from "../../utils/storage";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    selectedCategoryId: "",
    pageSubtitle: "",
    searchPlaceholder: "建材 / 品牌 / 型号",
    loadingSkeleton: [1, 2, 3, 4],
    rootCategories: [] as CatalogRootCategory[],
    currentCategory: null as CatalogRootCategory | null,
    subCategories: [] as CatalogSubCategory[],
    categoryProducts: [] as SearchProduct[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const selectedCategoryId = normalizeRootCategoryId(options.categoryId);
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      selectedCategoryId,
      mockState: mockState ?? "",
    });

    this.hydrateCategoryPage(selectedCategoryId, mockState);
  },
  onShow() {
    if (!this.data.selectedCategoryId || this.data.mockState) return;
    this.hydrateCategoryPage(this.data.selectedCategoryId);
  },
  onPullDownRefresh() {
    this.hydrateCategoryPage(this.data.selectedCategoryId);
  },
  hydrateCategoryPage(categoryId?: string, override: PageStatus | null = null) {
    const selectedCategoryId = normalizeRootCategoryId(categoryId ?? this.data.selectedCategoryId);
    const pageData = getCategoryPageData(selectedCategoryId, getFavoriteIds());
    const pageSubtitle = `${pageData.currentCategory.name} · ${pageData.subCategories.length} 个细分类目`;

    if (override === "loading") {
      this.setData({
        status: "loading",
        selectedCategoryId: pageData.selectedCategoryId,
        rootCategories: pageData.rootCategories,
        currentCategory: pageData.currentCategory,
        pageSubtitle: `${pageData.currentCategory.name} · 加载中`,
        searchPlaceholder: pageData.currentCategory.searchHint,
      });
      wx.stopPullDownRefresh();
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        selectedCategoryId: pageData.selectedCategoryId,
        rootCategories: pageData.rootCategories,
        currentCategory: pageData.currentCategory,
        subCategories: override === "empty" ? [] : pageData.subCategories,
        categoryProducts: [],
        pageSubtitle: override === "empty" ? `${pageData.currentCategory.name} · 暂无商品` : `${pageData.currentCategory.name} · 状态异常`,
        searchPlaceholder: pageData.currentCategory.searchHint,
      });
      wx.stopPullDownRefresh();
      return;
    }

    this.setData({
      status: pageData.subCategories.length || pageData.categoryProducts.length ? "ready" : "empty",
      selectedCategoryId: pageData.selectedCategoryId,
      rootCategories: pageData.rootCategories,
      currentCategory: pageData.currentCategory,
      subCategories: pageData.subCategories,
      categoryProducts: pageData.categoryProducts,
      pageSubtitle,
      searchPlaceholder: pageData.currentCategory.searchHint,
    });
    wx.stopPullDownRefresh();
  },
  handleSearchTap() {
    const currentCategory = this.data.currentCategory;
    if (!currentCategory) return;
    navigateWithParams(ROUTES.searchResult, {
      categoryId: currentCategory.id,
      keyword: currentCategory.searchHint,
    });
  },
  handleRootCategoryTap(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id || id === this.data.selectedCategoryId) return;

    this.setData({
      selectedCategoryId: id,
      mockState: "",
      status: "loading",
    });

    this.hydrateCategoryPage(id);
  },
  handleSubCategoryTap(event: WechatMiniprogram.Event) {
    const { categoryId, keyword } = event.currentTarget.dataset as {
      categoryId?: string;
      keyword?: string;
    };
    if (!categoryId) return;

    navigateWithParams(ROUTES.searchResult, {
      categoryId,
      keyword,
    });
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
    toggleFavoriteId(id);
    this.hydrateCategoryPage(this.data.selectedCategoryId);
  },
  handleOpenAllResults() {
    const currentCategory = this.data.currentCategory;
    if (!currentCategory) return;

    navigateWithParams(ROUTES.searchResult, {
      categoryId: currentCategory.id,
      keyword: currentCategory.searchHint,
    });
  },
  handleOpenArticle() {
    const currentCategory = this.data.currentCategory;
    if (!currentCategory) return;

    navigateWithParams(ROUTES.articleList, {
      category: currentCategory.articleCategory,
    });
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    this.hydrateCategoryPage(this.data.selectedCategoryId);
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
