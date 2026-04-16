"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const navigate_1 = require("../../utils/navigate");
function decodePageParam(value) {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) {
        return "";
    }
    try {
        return decodeURIComponent(raw);
    }
    catch {
        return raw;
    }
}
function isValidWebUrl(url) {
    return /^https?:\/\//i.test(url);
}
Page({
    data: {
        status: "loading",
        title: "活动详情",
        url: "",
        errorMessage: "",
    },
    onLoad(options) {
        const title = decodePageParam(options.title) || "活动详情";
        const url = decodePageParam(options.url);
        wx.setNavigationBarTitle({
            title,
        });
        if (!isValidWebUrl(url)) {
            this.setData({
                status: "error",
                title,
                url: "",
                errorMessage: "链接无效，暂时无法打开外部页面。",
            });
            return;
        }
        this.setData({
            status: "ready",
            title,
            url,
            errorMessage: "",
        });
    },
    handleLoadError() {
        this.setData({
            status: "error",
            errorMessage: "页面加载失败，请确认业务域名已配置后再重试。",
        });
    },
    handleRetry() {
        if (!isValidWebUrl(this.data.url)) {
            return;
        }
        this.setData({
            status: "ready",
            errorMessage: "",
        });
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
            },
        });
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
});
