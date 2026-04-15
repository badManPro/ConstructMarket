import { DEFAULT_API_BASE_URL, DEFAULT_API_MODE, getApiConfig, type ApiMode } from "./api/config";

export type AppGlobalData = {
  appName: string;
  currentEnv: ApiMode;
  apiBaseUrl: string;
};

export function createInitialGlobalData(): AppGlobalData {
  return {
    appName: "ConstructMarket",
    currentEnv: DEFAULT_API_MODE,
    apiBaseUrl: DEFAULT_API_BASE_URL,
  };
}

export function applyApiRuntimeConfig(globalData: AppGlobalData) {
  const apiConfig = getApiConfig();

  globalData.currentEnv = apiConfig.mode;
  globalData.apiBaseUrl = apiConfig.baseUrl;

  return apiConfig;
}
