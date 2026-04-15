"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductApi = createProductApi;
const request_1 = require("../request");
function createProductApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        getProductDetail(productId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/product/detail",
                method: "GET",
                data: {
                    productId,
                },
                config,
                requireAuth: false,
            });
        },
        getProductSpecs(productId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/product/specs",
                method: "GET",
                data: {
                    productId,
                },
                config,
                requireAuth: false,
            });
        },
        getMerchantDetail(merchantId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/merchant/detail",
                method: "GET",
                data: {
                    merchantId,
                },
                config,
                requireAuth: false,
            });
        },
        addBrowseLog(productId) {
            return (0, request_1.apiRequest)({
                path: `/v1/app/user/browse/${productId}`,
                method: "POST",
                config,
            });
        },
    };
}
