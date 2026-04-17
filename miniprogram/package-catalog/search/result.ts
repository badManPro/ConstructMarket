import { ROUTES } from "../../constants/routes";
import { defaultSearchFilterState } from "../../mock/browse";
import { createBrowseService } from "../../services/browse";
import type { FilterOption, SearchFilterState, SearchProduct } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type SearchCategoryView = {
  id: string;
  name: string;
  count: number;
  parentId?: string;
};

function countCategories(baseCategories: SearchCategoryView[], productList: SearchProduct[]) {
  return baseCategories.map((item) => ({
    ...item,
    count: item.id === "all" ? productList.length : productList.filter((product) => product.categoryId === item.id).length,
  }));
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    title: "搜索结果页",
    summary: "承接搜索词和类目条件，支持排序、筛选、更多类目抽屉和商品列表浏览。",
    inputKeyword: "",
    keyword: "",
    selectedCategoryId: "all",
    selectedSort: "default",
    relatedCategories: [] as SearchCategoryView[],
    sortOptions: [] as FilterOption[],
    filterState: { ...defaultSearchFilterState },
    priceOptions: [] as FilterOption[],
    quantityOptions: [] as FilterOption[],
    materialOptions: [] as FilterOption[],
    productList: [] as SearchProduct[],
    resultCount: 0,
    showCategoryDrawer: false,
    showFilterDrawer: false,
  },
  onLoad(options: Record<string, string | undefined>) {
    const keyword = typeof options.keyword === "string" ? decodeURIComponent(options.keyword) : "";
    const categoryId = typeof options.categoryId === "string" ? options.categoryId : "all";
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      inputKeyword: keyword,
      keyword,
      selectedCategoryId: categoryId,
      mockState: mockState ?? "",
    });

    void this.hydrateSearchPage(mockState);
  },
  onShow() {
    if (this.data.mockState) return;
    if (!this.data.relatedCategories.length || !this.data.sortOptions.length) {
      void this.hydrateSearchPage();
      return;
    }
    void this.refreshProductList();
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.home);
      },
    });
  },
  async hydrateSearchPage(override: PageStatus | null = null) {
    const browseService = createBrowseService();

    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    try {
      const shell = await browseService.getSearchFilterShell();
      const selectedCategoryId =
        this.data.selectedCategoryId && this.data.selectedCategoryId !== "all"
          ? this.data.selectedCategoryId
          : shell.relatedCategories[0]?.id ?? "all";
      const selectedSort = shell.sortOptions.some((item) => item.value === this.data.selectedSort)
        ? this.data.selectedSort
        : shell.sortOptions[0]?.value ?? "default";

      if (override && override !== "ready") {
        this.setData({
          status: override,
          relatedCategories: shell.relatedCategories,
          sortOptions: shell.sortOptions,
          priceOptions: shell.priceOptions,
          quantityOptions: shell.quantityOptions,
          materialOptions: shell.materialOptions,
          selectedCategoryId,
          selectedSort,
          filterState: this.data.filterState,
          productList: [],
          resultCount: 0,
        });
        return;
      }

      this.setData({
        relatedCategories: shell.relatedCategories,
        sortOptions: shell.sortOptions,
        priceOptions: shell.priceOptions,
        quantityOptions: shell.quantityOptions,
        materialOptions: shell.materialOptions,
        selectedCategoryId,
        selectedSort,
      });

      await this.refreshProductList({
        relatedCategories: shell.relatedCategories,
        selectedCategoryId,
        selectedSort,
      });
    } catch {
      this.setData({
        status: "error",
        productList: [],
        resultCount: 0,
      });
    }
  },
  async refreshProductList(options: {
    relatedCategories?: SearchCategoryView[];
    keyword?: string;
    selectedCategoryId?: string;
    selectedSort?: string;
    filterState?: SearchFilterState;
  } = {}) {
    try {
      const keyword = options.keyword ?? this.data.keyword;
      const selectedCategoryId = options.selectedCategoryId ?? this.data.selectedCategoryId;
      const selectedSort = options.selectedSort ?? this.data.selectedSort;
      const filterState = options.filterState ?? (this.data.filterState as SearchFilterState);
      const result = await createBrowseService().searchProductsPage({
        keyword,
        categoryId: selectedCategoryId,
        sortOption: selectedSort,
        filterState,
      });
      const baseCategories = options.relatedCategories ?? this.data.relatedCategories;
      const relatedCategories = countCategories(baseCategories, result.productList);

      this.setData({
        status: result.productList.length ? "ready" : "empty",
        productList: result.productList,
        resultCount: result.productList.length,
        relatedCategories,
      });
    } catch {
      this.setData({
        status: "error",
        productList: [],
        resultCount: 0,
      });
    }
  },
  handleKeywordInput(event: WechatMiniprogram.InputEvent) {
    this.setData({
      inputKeyword: event.detail.value,
    });
  },
  handleSearchConfirm() {
    const keyword = this.data.inputKeyword.trim();
    this.setData({
      keyword,
      status: "loading",
    });
    void this.refreshProductList({ keyword });
  },
  handleCategoryTap(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;
    this.setData({
      selectedCategoryId: id,
      showCategoryDrawer: false,
      status: "loading",
    });
    void this.refreshProductList({ selectedCategoryId: id });
  },
  handleSortTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: string };
    if (!value) return;
    this.setData({
      selectedSort: value,
      status: "loading",
    });
    void this.refreshProductList({ selectedSort: value });
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
      status: "loading",
    });
    void this.refreshProductList({ filterState: nextFilter });
  },
  handleFilterReset() {
    const nextFilter = { ...defaultSearchFilterState };
    this.setData({
      filterState: nextFilter,
      status: "loading",
    });
    void this.refreshProductList({ filterState: nextFilter });
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
    const currentProduct = this.data.productList.find((item) => item.id === id);
    if (!currentProduct) return;

    try {
      const result = await createBrowseService().toggleProductFavorite(id, currentProduct.isFavorite);
      await this.refreshProductList();
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
  resetSearch() {
    const nextCategoryId = this.data.relatedCategories[0]?.id ?? "all";
    const nextFilter = { ...defaultSearchFilterState };
    this.setData({
      inputKeyword: "",
      keyword: "",
      selectedCategoryId: nextCategoryId,
      selectedSort: "default",
      filterState: nextFilter,
      status: "loading",
    });
    void this.refreshProductList({
      keyword: "",
      selectedCategoryId: nextCategoryId,
      selectedSort: "default",
      filterState: nextFilter,
    });
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    void this.hydrateSearchPage();
  },
  goHome() {
    navigateToRoute(ROUTES.home);
  },
  goCategoryPage() {
    const currentCategory = this.data.relatedCategories.find((item) => item.id === this.data.selectedCategoryId);

    navigateWithParams(ROUTES.category, {
      categoryId:
        this.data.selectedCategoryId === "all"
          ? undefined
          : currentCategory?.parentId ?? this.data.selectedCategoryId,
    });
  },
});
