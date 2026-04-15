export type ApiMode = "mock" | "remote" | "hybrid";

export type ApiConfig = {
  baseUrl: string;
  mode: ApiMode;
  token: string;
  timeout: number;
};

export const DEFAULT_API_BASE_URL = "http://106.15.108.65:8085/api";
export const DEFAULT_API_MODE: ApiMode = "mock";
export const DEFAULT_REQUEST_TIMEOUT = 12000;

export const API_BASE_URL_STORAGE_KEY = "constructmarket_api_base_url";
export const API_MODE_STORAGE_KEY = "constructmarket_api_mode";
export const DEV_TOKEN_STORAGE_KEY = "constructmarket_dev_token";

function readStorageValue(key: string): unknown {
  const wxLike = (globalThis as { wx?: { getStorageSync?: (storageKey: string) => unknown } }).wx;

  if (!wxLike || typeof wxLike.getStorageSync !== "function") {
    return undefined;
  }

  try {
    return wxLike.getStorageSync(key);
  } catch {
    return undefined;
  }
}

export function normalizeBaseUrl(baseUrl?: string | null) {
  const normalized = typeof baseUrl === "string" ? baseUrl.trim() : "";
  return (normalized || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function normalizeApiMode(mode?: string | null): ApiMode {
  if (mode === "remote" || mode === "hybrid" || mode === "mock") {
    return mode;
  }

  return DEFAULT_API_MODE;
}

export function resolveApiToken(token?: string | null) {
  const explicit = typeof token === "string" ? token.trim() : "";
  if (explicit) {
    return explicit;
  }

  const stored = readStorageValue(DEV_TOKEN_STORAGE_KEY);
  return typeof stored === "string" ? stored.trim() : "";
}

export function getApiConfig(overrides: Partial<ApiConfig> = {}): ApiConfig {
  const storedBaseUrl = readStorageValue(API_BASE_URL_STORAGE_KEY);
  const storedMode = readStorageValue(API_MODE_STORAGE_KEY);

  return {
    baseUrl: normalizeBaseUrl(
      overrides.baseUrl ?? (typeof storedBaseUrl === "string" ? storedBaseUrl : undefined),
    ),
    mode: normalizeApiMode(overrides.mode ?? (typeof storedMode === "string" ? storedMode : undefined)),
    token: resolveApiToken(overrides.token),
    timeout: typeof overrides.timeout === "number" && Number.isFinite(overrides.timeout) ? overrides.timeout : DEFAULT_REQUEST_TIMEOUT,
  };
}

export function shouldUseRemote(config: ApiConfig) {
  return config.mode === "remote" || config.mode === "hybrid";
}

export function shouldAllowMockFallback(config: ApiConfig) {
  return config.mode !== "remote";
}
