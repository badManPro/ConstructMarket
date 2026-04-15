"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToRoute = navigateToRoute;
exports.navigateWithParams = navigateWithParams;
const routes_1 = require("../constants/routes");
function navigateToRoute(route) {
    const normalized = route.startsWith("/") ? route : `/${route}`;
    const routeKey = normalized.slice(1);
    if (routes_1.TAB_ROUTES.has(routeKey)) {
        wx.switchTab({ url: normalized });
        return;
    }
    wx.navigateTo({ url: normalized });
}
function navigateWithParams(route, params = {}) {
    const query = Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join("&");
    const target = query ? `${route}?${query}` : route;
    navigateToRoute(target);
}
