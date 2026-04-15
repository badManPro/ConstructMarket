"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_TOKEN_STORAGE_KEY = exports.API_MODE_STORAGE_KEY = exports.API_BASE_URL_STORAGE_KEY = exports.DEFAULT_REQUEST_TIMEOUT = exports.DEFAULT_API_MODE = exports.DEFAULT_API_BASE_URL = void 0;
exports.normalizeBaseUrl = normalizeBaseUrl;
exports.normalizeApiMode = normalizeApiMode;
exports.resolveApiToken = resolveApiToken;
exports.getApiConfig = getApiConfig;
exports.shouldUseRemote = shouldUseRemote;
exports.shouldAllowMockFallback = shouldAllowMockFallback;
exports.DEFAULT_API_BASE_URL = "http://106.15.108.65:8085/api";
exports.DEFAULT_API_MODE = "mock";
exports.DEFAULT_REQUEST_TIMEOUT = 12000;
exports.API_BASE_URL_STORAGE_KEY = "constructmarket_api_base_url";
exports.API_MODE_STORAGE_KEY = "constructmarket_api_mode";
exports.DEV_TOKEN_STORAGE_KEY = "constructmarket_dev_token";
function readStorageValue(key) {
    const wxLike = globalThis.wx;
    if (!wxLike || typeof wxLike.getStorageSync !== "function") {
        return undefined;
    }
    try {
        return wxLike.getStorageSync(key);
    }
    catch {
        return undefined;
    }
}
function normalizeBaseUrl(baseUrl) {
    const normalized = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (normalized || exports.DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}
function normalizeApiMode(mode) {
    if (mode === "remote" || mode === "hybrid" || mode === "mock") {
        return mode;
    }
    return exports.DEFAULT_API_MODE;
}
function resolveApiToken(token) {
    const explicit = typeof token === "string" ? token.trim() : "";
    if (explicit) {
        return explicit;
    }
    const stored = readStorageValue(exports.DEV_TOKEN_STORAGE_KEY);
    return typeof stored === "string" ? stored.trim() : "";
}
function getApiConfig(overrides = {}) {
    const storedBaseUrl = readStorageValue(exports.API_BASE_URL_STORAGE_KEY);
    const storedMode = readStorageValue(exports.API_MODE_STORAGE_KEY);
    return {
        baseUrl: normalizeBaseUrl(overrides.baseUrl ?? (typeof storedBaseUrl === "string" ? storedBaseUrl : undefined)),
        mode: normalizeApiMode(overrides.mode ?? (typeof storedMode === "string" ? storedMode : undefined)),
        token: resolveApiToken(overrides.token),
        timeout: typeof overrides.timeout === "number" && Number.isFinite(overrides.timeout) ? overrides.timeout : exports.DEFAULT_REQUEST_TIMEOUT,
    };
}
function shouldUseRemote(config) {
    return config.mode === "remote" || config.mode === "hybrid";
}
function shouldAllowMockFallback(config) {
    return config.mode !== "remote";
}
