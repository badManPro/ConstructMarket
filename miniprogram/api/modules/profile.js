"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileApi = createProfileApi;
const request_1 = require("../request");
function createProfileApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        getUserHomePage() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/home-page",
                method: "GET",
                config,
            });
        },
        getUserInfo() {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/info",
                method: "GET",
                config,
            });
        },
        updateUserInfo(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/info",
                method: "PUT",
                data,
                config,
            });
        },
        getProductFavorites(params = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/favorite/product-favorites",
                method: "GET",
                data: params,
                config,
            });
        },
        addProductFavorite(productId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/favorite/product-favorites/${productId}`,
                method: "POST",
                config,
            });
        },
        removeProductFavorite(productId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/favorite/product-favorites/${productId}`,
                method: "DELETE",
                config,
            });
        },
        submitRealAuth(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/user/real-auth",
                method: "POST",
                data,
                config,
            });
        },
    };
}
