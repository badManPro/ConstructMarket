import {
  articleEntrances,
  brandFilterOptions,
  defaultSearchFilterState,
  getFavoriteProducts,
  getHomeSections,
  getProductDetail,
  getRecommendedProducts,
  homeBanners,
  homeCategoryNav,
  hotSearchKeywords,
  materialFilterOptions,
  minOrderFilterOptions,
  priceFilterOptions,
  relatedCategories,
  searchProducts,
  sortOptions,
} from "../mock/browse";
import { getCategoryPageData, type CatalogRootCategory, type CatalogSubCategory } from "../mock/category";
import type { BrandFilterOption, FilterOption, SearchFilterState, SearchProduct } from "../types/models";
import { getFavoriteIds } from "../utils/storage";
import { getApiConfig, shouldAllowMockFallback, shouldUseRemote, type ApiConfig } from "../api/config";
import {
  adaptArticleEntrances,
  adaptBannerCards,
  adaptBrandOptions,
  adaptCategoryShortcuts,
  adaptFavoriteProducts,
  adaptProductDetail,
  adaptSearchProducts,
} from "../api/adapters/browse";
import { createHomeApi, type HomeApi } from "../api/modules/home";
import { createProductApi, type ProductApi } from "../api/modules/product";
import { createProfileApi, type ProfileApi } from "../api/modules/profile";
import { createTradeApi, type TradeApi } from "../api/modules/trade";
import type { BrowseProductDetail, ProductSkuOption } from "../types/models";
import { addCartItem, toggleFavoriteId } from "../utils/storage";

type BrowseServiceDependencies = {
  config?: Partial<ApiConfig>;
  homeApi?: Partial<HomeApi>;
  productApi?: Partial<ProductApi>;
  profileApi?: Partial<ProfileApi>;
  tradeApi?: Partial<TradeApi>;
};

type SearchRelatedCategory = {
  id: string;
  name: string;
  count: number;
  parentId?: string;
};

const CATEGORY_ICON_TONES = [
  "linear-gradient(135deg, #ffe7d8, #fff4eb)",
  "linear-gradient(135deg, #dff4f0, #f2fbf9)",
  "linear-gradient(135deg, #ebeef5, #f7f9fc)",
  "linear-gradient(135deg, #fce7ef, #fff5f7)",
  "linear-gradient(135deg, #fff0dd, #fff8ef)",
  "linear-gradient(135deg, #e6f0ff, #f4f8ff)",
];

