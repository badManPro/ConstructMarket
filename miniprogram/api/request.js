"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRequestError = void 0;
exports.apiRequest = apiRequest;
const config_1 = require("./config");
class ApiRequestError extends Error {
    constructor(params) {
        super(params.message);
        this.name = "ApiRequestError";
        this.kind = params.kind;
        this.code = params.code ?? null;
        this.statusCode = params.statusCode ?? null;
        this.payload = params.payload;
    }
}
exports.ApiRequestError = ApiRequestError;
const SUCCESS_CODES = new Set([0, 200, "0", "200", "00000"]);
function buildRequestUrl(baseUrl, path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
}
function resolveHeaders(token, requireAuth, header) {
    const nextHeader = {
        "content-type": "application/json",
        ...(header ?? {}),
    };
    if (requireAuth && token) {
        nextHeader.Authorization = `Bearer ${token}`;
    }
    return nextHeader;
}
function isPlainObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function unwrapApiResponse(payload) {
    if (!isPlainObject(payload)) {
        return payload;
    }
    const code = payload.code;
    const message = (typeof payload.msg === "string" && payload.msg) ||
        (typeof payload.message === "string" && payload.message) ||
        "接口请求失败";
    if (typeof payload.success === "boolean") {
        if (!payload.success) {
            throw new ApiRequestError({
                message,
                kind: "business",
                code: code ?? null,
                payload,
            });
        }
        return (payload.data ?? payload.result ?? payload);
    }
    if (code !== undefined) {
        if (!SUCCESS_CODES.has(code)) {
            throw new ApiRequestError({
                message,
                kind: "business",
                code,
                payload,
            });
        }
        return (payload.data ?? payload.result ?? payload);
    }
    return (payload.data ?? payload.result ?? payload);
}
function createWxRequestTransport() {
    return async (options) => {
        const wxLike = globalThis.wx;
        if (!wxLike || typeof wxLike.request !== "function") {
            throw new ApiRequestError({
                message: "当前环境未注入 wx.request",
                kind: "config",
            });
        }
        return new Promise((resolve, reject) => {
            wxLike.request?.({
                ...options,
                success: resolve,
                fail: reject,
            });
        });
    };
}
async function apiRequest(options) {
    const config = (0, config_1.getApiConfig)(options.config ?? {});
    const transport = options.transport ?? createWxRequestTransport();
    const method = options.method ?? "GET";
    const requireAuth = options.requireAuth ?? true;
    try {
        const response = await transport({
            url: buildRequestUrl(config.baseUrl, options.path),
            method,
            data: options.data,
            timeout: options.timeout ?? config.timeout,
            header: resolveHeaders(config.token, requireAuth, options.header),
        });
        if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new ApiRequestError({
                message: `HTTP ${response.statusCode}`,
                kind: "http",
                statusCode: response.statusCode,
                payload: response.data,
            });
        }
        return unwrapApiResponse(response.data);
    }
    catch (error) {
        if (error instanceof ApiRequestError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : "网络请求失败";
        throw new ApiRequestError({
            message,
            kind: "network",
            payload: error,
        });
    }
}
