import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type HomeApiDependencies = {
  config?: Partial<ApiConfig>;
};

function buildQueryPath(path: string, params: Record<string, unknown>) {
  const queryParts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
        }
      });
      return;
    }

    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });

  const query = queryParts.join("&");
  return query ? `${path}?${query}` : path;
}

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
    getBrands() {
      return apiRequest<unknown[]>({
        path: "/v1/app/home/brands",
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
        path: buildQueryPath("/v1/app/home/search-products", data),
        method: "POST",
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
