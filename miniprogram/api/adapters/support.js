"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptUploadResult = adaptUploadResult;
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function adaptUploadResult(input) {
    if (!isRecord(input)) {
        return {
            url: "",
            fileId: "",
        };
    }
    return {
        url: (typeof input.url === "string" && input.url) ||
            (typeof input.fileUrl === "string" && input.fileUrl) ||
            "",
        fileId: (typeof input.fileId === "string" && input.fileId) ||
            (typeof input.id === "string" && input.id) ||
            "",
    };
}
