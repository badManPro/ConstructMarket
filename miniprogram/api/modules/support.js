"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupportApi = createSupportApi;
const request_1 = require("../request");
function createSupportApi(dependencies = {}) {
    const config = dependencies.config;
    return {
        postConsultMessage(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/consult-messages",
                method: "POST",
                data,
                config,
            });
        },
        uploadFile(data) {
            return (0, request_1.apiRequest)({
                path: "/v1/app/file/upload",
                method: "POST",
                data,
                config,
            });
        },
    };
}