const ARTICLE_CATEGORIES: CatalogRootCategory["articleCategory"][] = [
  "industry_news",
  "product_knowledge",
  "renovation_guide",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toRecordArray(input: unknown) {
  return Array.isArray(input) ? input.filter((item): item is Record<string, unknown> => isRecord(item)) : [];
}

function pickString(source: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function pickNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

function normalizeId(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function toRemoteId(value: string) {
  return /^\d+$/.test(value) ? Number(value) : value || undefined;
}

function buildMockHomePageData(favoriteIds: string[]) {
  const sections = getHomeSections(favoriteIds);

  return {
    source: "mock" as const,
    keywordSuggestions: hotSearchKeywords,
    banners: homeBanners,
    categoryNav: homeCategoryNav,
    campaignProducts: sections.campaignProducts,
    hotProducts: sections.hotProducts,
    articleEntrances,
  };
}

function buildMockSearchFilterShell() {
  return {
    source: "mock" as const,
    relatedCategories,
    brandOptions: brandFilterOptions,
    sortOptions,
    priceOptions: priceFilterOptions,
    quantityOptions: minOrderFilterOptions,
    materialOptions: materialFilterOptions,
    filterState: { ...defaultSearchFilterState },
  };
}

function buildMockFavoriteShellData(favoriteIds: string[]) {
  return {
    source: "mock" as const,
    favoriteProducts: getFavoriteProducts(favoriteIds),
  };
}

function countRemoteCartItems(input: unknown) {
  return toRecordArray(input).reduce((total, item) => total + pickNumber(item, ["quantity"], 0), 0);
}

function findSelectedSkuOption(
  product: Partial<BrowseProductDetail> & { skuId?: string },
  selectedSkuCode?: string,
) {
  const skuOptions = Array.isArray(product.skuOptions)
    ? product.skuOptions.filter((item): item is ProductSkuOption => Boolean(item?.skuCode))
    : [];

  if (!skuOptions.length) {
    return null;
  }

  if (selectedSkuCode) {
    const matched = skuOptions.find(
      (item) => item.skuCode === selectedSkuCode || item.skuId === selectedSkuCode,
    );
    if (matched) {
      return matched;
    }
  }

  return skuOptions[0];
}

function buildCartSnapshotJson(params: {
  product: Partial<BrowseProductDetail> & { id?: string; name?: string };
  selectedSku: ProductSkuOption | null;
  selectedSpecText: string;
  quantity: number;
}) {
  const payload = {
    productId: params.product.id ?? "",
    productName: params.product.name ?? "",
    skuCode: params.selectedSku?.skuCode ?? params.product.skuId ?? "",
    specText: params.selectedSpecText,
    quantity: params.quantity,
  };

  return JSON.stringify(payload);
}

function buildRemoteCartPayload(params: {
  product: Partial<BrowseProductDetail> & {
    id?: string;
    name?: string;
    merchantId?: string;
    price?: number;
    skuId?: string;
  };
  quantity: number;
  selectedSkuCode?: string;
  selectedSpecText?: string;
  checked?: boolean;
}) {
  const merchantId = toRemoteId(params.product.merchantId ?? "");
  const productId = toRemoteId(params.product.id ?? "");
  const selectedSku = findSelectedSkuOption(params.product, params.selectedSkuCode);
  const skuCode = params.selectedSkuCode || selectedSku?.skuCode || params.product.skuId || "";

  if (merchantId === undefined || productId === undefined || !skuCode) {
    throw new Error("缺少真实购物车接口所需的商品标识");
  }

  return {
    merchantId,
    productId,
    skuCode,
    quantity: params.quantity,
    selectedFlag: params.checked === false ? 0 : 1,
    unitPrice: selectedSku?.price ?? params.product.price ?? 0,
    snapshotJson: buildCartSnapshotJson({
      product: params.product,
      selectedSku,
      selectedSpecText: params.selectedSpecText ?? selectedSku?.displayText ?? "",
      quantity: params.quantity,
    }),
  };
}

function buildMockCartItem(params: {
  product: Partial<BrowseProductDetail> & {
    id?: string;
    name?: string;
    cover?: string;
    unit?: string;
    minOrderQty?: number;
    price?: number;
    model?: string;
    skuId?: string;
  };
  quantity: number;
  selectedSpecText?: string;
  selectedSkuCode?: string;
}) {
  return {
    id: `${params.product.id ?? "product"}-${Date.now()}`,
    productId: params.product.id ?? "",
    skuId: params.selectedSkuCode || params.product.skuId || `${params.product.id ?? "product"}-sku`,
    name: params.product.name ?? "建材商品",
    cover: params.product.cover ?? "建材商品",
    model: params.selectedSpecText ?? params.product.model ?? "默认规格",
    price: params.product.price ?? 0,
    unit: params.product.unit ?? "件",
    quantity: params.quantity,
    minOrderQty: params.product.minOrderQty ?? 1,
    checked: true,
    invalid: false,
  };
}

function ensureBrandOptions(options: BrandFilterOption[], fallback: BrandFilterOption[]) {
  if (options.length) {
    return options;
  }

  return fallback;
}

function buildGenericSubCategory(
  item: Record<string, unknown>,
  parentId: string,
  index: number,
): CatalogSubCategory {
  const id = normalizeId(item.id ?? item.categoryId ?? item.categoryCode, `${parentId}-${index + 1}`);
  const name = pickString(item, ["categoryName", "name", "dictItemName"], `子类 ${index + 1}`);

  return {
    id,
    parentId,
    name,
    icon: name.slice(0, 1) || "类",
    level: 2,
    isHot: index < 2,
    summary: `${name} 相关商品`,
    badge: index === 0 ? "热销" : index === 1 ? "推荐" : "子类",
    iconTone: CATEGORY_ICON_TONES[index % CATEGORY_ICON_TONES.length],
    searchKeyword: name,
    routeCategoryId: id,
  };
}

function buildRemoteRootCategories(input: unknown): CatalogRootCategory[] {
  return toRecordArray(input).map((item, index) => {
    const id = normalizeId(item.id ?? item.categoryId ?? item.categoryCode, `category-${index + 1}`);
    const children = toRecordArray(item.children).map((child, childIndex) => buildGenericSubCategory(child, id, childIndex));
    const name = pickString(item, ["categoryName", "name", "dictItemName"], `分类 ${index + 1}`);

    return {
      id,
      parentId: normalizeId(item.parentId, "0"),
      name,
      icon: name.slice(0, 1) || "类",
      level: pickNumber(item, ["categoryLevel", "level"], 1),
      isHot: index < 2,
      summary: children.length ? children.slice(0, 2).map((child) => child.name).join(" / ") : `${name} 分类选型`,
      searchHint: name,
      guideTitle: `先按 ${name} 缩小范围，再查看热销商品`,
      guideSummary: `当前分类树和热销商品都已接入真实接口，可先查看细分类目，再进入结果页筛选价格和商品规格。`,
      articleCategory: ARTICLE_CATEGORIES[index % ARTICLE_CATEGORIES.length],
      articleTitle: `查看 ${name} 采购建议`,
      sceneTags: children.length ? children.slice(0, 3).map((child) => child.name) : [name, "真实分类", "热销商品"],
      children,
    };
  });
}

function buildRelatedCategories(rootCategories: CatalogRootCategory[], products: SearchProduct[] = []): SearchRelatedCategory[] {
  const rootItems = rootCategories.map((item) => ({
    id: item.id,
    name: item.name,
    count: products.filter(
      (product) =>
        product.categoryId === item.id ||
        item.children.some((child) => product.categoryId === child.id),
    ).length,
  }));
  const childItems = rootCategories.flatMap((item) =>
    item.children.map((child) => ({
      id: child.id,
      name: child.name,
      parentId: item.id,
      count: products.filter((product) => product.categoryId === child.id).length,
    })),
  );

  return [
    {
      id: "all",
      name: "全部结果",
      count: products.length,
    },
    ...rootItems,
    ...childItems,
  ];
}

function buildRemoteSearchParams(params: {
  keyword: string;
  categoryId: string;
  sortOption: string;
  selectedBrandIds?: string[];
  filterState: SearchFilterState;
}) {
  const requestParams: Record<string, unknown> = {
    pageIndex: 1,
    pageSize: 20,
  };
  const keyword = params.keyword.trim();
  const remoteCategoryId = toRemoteId(params.categoryId);

  if (keyword) {
    requestParams.keyword = keyword;
  }
  if (params.sortOption && params.sortOption !== "default") {
    requestParams.sortType = params.sortOption;
  }
  if (remoteCategoryId !== undefined && params.categoryId !== "all") {
    requestParams.categoryId = remoteCategoryId;
  }
  if (params.selectedBrandIds?.length) {
    requestParams.brandId = params.selectedBrandIds.map((item) => toRemoteId(item) ?? item);
  }
  if (params.filterState.priceRange === "budget") {
    requestParams.maxPrice = 100;
  }
  if (params.filterState.priceRange === "mid") {
    requestParams.minPrice = 100;
    requestParams.maxPrice = 200;
  }
  if (params.filterState.priceRange === "premium") {
    requestParams.minPrice = 200;
  }

  return requestParams;
}

function refineSearchProducts(
  products: SearchProduct[],
  params: {
    keyword: string;
    categoryId: string;
    sortOption: string;
    selectedBrandIds?: string[];
    filterState: SearchFilterState;
  },
) {
  const keyword = params.keyword.trim().toLowerCase();
  const selectedBrandIds = params.selectedBrandIds ?? [];

  let next = products.filter((item) => {
    const matchesKeyword =
      !keyword ||
      [item.name, item.brand, item.model, item.categoryName]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    const matchesCategory = params.categoryId === "all" || item.categoryId === params.categoryId;
    const matchesBrand =
      !selectedBrandIds.length ||
      selectedBrandIds.includes(item.brandId ?? item.brand);
    const matchesPrice =
      params.filterState.priceRange === "all" ||
      (params.filterState.priceRange === "budget" && item.price < 100) ||
      (params.filterState.priceRange === "mid" && item.price >= 100 && item.price < 200) ||
      (params.filterState.priceRange === "premium" && item.price >= 200);
    const matchesOrder =
      params.filterState.minOrder === "all" ||
      (params.filterState.minOrder === "qty10" && item.minOrderQty <= 10) ||
      (params.filterState.minOrder === "qty20" && item.minOrderQty <= 20) ||
      (params.filterState.minOrder === "qty50" && item.minOrderQty <= 50);
    const matchesMaterial = params.filterState.material === "all" || item.material === params.filterState.material;

    return matchesKeyword && matchesCategory && matchesBrand && matchesPrice && matchesOrder && matchesMaterial;
  });

  if (params.sortOption === "sales_desc") {
    next = [...next].sort((left, right) => right.salesVolume - left.salesVolume);
  }
  if (params.sortOption === "price_asc") {
    next = [...next].sort((left, right) => left.price - right.price);
  }
  if (params.sortOption === "price_desc") {
    next = [...next].sort((left, right) => right.price - left.price);
  }
  if (params.sortOption === "brand") {
    next = [...next].sort((left, right) => left.brand.localeCompare(right.brand));
  }

  return next;
}

function ensureDefaultOption(options: FilterOption[], fallback: FilterOption[]) {
  if (!options.length) {
    return fallback;
  }

  const hasAll = options.some((item) => item.value === "all");
  return hasAll ? options : [fallback[0], ...options];
}

function matchDictType(source: Record<string, unknown>, keywords: string[]) {
  const haystack = [
    pickString(source, ["dictTypeCode", "dictTypeName"]),
    pickString(source, ["dictItemCode", "dictItemName"]),
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
}

function mapDictItemToOption(source: Record<string, unknown>): FilterOption | null {
  const value = pickString(source, ["dictItemValue", "dictItemCode"], "");
  const label = pickString(source, ["dictItemName", "dictItemValue"], "");

  if (!value || !label) {
    return null;
  }

  return {
    value,
    label,
    desc: pickString(source, ["remarksText"], ""),
  };
}

function adaptFilterOptions(
  simpleListInput: unknown,
  treeListInput: unknown,
  fallback: {
    priceOptions: FilterOption[];
    quantityOptions: FilterOption[];
    materialOptions: FilterOption[];
  },
) {
  const simpleItems = toRecordArray(simpleListInput);
  const treeRoots = toRecordArray(treeListInput);
  const priceOptions = treeRoots
    .filter((item) => matchDictType(item, ["price", "价格"]))
    .flatMap((item) => {
      const children = toRecordArray(item.children);
      return (children.length ? children : [item]).map(mapDictItemToOption).filter((option): option is FilterOption => Boolean(option));
    });
  const quantityOptions = simpleItems
    .filter((item) => matchDictType(item, ["qty", "quantity", "order", "起订", "起批", "数量"]))
    .map(mapDictItemToOption)
    .filter((option): option is FilterOption => Boolean(option));
  const materialOptions = simpleItems
    .filter((item) => matchDictType(item, ["material", "材质"]))
    .map(mapDictItemToOption)
    .filter((option): option is FilterOption => Boolean(option));

  return {
    priceOptions: ensureDefaultOption(priceOptions, fallback.priceOptions),
    quantityOptions: ensureDefaultOption(quantityOptions, fallback.quantityOptions),
    materialOptions: ensureDefaultOption(materialOptions, fallback.materialOptions),
  };
}

export function createBrowseService(dependencies: BrowseServiceDependencies = {}) {
  const config = getApiConfig(dependencies.config ?? {});
  const homeApi = {
    ...createHomeApi({ config }),
    ...(dependencies.homeApi ?? {}),
  };
  const productApi = {
    ...createProductApi({ config }),
    ...(dependencies.productApi ?? {}),
  };
  const profileApi = {
    ...createProfileApi({ config }),
    ...(dependencies.profileApi ?? {}),
  };
  const tradeApi = {
    ...createTradeApi({ config }),
    ...(dependencies.tradeApi ?? {}),
  };

  return {
    async getHomePageData(favoriteIds?: string[]) {
      if (!shouldUseRemote(config)) {
        return buildMockHomePageData(favoriteIds ?? getFavoriteIds());
      }

      try {
        const [banners, categories, newArrivalProducts, hotRecommendProducts, newsArticles] = await Promise.all([
          homeApi.getBanners(),
          homeApi.getCategories(),
          homeApi.getNewArrivalProducts(),
          homeApi.getHotRecommendProducts(),
          homeApi.getNewsArticles(),
        ]);

        return {
          source: "remote" as const,
          keywordSuggestions: hotSearchKeywords,
          banners: adaptBannerCards(banners),
          categoryNav: adaptCategoryShortcuts(categories),
          campaignProducts: adaptSearchProducts(newArrivalProducts),
          hotProducts: adaptSearchProducts(hotRecommendProducts),
          articleEntrances: adaptArticleEntrances(newsArticles),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return buildMockHomePageData(favoriteIds ?? getFavoriteIds());
        }

        throw error;
      }
    },
    async searchProductsPage(params: {
      keyword: string;
      categoryId: string;
      sortOption: string;
      selectedBrandIds?: string[];
      filterState: SearchFilterState;
      favoriteIds?: string[];
    }) {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          productList: searchProducts({
            ...params,
            favoriteIds: params.favoriteIds ?? getFavoriteIds(),
          }),
        };
      }

      try {
        const remoteList = await homeApi.searchProducts(buildRemoteSearchParams(params));
        const remoteProducts = adaptSearchProducts(remoteList);

        return {
          source: "remote" as const,
          productList: refineSearchProducts(remoteProducts, params),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
            productList: searchProducts({
              ...params,
              favoriteIds: params.favoriteIds ?? getFavoriteIds(),
            }),
          };
        }

        throw error;
      }
    },
    async getProductPageData(productId: string, favoriteIds?: string[]) {
      if (!shouldUseRemote(config)) {
        const localFavoriteIds = favoriteIds ?? getFavoriteIds();
        return {
          source: "mock" as const,
          product: getProductDetail(productId, localFavoriteIds),
          recommendedProducts: getRecommendedProducts(productId, localFavoriteIds),
        };
      }

      try {
        const detail = await productApi.getProductDetail(productId);
        const detailRecord = isRecord(detail) ? detail : {};
        const detailProduct = isRecord(detailRecord.product) ? detailRecord.product : {};
        const merchantFromDetail = isRecord(detailRecord.merchant) ? detailRecord.merchant : {};
        const merchantId = pickString(
          merchantFromDetail,
          ["id", "merchantId"],
          pickString(detailProduct, ["merchantId"], ""),
        );

        const [specs, merchant, recommendedList] = await Promise.all([
          productApi.getProductSpecs(productId),
          merchantId ? productApi.getMerchantDetail(merchantId).catch(() => merchantFromDetail) : merchantFromDetail,
          detailProduct.categoryId
            ? homeApi
                .searchProducts({
                  categoryId: detailProduct.categoryId,
                  sortType: "sales_desc",
                  pageIndex: 1,
                  pageSize: 6,
                })
                .catch(() => null)
            : Promise.resolve(null),
        ]);

        const product = adaptProductDetail(detailRecord, specs, merchant, []);
        const fallbackRecommendations = getRecommendedProducts(productId, favoriteIds ?? []);

        return {
          source: "remote" as const,
          product: product ?? getProductDetail(productId, favoriteIds ?? []),
          recommendedProducts:
            recommendedList && product
              ? adaptSearchProducts(recommendedList)
                  .filter((item) => item.id !== product.id)
                  .slice(0, 3)
              : fallbackRecommendations,
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          const localFavoriteIds = favoriteIds ?? getFavoriteIds();
          return {
            source: "mock" as const,
            product: getProductDetail(productId, localFavoriteIds),
            recommendedProducts: getRecommendedProducts(productId, localFavoriteIds),
          };
        }

        throw error;
      }
    },
    async toggleProductFavorite(productId: string, isFavorite: boolean) {
      if (!shouldUseRemote(config)) {
        const nextFavorites = toggleFavoriteId(productId);
        return {
          source: "mock" as const,
          nextIsFavorite: nextFavorites.includes(productId),
        };
      }

      try {
        if (isFavorite) {
          await profileApi.removeProductFavorite(productId);
        } else {
          await profileApi.addProductFavorite(productId);
        }

        return {
          source: "remote" as const,
          nextIsFavorite: !isFavorite,
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          const nextFavorites = toggleFavoriteId(productId);
          return {
            source: "mock" as const,
            nextIsFavorite: nextFavorites.includes(productId),
          };
        }

        throw error;
      }
    },
    async addProductToCart(params: {
      product: Partial<BrowseProductDetail> & {
        id?: string;
        name?: string;
        cover?: string;
        unit?: string;
        minOrderQty?: number;
        price?: number;
        model?: string;
        skuId?: string;
        merchantId?: string;
      };
      quantity: number;
      selectedSkuCode?: string;
      selectedSpecText?: string;
      checked?: boolean;
    }) {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          cartPreviewCount: addCartItem(
            buildMockCartItem({
              product: params.product,
              quantity: params.quantity,
              selectedSpecText: params.selectedSpecText,
              selectedSkuCode: params.selectedSkuCode,
            }),
          ),
        };
      }

      try {
        const createdItem = await tradeApi.addCartItem(buildRemoteCartPayload(params));
        const remoteCart = await tradeApi.getCart().catch(() => [createdItem]);

        return {
          source: "remote" as const,
          cartPreviewCount: countRemoteCartItems(remoteCart),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
            cartPreviewCount: addCartItem(
              buildMockCartItem({
                product: params.product,
                quantity: params.quantity,
                selectedSpecText: params.selectedSpecText,
                selectedSkuCode: params.selectedSkuCode,
              }),
            ),
          };
        }

        throw error;
      }
    },
    async recordProductBrowse(productId: string, browseSourceCode = "PRODUCT_DETAIL") {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
        };
      }

      try {
        await productApi.addBrowseLog(productId, browseSourceCode);
        return {
          source: "remote" as const,
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
          };
        }

        throw error;
      }
    },
    async getCategoryShellData(categoryId: string, favoriteIds?: string[]) {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          ...getCategoryPageData(categoryId, favoriteIds ?? getFavoriteIds()),
        };
      }

      try {
        const remoteCategories = buildRemoteRootCategories(await homeApi.getCategories());
        const currentCategory = remoteCategories.find((item) => item.id === categoryId) ?? remoteCategories[0] ?? null;

        if (!currentCategory) {
          return {
            source: "remote" as const,
            rootCategories: [],
            currentCategory: null,
            subCategories: [],
            categoryProducts: [],
            selectedCategoryId: "",
          };
        }

        const remoteProducts = adaptSearchProducts(
          await homeApi.searchProducts({
            categoryId: toRemoteId(currentCategory.id),
            sortType: "sales_desc",
            pageIndex: 1,
            pageSize: 6,
          }),
        );

        return {
          source: "remote" as const,
          rootCategories: remoteCategories,
          currentCategory,
          subCategories: currentCategory.children,
          categoryProducts: remoteProducts.slice(0, 3),
          selectedCategoryId: currentCategory.id,
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
            ...getCategoryPageData(categoryId, favoriteIds ?? getFavoriteIds()),
          };
        }

        throw error;
      }
    },
    async getFavoriteShellData(favoriteIds?: string[]) {
      if (!shouldUseRemote(config)) {
        return buildMockFavoriteShellData(favoriteIds ?? getFavoriteIds());
      }

      try {
        return {
          source: "remote" as const,
          favoriteProducts: adaptFavoriteProducts(await profileApi.getProductFavorites()),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return buildMockFavoriteShellData(favoriteIds ?? getFavoriteIds());
        }

        throw error;
      }
    },
    async getSearchFilterShell() {
      if (!shouldUseRemote(config)) {
        return buildMockSearchFilterShell();
      }

      try {
        const [categories, brands, simpleItems, treeItems] = await Promise.all([
          homeApi.getCategories(),
          homeApi.getBrands(),
          homeApi.getDictSimpleList(),
          homeApi.getDictTreeList(),
        ]);
        const rootCategories = buildRemoteRootCategories(categories);
        const remoteFilterOptions = adaptFilterOptions(simpleItems, treeItems, {
          priceOptions: priceFilterOptions,
          quantityOptions: minOrderFilterOptions,
          materialOptions: materialFilterOptions,
        });

        return {
          source: "remote" as const,
          relatedCategories: buildRelatedCategories(rootCategories),
          brandOptions: ensureBrandOptions(adaptBrandOptions(brands), brandFilterOptions),
          sortOptions,
          priceOptions: remoteFilterOptions.priceOptions,
          quantityOptions: remoteFilterOptions.quantityOptions,
          materialOptions: remoteFilterOptions.materialOptions,
          filterState: { ...defaultSearchFilterState },
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return buildMockSearchFilterShell();
        }

        throw error;
      }
    },
  };
}
