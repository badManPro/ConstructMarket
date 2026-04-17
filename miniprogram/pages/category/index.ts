import { ROUTES } from "../../constants/routes";
import { defaultSearchFilterState } from "../../mock/browse";
import { createBrowseService } from "../../services/browse";
import type {
  BrandFilterOption,
  FilterOption,
  SearchFilterState,
  SearchProduct,
} from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

type SearchCategoryView = {
  id: string;
  name: string;
  count: number;
  parentId?: string;
};

type ActiveFilterTag = {
  key: string;
  label: string;
  value: string;
};

type BrandOptionView = BrandFilterOption & {
  selected: boolean;
};

function countCategories(baseCategories: SearchCategoryView[], productList: SearchProduct[]) {
  const parentMap = new Map(
    baseCategories
      .filter((item) => item.parentId)
      .map((item) => [item.id, item.parentId as string]),
  );

  return baseCategories.map((item) => ({
    ...item,
    count:
      item.id === "all"
        ? productList.length
        : productList.filter(
            (product) =>
              product.categoryId === item.id || parentMap.get(product.categoryId) === item.id,
          ).length,
  }));
}

function findOptionLabel(options: FilterOption[], value: string) {
  return options.find((item) => item.value === value)?.label ?? value;
}

function buildActiveFilterTags(params: {
  keyword: string;
  relatedCategories: SearchCategoryView[];
  selectedCategoryId: string;
  brandOptions: BrandOptionView[];
  selectedBrandIds: string[];
  sortOptions: FilterOption[];
  selectedSort: string;
  priceOptions: FilterOption[];
  quantityOptions: FilterOption[];
  materialOptions: FilterOption[];
  filterState: SearchFilterState;
}) {
  const tags: ActiveFilterTag[] = [];

  if (params.keyword.trim()) {
    tags.push({
      key: "keyword",
      label: "关键词",
      value: params.keyword.trim(),
    });
  }

  const category = params.relatedCategories.find((item) => item.id === params.selectedCategoryId);
  if (category && category.id !== "all") {
    tags.push({
      key: "category",
      label: "分类",
      value: category.name,
    });
  }

  params.selectedBrandIds.forEach((brandId) => {
    const brand = params.brandOptions.find((item) => item.id === brandId);
    if (!brand) return;
    tags.push({
      key: `brand:${brandId}`,
      label: "品牌",
      value: brand.name,
    });
  });

  if (params.filterState.priceRange !== "all") {
    tags.push({
      key: "price",
      label: "价格",
      value: findOptionLabel(params.priceOptions, params.filterState.priceRange),
    });
  }

  if (params.filterState.minOrder !== "all") {
    tags.push({
      key: "minOrder",
      label: "起订量",
      value: findOptionLabel(params.quantityOptions, params.filterState.minOrder),
    });
  }

  if (params.filterState.material !== "all") {
    tags.push({
      key: "material",
      label: "材质",
      value: findOptionLabel(params.materialOptions, params.filterState.material),
    });
  }

  if (params.selectedSort !== "default") {
    tags.push({
      key: "sort",
      label: "排序",
      value: findOptionLabel(params.sortOptions, params.selectedSort),
    });
  }

  return tags;
}

