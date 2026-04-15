"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialGlobalData = createInitialGlobalData;
exports.applyApiRuntimeConfig = applyApiRuntimeConfig;
const config_1 = require("./api/config");
function createInitialGlobalData() {
    return {
        appName: "ConstructMarket",
        currentEnv: config_1.DEFAULT_API_MODE,
        apiBaseUrl: config_1.DEFAULT_API_BASE_URL,
    };
}
function applyApiRuntimeConfig(globalData) {
    const apiConfig = (0, config_1.getApiConfig)();
    globalData.currentEnv = apiConfig.mode;
    globalData.apiBaseUrl = apiConfig.baseUrl;
    return apiConfig;
}
