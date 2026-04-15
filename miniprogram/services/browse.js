"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrowseService = createBrowseService;
const browse_1 = require("../mock/browse");
const category_1 = require("../mock/category");
const storage_1 = require("../utils/storage");
const config_1 = require("../api/config");
const browse_2 = require("../api/adapters/browse");
const home_1 = require("../api/modules/home");
const product_1 = require("../api/modules/product");
const profile_1 = require("../api/modules/profile");
const CATEGORY_ICON_TONES = [
    "linear-gradient(135deg, #ffe7d8, #fff4eb)",
    "linear-gradient(135deg, #dff4f0, #f2fbf9)",
    "linear-gradient(135deg, #ebeef5, #f7f9fc)",
    "linear-gradient(135deg, #fce7ef, #fff5f7)",
    "linear-gradient(135deg, #fff0dd, #fff8ef)",
    "linear-gradient(135deg, #e6f0ff, #f4f8ff)",
];
const ARTICLE_CATEGORIES = [
    "industry_news",
    "product_knowledge",
    "renovation_guide",
];
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function toRecordArray(input) {
    return Array.isArray(input) ? input.filter((item) => isRecord(item)) : [];
}
function pickString(source, keys, fallback = "") {
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
function pickNumber(source, keys, fallback = 0) {
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
function normalizeId(value, fallback) {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return fallback;
}
function toRemoteId(value) {
    return /^\d+$/.test(value) ? Number(value) : value || undefined;
}
function buildMockHomePageData(favoriteIds) {
    const sections = (0, browse_1.getHomeSections)(favoriteIds);
    return {
        source: "mock",
        keywordSuggestions: browse_1.hotSearchKeywords,
        banners: browse_1.homeBanners,
        categoryNav: browse_1.homeCategoryNav,
        campaignProducts: sections.campaignProducts,
        hotProducts: sections.hotProducts,
        articleEntrances: browse_1.articleEntrances,
    };
}
function buildMockSearchFilterShell() {
    return {
        source: "mock",
        relatedCategories: browse_1.relatedCategories,
        sortOptions: browse_1.sortOptions,
        priceOptions: browse_1.priceFilterOptions,
        quantityOptions: browse_1.minOrderFilterOptions,
        materialOptions: browse_1.materialFilterOptions,
        filterState: { ...browse_1.defaultSearchFilterState },
    };
}
function buildGenericSubCategory(item, parentId, index) {
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
function buildRemoteRootCategories(input) {
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
function buildRelatedCategories(rootCategories, products = []) {
    const rootItems = rootCategories.map((item) => ({
        id: item.id,
        name: item.name,
        count: products.filter((product) => product.categoryId === item.id ||
            item.children.some((child) => product.categoryId === child.id)).length,
    }));
    const childItems = rootCategories.flatMap((item) => item.children.map((child) => ({
        id: child.id,
        name: child.name,
        parentId: item.id,
        count: products.filter((product) => product.categoryId === child.id).length,
    })));
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
function buildRemoteSearchParams(params) {
    const requestParams = {
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
function refineSearchProducts(products, params) {
    const keyword = params.keyword.trim().toLowerCase();
    let next = products.filter((item) => {
        const matchesKeyword = !keyword ||
            [item.name, item.brand, item.model, item.categoryName]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        const matchesCategory = params.categoryId === "all" || item.categoryId === params.categoryId;
        const matchesPrice = params.filterState.priceRange === "all" ||
            (params.filterState.priceRange === "budget" && item.price < 100) ||
            (params.filterState.priceRange === "mid" && item.price >= 100 && item.price < 200) ||
            (params.filterState.priceRange === "premium" && item.price >= 200);
        const matchesOrder = params.filterState.minOrder === "all" ||
            (params.filterState.minOrder === "qty10" && item.minOrderQty <= 10) ||
            (params.filterState.minOrder === "qty20" && item.minOrderQty <= 20) ||
            (params.filterState.minOrder === "qty50" && item.minOrderQty <= 50);
        const matchesMaterial = params.filterState.material === "all" || item.material === params.filterState.material;
        return matchesKeyword && matchesCategory && matchesPrice && matchesOrder && matchesMaterial;
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
function ensureDefaultOption(options, fallback) {
    if (!options.length) {
        return fallback;
    }
    const hasAll = options.some((item) => item.value === "all");
    return hasAll ? options : [fallback[0], ...options];
}
function matchDictType(source, keywords) {
    const haystack = [
        pickString(source, ["dictTypeCode", "dictTypeName"]),
        pickString(source, ["dictItemCode", "dictItemName"]),
    ]
        .join(" ")
        .toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
}
function mapDictItemToOption(source) {
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
function adaptFilterOptions(simpleListInput, treeListInput, fallback) {
    const simpleItems = toRecordArray(simpleListInput);
    const treeRoots = toRecordArray(treeListInput);
    const priceOptions = treeRoots
        .filter((item) => matchDictType(item, ["price", "价格"]))
        .flatMap((item) => {
        const children = toRecordArray(item.children);
        return (children.length ? children : [item]).map(mapDictItemToOption).filter((option) => Boolean(option));
    });
    const quantityOptions = simpleItems
        .filter((item) => matchDictType(item, ["qty", "quantity", "order", "起订", "起批", "数量"]))
        .map(mapDictItemToOption)
        .filter((option) => Boolean(option));
    const materialOptions = simpleItems
        .filter((item) => matchDictType(item, ["material", "材质"]))
        .map(mapDictItemToOption)
        .filter((option) => Boolean(option));
    return {
        priceOptions: ensureDefaultOption(priceOptions, fallback.priceOptions),
        quantityOptions: ensureDefaultOption(quantityOptions, fallback.quantityOptions),
        materialOptions: ensureDefaultOption(materialOptions, fallback.materialOptions),
    };
}
function createBrowseService(dependencies = {}) {
    const config = (0, config_1.getApiConfig)(dependencies.config ?? {});
    const homeApi = {
        ...(0, home_1.createHomeApi)({ config }),
        ...(dependencies.homeApi ?? {}),
    };
    const productApi = {
        ...(0, product_1.createProductApi)({ config }),
        ...(dependencies.productApi ?? {}),
    };
    const profileApi = {
        ...(0, profile_1.createProfileApi)({ config }),
        ...(dependencies.profileApi ?? {}),
    };
    return {
        async getHomePageData(favoriteIds = []) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return buildMockHomePageData(favoriteIds);
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
                    source: "remote",
                    keywordSuggestions: browse_1.hotSearchKeywords,
                    banners: (0, browse_2.adaptBannerCards)(banners),
                    categoryNav: (0, browse_2.adaptCategoryShortcuts)(categories),
                    campaignProducts: (0, browse_2.adaptSearchProducts)(newArrivalProducts, favoriteIds),
                    hotProducts: (0, browse_2.adaptSearchProducts)(hotRecommendProducts, favoriteIds),
                    articleEntrances: (0, browse_2.adaptArticleEntrances)(newsArticles),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return buildMockHomePageData(favoriteIds);
                }
                throw error;
            }
        },
        async searchProductsPage(params) {
            const favoriteIds = params.favoriteIds ?? (0, storage_1.getFavoriteIds)();
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    productList: (0, browse_1.searchProducts)({
                        ...params,
                        favoriteIds,
                    }),
                };
            }
            try {
                const remoteList = await homeApi.searchProducts(buildRemoteSearchParams(params));
                const remoteProducts = (0, browse_2.adaptSearchProducts)(remoteList, favoriteIds);
                return {
                    source: "remote",
                    productList: refineSearchProducts(remoteProducts, params),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                        productList: (0, browse_1.searchProducts)({
                            ...params,
                            favoriteIds,
                        }),
                    };
                }
                throw error;
            }
        },
        async getProductPageData(productId, favoriteIds = (0, storage_1.getFavoriteIds)()) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    product: (0, browse_1.getProductDetail)(productId, favoriteIds),
                    recommendedProducts: (0, browse_1.getRecommendedProducts)(productId, favoriteIds),
                };
            }
            try {
                const detail = await productApi.getProductDetail(productId);
                const product = (0, browse_2.adaptProductDetail)(detail, await productApi.getProductSpecs(productId), {}, favoriteIds);
                return {
                    source: "remote",
                    product: product ?? (0, browse_1.getProductDetail)(productId, favoriteIds),
                    recommendedProducts: (0, browse_1.getRecommendedProducts)(productId, favoriteIds),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                        product: (0, browse_1.getProductDetail)(productId, favoriteIds),
                        recommendedProducts: (0, browse_1.getRecommendedProducts)(productId, favoriteIds),
                    };
                }
                throw error;
            }
        },
        async toggleProductFavorite(productId, isFavorite) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    nextIsFavorite: !isFavorite,
                };
            }
            if (isFavorite) {
                await profileApi.removeProductFavorite(productId);
            }
            else {
                await profileApi.addProductFavorite(productId);
            }
            return {
                source: "remote",
                nextIsFavorite: !isFavorite,
            };
        },
        async getCategoryShellData(categoryId, favoriteIds = (0, storage_1.getFavoriteIds)()) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    ...(0, category_1.getCategoryPageData)(categoryId, favoriteIds),
                };
            }
            try {
                const remoteCategories = buildRemoteRootCategories(await homeApi.getCategories());
                const currentCategory = remoteCategories.find((item) => item.id === categoryId) ?? remoteCategories[0] ?? null;
                if (!currentCategory) {
                    return {
                        source: "remote",
                        rootCategories: [],
                        currentCategory: null,
                        subCategories: [],
                        categoryProducts: [],
                        selectedCategoryId: "",
                    };
                }
                const remoteProducts = (0, browse_2.adaptSearchProducts)(await homeApi.searchProducts({
                    categoryId: toRemoteId(currentCategory.id),
                    sortType: "sales_desc",
                    pageIndex: 1,
                    pageSize: 6,
                }), favoriteIds);
                return {
                    source: "remote",
                    rootCategories: remoteCategories,
                    currentCategory,
                    subCategories: currentCategory.children,
                    categoryProducts: remoteProducts.slice(0, 3),
                    selectedCategoryId: currentCategory.id,
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                        ...(0, category_1.getCategoryPageData)(categoryId, favoriteIds),
                    };
                }
                throw error;
            }
        },
        async getFavoriteShellData(favoriteIds = (0, storage_1.getFavoriteIds)()) {
            return {
                source: "mock",
                favoriteProducts: (0, browse_1.getFavoriteProducts)(favoriteIds),
            };
        },
        async getSearchFilterShell() {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return buildMockSearchFilterShell();
            }
            try {
                const [categories, simpleItems, treeItems] = await Promise.all([
                    homeApi.getCategories(),
                    homeApi.getDictSimpleList(),
                    homeApi.getDictTreeList(),
                ]);
                const rootCategories = buildRemoteRootCategories(categories);
                const remoteFilterOptions = adaptFilterOptions(simpleItems, treeItems, {
                    priceOptions: browse_1.priceFilterOptions,
                    quantityOptions: browse_1.minOrderFilterOptions,
                    materialOptions: browse_1.materialFilterOptions,
                });
                return {
                    source: "remote",
                    relatedCategories: buildRelatedCategories(rootCategories),
                    sortOptions: browse_1.sortOptions,
                    priceOptions: remoteFilterOptions.priceOptions,
                    quantityOptions: remoteFilterOptions.quantityOptions,
                    materialOptions: remoteFilterOptions.materialOptions,
                    filterState: { ...browse_1.defaultSearchFilterState },
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return buildMockSearchFilterShell();
                }
                throw error;
            }
        },
    };
}
