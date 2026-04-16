"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHomeApi = createHomeApi;
const request_1 = require("../request");
function buildQueryPath(path, params) {
    const queryParts = [];
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== undefined && item !== null && item !== "") {
                    queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
                }
            });
            return;
        }
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    });
    const query = queryParts.join("&");
    return query ? `${path}?${query}` : path;
}
function createHomeApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        getBanners() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/banners",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        getCategories() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/categories",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        getBrands() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/brands",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        getNewArrivalProducts() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/new-arrival-products",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        getHotRecommendProducts() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/hot-recommend-products",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        getNewsArticles() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/home/news-articles",
                method: "GET",
                config,
                requireAuth: false,
            });
        },
        searchProducts(data) {
            return (0, request_1.apiRequest)({
                path: buildQueryPath("/v1/app/home/search-products", data),
                method: "POST",
                config,
                requireAuth: false,
            });
        },
        getDictSimpleList(params = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/dict/simple-list",
                method: "GET",
                data: params,
                config,
                requireAuth: false,
            });
        },
        getDictTreeList(params = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/dict/tree-list",
                method: "GET",
                data: params,
                config,
                requireAuth: false,
            });
        },
    };
}
