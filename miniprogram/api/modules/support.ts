import { apiRequest } from "../request";
import type { ApiConfig } from "../config";

type SupportApiDependencies = {
  config?: Partial<ApiConfig>;
};

export function createSupportApi(dependencies: SupportApiDependencies = {}) {
  const config = dependencies.config;

  return {
    postConsultMessage(data: Record<string, unknown>) {
      return apiRequest<void>({
        path: "/v1/app/consult-messages",
        method: "POST",
        data,
        config,
      });
    },
    uploadFile(data: Record<string, unknown>) {
      return apiRequest<Record<string, unknown>>({
        path: "/v1/app/file/upload",
        method: "POST",
        data,
        config,
      });
    },
  };
}

export type SupportApi = ReturnType<typeof createSupportApi>;
