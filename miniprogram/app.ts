import { getApiConfig } from "./api/config";

const apiConfig = getApiConfig();

App({
  globalData: {
    appName: "ConstructMarket",
    currentEnv: apiConfig.mode,
    apiBaseUrl: apiConfig.baseUrl,
  },
  onLaunch() {
    console.info(`ConstructMarket miniapp scaffold launched in ${apiConfig.mode} mode`);
  },
});
