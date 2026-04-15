"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContentApi = createContentApi;
const request_1 = require("../request");
function createContentApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        getNewsPage(data = {}) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/news/page",
                method: "POST",
                data,
                config,
                requireAuth: false,
            });
        },
    };
}
