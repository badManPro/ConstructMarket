import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type ContentApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createContentApi(dependencies: ContentApiDependencies = {}) {
  const config = dependencies.config;

  return {
    getNewsPage(data: Record<string, unknown> = {}) {
      return apiRequest<unknown>({
        path: "/v1/app/news/page",
        method: "POST",
        data,
        config,
        requireAuth: false,
      });
    },
  };
}

export type ContentApi = ReturnType<typeof createContentApi>;
