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
const trade_1 = require("../api/modules/trade");
const storage_2 = require("../utils/storage");
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
        brandOptions: browse_1.brandFilterOptions,
        sortOptions: browse_1.sortOptions,
        priceOptions: browse_1.priceFilterOptions,
        quantityOptions: browse_1.minOrderFilterOptions,
        materialOptions: browse_1.materialFilterOptions,
        filterState: { ...browse_1.defaultSearchFilterState },
    };
}
function buildMockFavoriteShellData(favoriteIds) {
    return {
        source: "mock",
        favoriteProducts: (0, browse_1.getFavoriteProducts)(favoriteIds),
    };
}
function countRemoteCartItems(input) {
    return toRecordArray(input).reduce((total, item) => total + pickNumber(item, ["quantity"], 0), 0);
}
function findSelectedSkuOption(product, selectedSkuCode) {
    const skuOptions = Array.isArray(product.skuOptions)
        ? product.skuOptions.filter((item) => Boolean(item?.skuCode))
        : [];
    if (!skuOptions.length) {
        return null;
    }
    if (selectedSkuCode) {
        const matched = skuOptions.find((item) => item.skuCode === selectedSkuCode || item.skuId === selectedSkuCode);
        if (matched) {
            return matched;
        }
    }
    return skuOptions[0];
}
function buildCartSnapshotJson(params) {
    const payload = {
        productId: params.product.id ?? "",
        productName: params.product.name ?? "",
        skuCode: params.selectedSku?.skuCode ?? params.product.skuId ?? "",
        specText: params.selectedSpecText,
        quantity: params.quantity,
    };
    return JSON.stringify(payload);
}
function buildRemoteCartPayload(params) {
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
function buildMockCartItem(params) {
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
function ensureBrandOptions(options, fallback) {
    if (options.length) {
        return options;
    }
    return fallback;
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
function refineSearchProducts(products, params) {
    const keyword = params.keyword.trim().toLowerCase();
    const selectedBrandIds = params.selectedBrandIds ?? [];
    let next = products.filter((item) => {
        const matchesKeyword = !keyword ||
            [item.name, item.brand, item.model, item.categoryName]
                .join(" ")
                .toLowerCase()
                .includes(keyword);
        const matchesCategory = params.categoryId === "all" || item.categoryId === params.categoryId;
        const matchesBrand = !selectedBrandIds.length ||
            selectedBrandIds.includes(item.brandId ?? item.brand);
        const matchesPrice = params.filterState.priceRange === "all" ||
            (params.filterState.priceRange === "budget" && item.price < 100) ||
            (params.filterState.priceRange === "mid" && item.price >= 100 && item.price < 200) ||
            (params.filterState.priceRange === "premium" && item.price >= 200);
        const matchesOrder = params.filterState.minOrder === "all" ||
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
    const tradeApi = {
        ...(0, trade_1.createTradeApi)({ config }),
        ...(dependencies.tradeApi ?? {}),
    };
    return {
        async getHomePageData(favoriteIds) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return buildMockHomePageData(favoriteIds ?? (0, storage_1.getFavoriteIds)());
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
                    campaignProducts: (0, browse_2.adaptSearchProducts)(newArrivalProducts),
                    hotProducts: (0, browse_2.adaptSearchProducts)(hotRecommendProducts),
                    articleEntrances: (0, browse_2.adaptArticleEntrances)(newsArticles),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return buildMockHomePageData(favoriteIds ?? (0, storage_1.getFavoriteIds)());
                }
                throw error;
            }
        },
        async searchProductsPage(params) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    productList: (0, browse_1.searchProducts)({
                        ...params,
                        favoriteIds: params.favoriteIds ?? (0, storage_1.getFavoriteIds)(),
                    }),
                };
            }
            try {
                const remoteList = await homeApi.searchProducts(buildRemoteSearchParams(params));
                const remoteProducts = (0, browse_2.adaptSearchProducts)(remoteList);
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
                            favoriteIds: params.favoriteIds ?? (0, storage_1.getFavoriteIds)(),
                        }),
                    };
                }
                throw error;
            }
        },
        async getProductPageData(productId, favoriteIds) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                const localFavoriteIds = favoriteIds ?? (0, storage_1.getFavoriteIds)();
                return {
                    source: "mock",
                    product: (0, browse_1.getProductDetail)(productId, localFavoriteIds),
                    recommendedProducts: (0, browse_1.getRecommendedProducts)(productId, localFavoriteIds),
                };
            }
            try {
                const detail = await productApi.getProductDetail(productId);
                const detailRecord = isRecord(detail) ? detail : {};
                const detailProduct = isRecord(detailRecord.product) ? detailRecord.product : {};
                const merchantFromDetail = isRecord(detailRecord.merchant) ? detailRecord.merchant : {};
                const merchantId = pickString(merchantFromDetail, ["id", "merchantId"], pickString(detailProduct, ["merchantId"], ""));
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
                const product = (0, browse_2.adaptProductDetail)(detailRecord, specs, merchant, []);
                const fallbackRecommendations = (0, browse_1.getRecommendedProducts)(productId, favoriteIds ?? []);
                return {
                    source: "remote",
                    product: product ?? (0, browse_1.getProductDetail)(productId, favoriteIds ?? []),
                    recommendedProducts: recommendedList && product
                        ? (0, browse_2.adaptSearchProducts)(recommendedList)
                            .filter((item) => item.id !== product.id)
                            .slice(0, 3)
                        : fallbackRecommendations,
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    const localFavoriteIds = favoriteIds ?? (0, storage_1.getFavoriteIds)();
                    return {
                        source: "mock",
                        product: (0, browse_1.getProductDetail)(productId, localFavoriteIds),
                        recommendedProducts: (0, browse_1.getRecommendedProducts)(productId, localFavoriteIds),
                    };
                }
                throw error;
            }
        },
        async toggleProductFavorite(productId, isFavorite) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                const nextFavorites = (0, storage_2.toggleFavoriteId)(productId);
                return {
                    source: "mock",
                    nextIsFavorite: nextFavorites.includes(productId),
                };
            }
            try {
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
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    const nextFavorites = (0, storage_2.toggleFavoriteId)(productId);
                    return {
                        source: "mock",
                        nextIsFavorite: nextFavorites.includes(productId),
                    };
                }
                throw error;
            }
        },
        async addProductToCart(params) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    cartPreviewCount: (0, storage_2.addCartItem)(buildMockCartItem({
                        product: params.product,
                        quantity: params.quantity,
                        selectedSpecText: params.selectedSpecText,
                        selectedSkuCode: params.selectedSkuCode,
                    })),
                };
            }
            try {
                const createdItem = await tradeApi.addCartItem(buildRemoteCartPayload(params));
                const remoteCart = await tradeApi.getCart().catch(() => [createdItem]);
                return {
                    source: "remote",
                    cartPreviewCount: countRemoteCartItems(remoteCart),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                        cartPreviewCount: (0, storage_2.addCartItem)(buildMockCartItem({
                            product: params.product,
                            quantity: params.quantity,
                            selectedSpecText: params.selectedSpecText,
                            selectedSkuCode: params.selectedSkuCode,
                        })),
                    };
                }
                throw error;
            }
        },
        async recordProductBrowse(productId, browseSourceCode = "PRODUCT_DETAIL") {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                };
            }
            try {
                await productApi.addBrowseLog(productId, browseSourceCode);
                return {
                    source: "remote",
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return {
                        source: "mock",
                    };
                }
                throw error;
            }
        },
        async getCategoryShellData(categoryId, favoriteIds) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return {
                    source: "mock",
                    ...(0, category_1.getCategoryPageData)(categoryId, favoriteIds ?? (0, storage_1.getFavoriteIds)()),
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
                }));
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
                        ...(0, category_1.getCategoryPageData)(categoryId, favoriteIds ?? (0, storage_1.getFavoriteIds)()),
                    };
                }
                throw error;
            }
        },
        async getFavoriteShellData(favoriteIds) {
            if (!(0, config_1.shouldUseRemote)(config)) {
                return buildMockFavoriteShellData(favoriteIds ?? (0, storage_1.getFavoriteIds)());
            }
            try {
                return {
                    source: "remote",
                    favoriteProducts: (0, browse_2.adaptFavoriteProducts)(await profileApi.getProductFavorites()),
                };
            }
            catch (error) {
                if ((0, config_1.shouldAllowMockFallback)(config)) {
                    return buildMockFavoriteShellData(favoriteIds ?? (0, storage_1.getFavoriteIds)());
                }
                throw error;
            }
        },
        async getSearchFilterShell() {
            if (!(0, config_1.shouldUseRemote)(config)) {
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
                    priceOptions: browse_1.priceFilterOptions,
                    quantityOptions: browse_1.minOrderFilterOptions,
                    materialOptions: browse_1.materialFilterOptions,
                });
                return {
                    source: "remote",
                    relatedCategories: buildRelatedCategories(rootCategories),
                    brandOptions: ensureBrandOptions((0, browse_2.adaptBrandOptions)(brands), browse_1.brandFilterOptions),
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
