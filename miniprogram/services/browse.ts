import {
  articleEntrances,
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
import { getCategoryPageData } from "../mock/category";
import type { SearchFilterState } from "../types/models";
import { getFavoriteIds } from "../utils/storage";
import { getApiConfig, shouldAllowMockFallback, shouldUseRemote, type ApiConfig } from "../api/config";
import { adaptArticleEntrances, adaptBannerCards, adaptCategoryShortcuts, adaptProductDetail, adaptSearchProducts } from "../api/adapters/browse";
import { createHomeApi, type HomeApi } from "../api/modules/home";
import { createProductApi, type ProductApi } from "../api/modules/product";
import { createProfileApi, type ProfileApi } from "../api/modules/profile";

type BrowseServiceDependencies = {
  config?: Partial<ApiConfig>;
  homeApi?: Partial<HomeApi>;
  productApi?: Partial<ProductApi>;
  profileApi?: Partial<ProfileApi>;
};

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

  return {
    async getHomePageData(favoriteIds: string[] = []) {
      if (!shouldUseRemote(config)) {
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
          source: "remote" as const,
          keywordSuggestions: hotSearchKeywords,
          banners: adaptBannerCards(banners),
          categoryNav: adaptCategoryShortcuts(categories),
          campaignProducts: adaptSearchProducts(newArrivalProducts, favoriteIds),
          hotProducts: adaptSearchProducts(hotRecommendProducts, favoriteIds),
          articleEntrances: adaptArticleEntrances(newsArticles),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return buildMockHomePageData(favoriteIds);
        }

        throw error;
      }
    },
    async searchProductsPage(params: {
      keyword: string;
      categoryId: string;
      sortOption: string;
      filterState: SearchFilterState;
      favoriteIds?: string[];
    }) {
      const favoriteIds = params.favoriteIds ?? getFavoriteIds();

      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          productList: searchProducts({
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
          source: "remote" as const,
          productList: adaptSearchProducts(remoteList, favoriteIds),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
            productList: searchProducts({
              ...params,
              favoriteIds,
            }),
          };
        }

        throw error;
      }
    },
    async getProductPageData(productId: string, favoriteIds: string[] = getFavoriteIds()) {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          product: getProductDetail(productId, favoriteIds),
          recommendedProducts: getRecommendedProducts(productId, favoriteIds),
        };
      }

      try {
        const detail = await productApi.getProductDetail(productId);
        const product = adaptProductDetail(detail, await productApi.getProductSpecs(productId), {}, favoriteIds);

        return {
          source: "remote" as const,
          product: product ?? getProductDetail(productId, favoriteIds),
          recommendedProducts: getRecommendedProducts(productId, favoriteIds),
        };
      } catch (error) {
        if (shouldAllowMockFallback(config)) {
          return {
            source: "mock" as const,
            product: getProductDetail(productId, favoriteIds),
            recommendedProducts: getRecommendedProducts(productId, favoriteIds),
          };
        }

        throw error;
      }
    },
    async toggleProductFavorite(productId: string, isFavorite: boolean) {
      if (!shouldUseRemote(config)) {
        return {
          source: "mock" as const,
          nextIsFavorite: !isFavorite,
        };
      }

      if (isFavorite) {
        await profileApi.removeProductFavorite(productId);
      } else {
        await profileApi.addProductFavorite(productId);
      }

      return {
        source: "remote" as const,
        nextIsFavorite: !isFavorite,
      };
    },
    async getCategoryShellData(categoryId: string, favoriteIds: string[] = getFavoriteIds()) {
      return {
        source: "mock" as const,
        ...getCategoryPageData(categoryId, favoriteIds),
      };
    },
    async getFavoriteShellData(favoriteIds: string[] = getFavoriteIds()) {
      return {
        source: "mock" as const,
        favoriteProducts: getFavoriteProducts(favoriteIds),
      };
    },
    getSearchFilterShell() {
      return {
        source: "mock" as const,
        relatedCategories,
        sortOptions,
        priceOptions: priceFilterOptions,
        quantityOptions: minOrderFilterOptions,
        materialOptions: materialFilterOptions,
        filterState: { ...defaultSearchFilterState },
      };
    },
  };
}
