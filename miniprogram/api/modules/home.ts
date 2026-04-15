import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type HomeApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createHomeApi(dependencies: HomeApiDependencies = {}) {
  const config = dependencies.config;

  return {
    getBanners() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/banners",
        method: "GET",
        config,
        requireAuth: false,
      });
    },
    getCategories() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/categories",
        method: "GET",
        config,
        requireAuth: false,
      });
    },
    getNewArrivalProducts() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/new-arrival-products",
        method: "GET",
        config,
        requireAuth: false,
      });
    },
    getHotRecommendProducts() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/hot-recommend-products",
        method: "GET",
        config,
        requireAuth: false,
      });
    },
    getNewsArticles() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/news-articles",
        method: "GET",
        config,
        requireAuth: false,
      });
    },
    searchProducts(data: Record<string, unknown>) {
      return apiRequest<unknown>({
        path: "/v1/app/home/search-products",
        method: "POST",
        data,
        config,
        requireAuth: false,
      });
    },
    getDictSimpleList(params: Record<string, unknown> = {}) {
      return apiRequest<unknown[]>({
        path: "/v1/app/dict/simple-list",
        method: "GET",
        data: params,
        config,
        requireAuth: false,
      });
    },
    getDictTreeList(params: Record<string, unknown> = {}) {
      return apiRequest<unknown[]>({
        path: "/v1/app/dict/tree-list",
        method: "GET",
        data: params,
        config,
        requireAuth: false,
      });
    },
  };
}

export type HomeApi = ReturnType<typeof createHomeApi>;
