"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./api/config");
const apiConfig = (0, config_1.getApiConfig)();
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
