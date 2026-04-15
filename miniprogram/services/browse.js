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
                const remoteList = await homeApi.searchProducts({
                    keyword: params.keyword,
                    categoryId: params.categoryId,
                    sortOption: params.sortOption,
                    ...params.filterState,
                });
                return {
                    source: "remote",
                    productList: (0, browse_2.adaptSearchProducts)(remoteList, favoriteIds),
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
            return {
                source: "mock",
                ...(0, category_1.getCategoryPageData)(categoryId, favoriteIds),
            };
        },
        async getFavoriteShellData(favoriteIds = (0, storage_1.getFavoriteIds)()) {
            return {
                source: "mock",
                favoriteProducts: (0, browse_1.getFavoriteProducts)(favoriteIds),
            };
        },
        getSearchFilterShell() {
            return {
                source: "mock",
                relatedCategories: browse_1.relatedCategories,
                sortOptions: browse_1.sortOptions,
                priceOptions: browse_1.priceFilterOptions,
                quantityOptions: browse_1.minOrderFilterOptions,
                materialOptions: browse_1.materialFilterOptions,
                filterState: { ...browse_1.defaultSearchFilterState },
            };
        },
    };
}
