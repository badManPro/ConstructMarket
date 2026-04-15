"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_runtime_1 = require("./app-runtime");
const globalData = (0, app_runtime_1.createInitialGlobalData)();
App({
    globalData,
    refreshRuntimeConfig() {
        return (0, app_runtime_1.applyApiRuntimeConfig)(globalData);
    },
    onLaunch() {
        const apiConfig = (0, app_runtime_1.applyApiRuntimeConfig)(globalData);
        console.info(`ConstructMarket miniapp scaffold launched in ${apiConfig.mode} mode`);
    },
    onShow() {
        (0, app_runtime_1.applyApiRuntimeConfig)(globalData);
    },
});