function buildBrandOptions(
  brandOptions: BrandFilterOption[],
  selectedBrandIds: string[],
): BrandOptionView[] {
  return brandOptions.map((item) => ({
    ...item,
    selected: selectedBrandIds.includes(item.id),
  }));
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    title: "选型",
    summary: "参考 web Products 页，支持分类、品牌、价格和排序查看可售商品。",
    inputKeyword: "",
    keyword: "",
    selectedCategoryId: "all",
    selectedBrandIds: [] as string[],
    selectedSort: "default",
    relatedCategories: [] as SearchCategoryView[],
    brandOptions: [] as BrandOptionView[],
    sortOptions: [] as FilterOption[],
    filterState: { ...defaultSearchFilterState },
    priceOptions: [] as FilterOption[],
    quantityOptions: [] as FilterOption[],
    materialOptions: [] as FilterOption[],
    activeFilterTags: [] as ActiveFilterTag[],
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

    void this.hydrateCategoryProductsPage(mockState);
  },
  onShow() {
    if (this.data.mockState) return;
    if (!this.data.relatedCategories.length || !this.data.sortOptions.length) {
      void this.hydrateCategoryProductsPage();
      return;
    }
    void this.refreshProductList();
  },
  onPullDownRefresh() {
    void this.hydrateCategoryProductsPage();
  },
  async hydrateCategoryProductsPage(override: PageStatus | null = null) {
    const browseService = createBrowseService();

    if (override === "loading") {
      this.setData({ status: "loading" });
      wx.stopPullDownRefresh();
      return;
    }

    try {
      const shell = await browseService.getSearchFilterShell();
      const selectedCategoryId =
        this.data.selectedCategoryId && shell.relatedCategories.some((item) => item.id === this.data.selectedCategoryId)
          ? this.data.selectedCategoryId
          : shell.relatedCategories[0]?.id ?? "all";
      const selectedSort = shell.sortOptions.some((item) => item.value === this.data.selectedSort)
        ? this.data.selectedSort
        : shell.sortOptions[0]?.value ?? "default";
      const selectedBrandIds = this.data.selectedBrandIds.filter((item) =>
        shell.brandOptions.some((brand) => brand.id === item),
      );
      const brandOptions = buildBrandOptions(shell.brandOptions, selectedBrandIds);

      if (override && override !== "ready") {
        this.setData({
          status: override,
          relatedCategories: shell.relatedCategories,
          brandOptions,
          sortOptions: shell.sortOptions,
          priceOptions: shell.priceOptions,
          quantityOptions: shell.quantityOptions,
          materialOptions: shell.materialOptions,
          selectedCategoryId,
          selectedBrandIds,
          selectedSort,
          productList: [],
          resultCount: 0,
          activeFilterTags: buildActiveFilterTags({
            keyword: this.data.keyword,
            relatedCategories: shell.relatedCategories,
            selectedCategoryId,
            brandOptions,
            selectedBrandIds,
            sortOptions: shell.sortOptions,
            selectedSort,
            priceOptions: shell.priceOptions,
            quantityOptions: shell.quantityOptions,
            materialOptions: shell.materialOptions,
            filterState: this.data.filterState as SearchFilterState,
          }),
        });
        wx.stopPullDownRefresh();
        return;
      }

      this.setData({
        relatedCategories: shell.relatedCategories,
        brandOptions,
        sortOptions: shell.sortOptions,
        priceOptions: shell.priceOptions,
        quantityOptions: shell.quantityOptions,
        materialOptions: shell.materialOptions,
        selectedCategoryId,
        selectedBrandIds,
        selectedSort,
      });

      await this.refreshProductList({
        relatedCategories: shell.relatedCategories,
        brandOptions,
        selectedCategoryId,
        selectedBrandIds,
        selectedSort,
      });
    } catch {
      this.setData({
        status: "error",
        productList: [],
        resultCount: 0,
        activeFilterTags: [],
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  async refreshProductList(options: {
    relatedCategories?: SearchCategoryView[];
    brandOptions?: BrandOptionView[];
    keyword?: string;
    selectedCategoryId?: string;
    selectedBrandIds?: string[];
    selectedSort?: string;
    filterState?: SearchFilterState;
  } = {}) {
    try {
      const keyword = options.keyword ?? this.data.keyword;
      const selectedCategoryId = options.selectedCategoryId ?? this.data.selectedCategoryId;
      const selectedBrandIds = options.selectedBrandIds ?? this.data.selectedBrandIds;
      const selectedSort = options.selectedSort ?? this.data.selectedSort;
      const filterState = options.filterState ?? (this.data.filterState as SearchFilterState);
      const browseService = createBrowseService();
      const result = await browseService.searchProductsPage({
        keyword,
        categoryId: selectedCategoryId,
        selectedBrandIds,
        sortOption: selectedSort,
        filterState,
      });
      const relatedCategories = countCategories(options.relatedCategories ?? this.data.relatedCategories, result.productList);
      const brandOptions = buildBrandOptions(
        (options.brandOptions ?? this.data.brandOptions).map(({ id, name }) => ({ id, name })),
        selectedBrandIds,
      );
      const activeFilterTags = buildActiveFilterTags({
        keyword,
        relatedCategories,
        selectedCategoryId,
        brandOptions,
        selectedBrandIds,
        sortOptions: this.data.sortOptions,
        selectedSort,
        priceOptions: this.data.priceOptions,
        quantityOptions: this.data.quantityOptions,
        materialOptions: this.data.materialOptions,
        filterState,
      });

      this.setData({
        status: result.productList.length ? "ready" : "empty",
        productList: result.productList,
        resultCount: result.productList.length,
        relatedCategories,
        brandOptions,
        activeFilterTags,
      });
    } catch {
      this.setData({
        status: "error",
        productList: [],
        resultCount: 0,
        activeFilterTags: [],
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
  handleBrandTap(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const nextBrandIds = this.data.selectedBrandIds.includes(id)
      ? this.data.selectedBrandIds.filter((item) => item !== id)
      : [...this.data.selectedBrandIds, id];

    this.setData({
      selectedBrandIds: nextBrandIds,
      status: "loading",
    });
    void this.refreshProductList({ selectedBrandIds: nextBrandIds });
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
  handleResetAll() {
    const nextCategoryId = this.data.relatedCategories[0]?.id ?? "all";
    const nextFilter = { ...defaultSearchFilterState };
    this.setData({
      inputKeyword: "",
      keyword: "",
      selectedCategoryId: nextCategoryId,
      selectedBrandIds: [],
      selectedSort: "default",
      filterState: nextFilter,
      status: "loading",
    });
    void this.refreshProductList({
      keyword: "",
      selectedCategoryId: nextCategoryId,
      selectedBrandIds: [],
      selectedSort: "default",
      filterState: nextFilter,
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
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    void this.hydrateCategoryProductsPage();
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
