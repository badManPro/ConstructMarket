import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type ProductApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createProductApi(dependencies: ProductApiDependencies = {}) {
  const config = dependencies.config;
  const buildBrowsePath = (productId: string, browseSourceCode?: string) =>
    browseSourceCode
      ? `/v1/app/user/browse/${productId}?browseSourceCode=${encodeURIComponent(browseSourceCode)}`
      : `/v1/app/user/browse/${productId}`;

  return {
    getProductDetail(productId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/product/detail",
        method: "GET",
        data: {
          productId,
        },
        config,
      });
    },
    getProductSpecs(productId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/product/specs",
        method: "GET",
        data: {
          productId,
        },
        config,
      });
    },
    getMerchantDetail(merchantId: string) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/merchant/detail",
        method: "GET",
        data: {
          id: merchantId,
        },
        config,
      });
    },
    addBrowseLog(productId: string, browseSourceCode?: string) {
      return apiRequest<Record<string, unknown>>({
        path: buildBrowsePath(productId, browseSourceCode),
        method: "POST",
        config,
      });
    },
  };
}

export type ProductApi = ReturnType<typeof createProductApi>;
