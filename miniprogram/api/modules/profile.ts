import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type ProfileApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createProfileApi(dependencies: ProfileApiDependencies = {}) {
  const config = dependencies.config;

  return {
    getUserHomePage() {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/user/home-page",
        method: "GET",
        config,
      });
    },
    getUserInfo() {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/user/info",
        method: "GET",
        config,
      });
    },
    updateUserInfo(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/info",
        method: "PUT",
        data,
        config,
      });
    },
    getProductFavorites(params: Record<string, unknown> = {}) {
      return apiRequest<unknown>({
        path: "/v1/app/user/favorite/product-favorites",
        method: "GET",
        data: params,
        config,
      });
    },
    addProductFavorite(productId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/favorite/product-favorites/${productId}`,
        method: "POST",
        config,
      });
    },
    removeProductFavorite(productId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/favorite/product-favorites/${productId}`,
        method: "DELETE",
        config,
      });
    },
    submitRealAuth(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/user/real-auth",
        method: "POST",
        data,
        config,
      });
    },
  };
}

export type ProfileApi = ReturnType<typeof createProfileApi>;
