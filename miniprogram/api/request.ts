import { getApiConfig, type ApiConfig } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestHeader = Record<string, string>;

type RequestTransportOptions = {
  url: string;
  method: HttpMethod;
  data?: unknown;
  timeout: number;
  header: RequestHeader;
};

type RequestTransportResponse<T = unknown> = {
  statusCode: number;
  data: T;
  header?: Record<string, string>;
};

export type RequestTransport = <T = unknown>(
  options: RequestTransportOptions,
) => Promise<RequestTransportResponse<T>>;

export type ApiRequestOptions = {
  path: string;
  method?: HttpMethod;
  data?: unknown;
  header?: RequestHeader;
  requireAuth?: boolean;
  timeout?: number;
  config?: Partial<ApiConfig>;
  transport?: RequestTransport;
};

export type ApiRequestErrorKind = "http" | "business" | "network" | "config";

export class ApiRequestError extends Error {
  code: number | string | null;
  statusCode: number | null;
  kind: ApiRequestErrorKind;
  payload: unknown;

  constructor(params: {
    message: string;
    kind: ApiRequestErrorKind;
    code?: number | string | null;
    statusCode?: number | null;
    payload?: unknown;
  }) {
    super(params.message);
    this.name = "ApiRequestError";
    this.kind = params.kind;
    this.code = params.code ?? null;
    this.statusCode = params.statusCode ?? null;
    this.payload = params.payload;
  }
}

const SUCCESS_CODES = new Set<number | string>([0, 200, "0", "200", "00000"]);

function buildRequestUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function resolveHeaders(token: string, requireAuth: boolean, header?: RequestHeader): RequestHeader {
  const nextHeader: RequestHeader = {
    "content-type": "application/json",
    ...(header ?? {}),
  };

  if (requireAuth && token) {
    nextHeader.Authorization = `Bearer ${token}`;
  }

  return nextHeader;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function unwrapApiResponse<T>(payload: unknown): T {
  if (!isPlainObject(payload)) {
    return payload as T;
  }

  const code = payload.code as number | string | undefined;
  const message =
    (typeof payload.msg === "string" && payload.msg) ||
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

    return (payload.data ?? payload.result ?? payload) as T;
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

    return (payload.data ?? payload.result ?? payload) as T;
  }

  return (payload.data ?? payload.result ?? payload) as T;
}

function createWxRequestTransport(): RequestTransport {
  return async <T>(options: RequestTransportOptions) => {
    const wxLike = (globalThis as {
      wx?: {
        request?: (requestOptions: {
          url: string;
          method: HttpMethod;
          data?: unknown;
          timeout: number;
          header: RequestHeader;
          success: (response: RequestTransportResponse<T>) => void;
          fail: (error: unknown) => void;
        }) => void;
      };
    }).wx;

    if (!wxLike || typeof wxLike.request !== "function") {
      throw new ApiRequestError({
        message: "当前环境未注入 wx.request",
        kind: "config",
      });
    }

    return new Promise<RequestTransportResponse<T>>((resolve, reject) => {
      wxLike.request?.({
        ...options,
        success: resolve,
        fail: reject,
      });
    });
  };
}

export async function apiRequest<T>(options: ApiRequestOptions): Promise<T> {
  const config = getApiConfig(options.config ?? {});
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

    return unwrapApiResponse<T>(response.data);
  } catch (error) {
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
