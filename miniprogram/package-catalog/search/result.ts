import { ROUTES } from "../../constants/routes";
import {
  defaultSearchFilterState,
  materialFilterOptions,
  minOrderFilterOptions,
  priceFilterOptions,
  relatedCategories,
  searchProducts,
  sortOptions,
} from "../../mock/browse";
import type { SearchFilterState, SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getFavoriteIds, toggleFavoriteId } from "../../utils/storage";

Page({
  data: {
    title: "搜索结果页",
    summary: "承接搜索词和类目条件，支持排序、筛选、更多类目抽屉和商品列表浏览。",
    inputKeyword: "",
    keyword: "",
    selectedCategoryId: "all",
    selectedSort: "default",
    relatedCategories,
    sortOptions,
    filterState: defaultSearchFilterState,
    priceOptions: priceFilterOptions,
    quantityOptions: minOrderFilterOptions,
    materialOptions: materialFilterOptions,
    productList: [] as SearchProduct[],
    resultCount: 0,
    showCategoryDrawer: false,
    showFilterDrawer: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const keyword = typeof options.keyword === "string" ? decodeURIComponent(options.keyword) : "";
    const categoryId = typeof options.categoryId === "string" ? options.categoryId : "all";
    this.setData({
      inputKeyword: keyword,
      keyword,
      selectedCategoryId: categoryId,
    });
    this.refreshProductList();
  },
  onShow() {
    this.refreshProductList();
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.home);
      },
    });
  },
  refreshProductList() {
    const productList = searchProducts({
      keyword: this.data.keyword,
      categoryId: this.data.selectedCategoryId,
      sortOption: this.data.selectedSort,
      filterState: this.data.filterState as SearchFilterState,
      favoriteIds: getFavoriteIds(),
    });

    this.setData({
      productList,
      resultCount: productList.length,
    });
  },
  handleKeywordInput(event: WechatMiniprogram.InputEvent) {
    this.setData({
      inputKeyword: event.detail.value,
    });
  },
  handleSearchConfirm() {
    this.setData({
      keyword: this.data.inputKeyword.trim(),
    });
    this.refreshProductList();
  },
  handleCategoryTap(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;
    this.setData({
      selectedCategoryId: id,
      showCategoryDrawer: false,
    });
    this.refreshProductList();
  },
  handleSortTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value) return;
    this.setData({
      selectedSort: value,
    });
    this.refreshProductList();
  },
  openCategoryDrawer() {
    this.setData({ showCategoryDrawer: true });
  },
  closeCategoryDrawer() {
    this.setData({ showCategoryDrawer: false });
  },
  openFilterDrawer() {
    this.setData({ showFilterDrawer: true });
  },
  closeFilterDrawer() {
    this.setData({ showFilterDrawer: false });
  },
  handleFilterApply(
    event: WechatMiniprogram.Event & {
      detail?: { value?: SearchFilterState };
    },
  ) {
    const nextFilter = event.detail?.value;
    if (!nextFilter) return;
    this.setData({
      filterState: nextFilter,
      showFilterDrawer: false,
    });
    this.refreshProductList();
  },
  handleFilterReset() {
    this.setData({
      filterState: { ...defaultSearchFilterState },
    });
    this.refreshProductList();
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
    const productList = searchProducts({
      keyword: this.data.keyword,
      categoryId: this.data.selectedCategoryId,
      sortOption: this.data.selectedSort,
      filterState: this.data.filterState as SearchFilterState,
      favoriteIds,
    });

    this.setData({
      productList,
      resultCount: productList.length,
    });
  },
  resetSearch() {
    this.setData({
      inputKeyword: "",
      keyword: "",
      selectedCategoryId: "all",
      selectedSort: "default",
      filterState: { ...defaultSearchFilterState },
    });
    this.refreshProductList();
  },
  goHome() {
    navigateToRoute(ROUTES.home);
  },
  goCategoryPage() {
    navigateToRoute(ROUTES.category);
  },
});
