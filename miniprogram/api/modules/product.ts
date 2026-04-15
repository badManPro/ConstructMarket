import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type ProductApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createProductApi(dependencies: ProductApiDependencies = {}) {
  const config = dependencies.config;

  return {
    getProductDetail(productId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/product/detail",
        method: "GET",
        data: {
          productId,
        },
        config,
        requireAuth: false,
      });
    },
    getProductSpecs(productId: string) {
      return apiRequest<unknown[]>({
        path: "/v1/app/product/specs",
        method: "GET",
        data: {
          productId,
        },
        config,
        requireAuth: false,
      });
    },
    getMerchantDetail(merchantId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/merchant/detail",
        method: "GET",
        data: {
          merchantId,
        },
        config,
        requireAuth: false,
      });
    },
    addBrowseLog(productId: string) {
      return apiRequest<void>({
        path: `/v1/app/user/browse/${productId}`,
        method: "POST",
        config,
      });
    },
  };
}

export type ProductApi = ReturnType<typeof createProductApi>;
