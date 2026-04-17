"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductApi = createProductApi;
const request_1 = require("../request");
function createProductApi(dependencies = {}) {
    const config = dependencies.config;
    const buildBrowsePath = (productId, browseSourceCode) => browseSourceCode
        ? `/v1/app/user/browse/${productId}?browseSourceCode=${encodeURIComponent(browseSourceCode)}`
        : `/v1/app/user/browse/${productId}`;
    return {
        getProductDetail(productId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/product/detail",
                method: "GET",
                data: {
                    productId,
                },
                config,
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
            });
        },
        getMerchantDetail(merchantId) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/merchant/detail",
                method: "GET",
                data: {
                    id: merchantId,
                },
                config,
            });
        },
        addBrowseLog(productId, browseSourceCode) {
            return (0, request_1.apiRequest)({
                path: buildBrowsePath(productId, browseSourceCode),
                method: "POST",
                config,
            });
        },
    };
}
