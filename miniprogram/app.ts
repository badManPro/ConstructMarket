import { applyApiRuntimeConfig, createInitialGlobalData } from "./app-runtime";

const globalData = createInitialGlobalData();

App({
  globalData,
  refreshRuntimeConfig() {
    return applyApiRuntimeConfig(globalData);
  },
  onLaunch() {
    const apiConfig = applyApiRuntimeConfig(globalData);
    console.info(`ConstructMarket miniapp scaffold launched in ${apiConfig.mode} mode`);
  },
  onShow() {
    applyApiRuntimeConfig(globalData);
  },
});
