import {
  type AlovaGenerics,
  type AlovaMethodCommonConfig,
  type AlovaMethodCreateConfig,
  createAlova,
  type Method,
  type RequestBody,
} from "alova";
import adapterFetch, { type FetchRequestInit } from "alova/fetch";
import ReactHook from "alova/react";

export { globalConfig, invalidateCache, queryCache, setCache } from "alova";

// ============================================================================
// 1. 类型定义
// ============================================================================

/**
 * 全局请求相关配置，融合 fetch 的 RequestInit 与 alova 的请求配置。
 * 统一泛型：Responded = 业务数据本身（onSuccess 已剥离外层协议包裹）。
 */
export interface InstanceGenerics extends AlovaGenerics {
  RequestConfig: FetchRequestInit;
  Response: Response;
  ResponseHeader: Headers;
}

/** 一个已绑定类型的请求方法实例（可直接 await / .send()，也可传给 useRequest/useWatcher 等 hooks） */
export type RequestMethod<T = unknown> = Method<InstanceGenerics> & Promise<T>;

// ----------------------------------------------------------------------------
// 1.1 统一后端响应协议（可按项目实际结构调整，需与后端约定一致的字段）
// ----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  code: number;
  data?: T;
  message: string;
  success: boolean;
}

// ----------------------------------------------------------------------------
// 1.2 扩展请求配置：通过 meta 传递，避免污染 fetch RequestInit
// ----------------------------------------------------------------------------

export interface RequestMeta {
  /** 自定义业务成功码，默认 0 */
  successCode?: number;
  /** 响应解析方式。json 默认走统一业务协议校验；text/blob/arrayBuffer 原样返回 */
  responseType?: "json" | "text" | "blob" | "arrayBuffer";
  /** 跳过全局 401 处理（适用于登录等允许匿名的接口） */
  skipUnauthorized?: boolean;
  /** 跳过全局错误提示（业务侧自行处理错误时开启，如登录页） */
  silent?: boolean;
}

export type HttpConfig<T = unknown> = AlovaMethodCreateConfig<
  InstanceGenerics,
  T,
  T
> & {
  meta?: RequestMeta & AlovaMethodCreateConfig<InstanceGenerics, T, T>["meta"];
};

// ----------------------------------------------------------------------------
// 1.3 统一错误体系：区分网络/超时/HTTP/业务/取消，方便上层按类型兜底
// ----------------------------------------------------------------------------

export type RequestErrorKind =
  | "timeout" // 超时
  | "network" // 网络层失败（断网、DNS、CORS、fetch reject）
  | "http" // HTTP 状态码 >= 400
  | "business" // 业务码非成功
  | "cancel"; // 主动取消（method.abort()）

export interface RequestErrorOptions<T> {
  kind: RequestErrorKind;
  message: string;
  status?: number;
  code?: number;
  data?: T;
  cause?: unknown;
}

export class RequestError<T = unknown> extends Error {
  readonly kind: RequestErrorKind;
  readonly status?: number;
  readonly code?: number;
  readonly data?: T;

  constructor(options: RequestErrorOptions<T>) {
    super(
      options.message,
      options.cause ? { cause: options.cause } : undefined,
    );
    this.name = "RequestError";
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
  }
}

// ============================================================================
// 2. 全局配置与上下文
// ============================================================================

const TOKEN_KEY = "token"; // 与登录页约定的 localStorage 键
const AUTH_HEADER = "token"; // 后端约定的鉴权 header
const DEFAULT_TIMEOUT = 15_000; // 全局默认超时（毫秒）
const SUCCESS_CODE = 0;

// 鉴权 token：内存维护，首次读取时回退到 localStorage
let authToken: string | undefined;
const resolveToken = (): string => {
  if (authToken === undefined) {
    try {
      authToken = window.localStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      authToken = "";
    }
  }
  return authToken;
};

/** 设置/清除请求鉴权 token。登录成功后调用：setAuthToken(token) */
export const setAuthToken = (token: string | null) => {
  authToken = token ?? "";
};

// 全局 401 处理器（应用启动时通过 setOnUnauthorized 注册登出/跳登录逻辑）
let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let unauthorizedRunning = false;

export const setOnUnauthorized = (
  handler: (() => void | Promise<void>) | null,
) => {
  unauthorizedHandler = handler;
};

// 全局错误订阅：可用于统一日志上报 / 全局 Message 提示
type ErrorListener = (error: RequestError, method: RequestMethod) => void;

const errorListeners: ErrorListener[] = [];
export const onRequestError = (listener: ErrorListener) => {
  errorListeners.push(listener);
  return () => {
    const index = errorListeners.indexOf(listener);
    if (index >= 0) {
      errorListeners.splice(index, 1);
    }
  };
};

const emitRequestError = (error: RequestError, method: RequestMethod) => {
  for (const listener of errorListeners) {
    try {
      listener(error, method);
    } catch {
      // 订阅者自身的异常不允许影响请求链路
    }
  }
};

// 高并发下多个 401 只触发一次全局处理
const notifyUnauthorized = async () => {
  if (!unauthorizedHandler || unauthorizedRunning) {
    return;
  }
  unauthorizedRunning = true;
  try {
    await unauthorizedHandler();
  } finally {
    unauthorizedRunning = false;
  }
};

// ============================================================================
// 3. 内部工具
// ============================================================================

const parseResponseBody = (
  response: Response,
  meta?: RequestMeta,
): Promise<unknown> => {
  const type = meta?.responseType ?? "json";
  if (type === "blob") {
    return response.blob();
  }
  if (type === "text") {
    return response.text();
  }
  if (type === "arrayBuffer") {
    return response.arrayBuffer();
  }
  return response.text().then((text) => {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  });
};

const extractErrorMessage = (body: unknown, fallback: string): string => {
  if (body && typeof body === "object") {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message) {
      return message;
    }
  }
  return fallback;
};

/** 把 alova/fetch 层抛出的原始错误规范化为 RequestError */
const normalizeError = (error: unknown): RequestError => {
  if (error instanceof RequestError) {
    return error;
  }
  const raw = error as Error | undefined;
  const name = raw?.name ?? "";
  let kind: RequestErrorKind = "network";
  if (name === "AbortError") {
    kind = "cancel";
  } else if (
    name === "TimeoutError" ||
    raw?.message.includes("network timeout")
  ) {
    kind = "timeout";
  }
  return new RequestError({
    kind,
    message: raw?.message || "网络异常，请稍后重试",
    cause: raw,
  });
};

// ============================================================================
// 4. alova 实例
// ============================================================================

export const request = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/",
  requestAdapter: adapterFetch(),
  statesHook: ReactHook,
  // 生产环境默认不隐式缓存，数据时效性交给业务显式配置（cacheFor）
  cacheFor: null,
  timeout: DEFAULT_TIMEOUT,
  // 同一请求在并发时共享实例，避免重复发请求
  shareRequest: true,

  async beforeRequest(method) {
    const { headers } = method.config;
    // 注入鉴权 token（空值会被 fetch 适配器自动剔除 header）
    const token = resolveToken();
    if (token) {
      headers[AUTH_HEADER] = token;
    }
    // 默认携带 cookie，支持同源会话
    method.config.credentials ??= "include";
  },

  responded: {
    onSuccess: async (response, method) => {
      const meta = method.meta as RequestMeta | undefined;

      // 4.1 HTTP 层错误（>= 400）
      if (!response.ok) {
        const body = await parseResponseBody(response, meta).catch(() => null);
        const message = extractErrorMessage(
          body,
          response.statusText || `HTTP ${response.status}`,
        );
        if (response.status === 401 && !meta?.skipUnauthorized) {
          await notifyUnauthorized();
        }
        throw new RequestError({
          kind: "http",
          status: response.status,
          message,
          data: body,
        });
      }

      // 4.2 按 responseType 解析
      const type = meta?.responseType ?? "json";
      const rawBody = await parseResponseBody(response, meta);
      if (type !== "json") {
        return rawBody;
      }

      // 4.3 空响应 / 非 JSON 原样透传
      if (rawBody === null || typeof rawBody !== "object") {
        return rawBody;
      }

      // 4.4 业务协议校验
      const envelope = rawBody as ApiResponse<unknown>;
      const successCode = meta?.successCode ?? SUCCESS_CODE;
      const isSuccess = envelope.success || envelope.code === successCode;
      if (isSuccess) {
        return envelope.data;
      }

      throw new RequestError({
        kind: "business",
        code: envelope.code ?? successCode,
        message: envelope.message || "业务处理失败",
        data: rawBody,
      });
    },

    onError: (error, method) => {
      // 所有网络层/超时/取消错误统一规范化后抛给调用方，并广播给订阅者
      const normalized = normalizeError(error);
      emitRequestError(normalized, method as unknown as RequestMethod);
      throw normalized;
    },
  },
});

// ============================================================================
// 5. 对外 API
// ============================================================================

export const send = <T>(method: RequestMethod<T>): Promise<T> =>
  method as unknown as Promise<T>;

export interface HttpApi {
  get<T>(url: string, config?: HttpConfig<T>): RequestMethod<T>;
  post<T>(
    url: string,
    data?: RequestBody,
    config?: HttpConfig<T>,
  ): RequestMethod<T>;
  put<T>(
    url: string,
    data?: RequestBody,
    config?: HttpConfig<T>,
  ): RequestMethod<T>;
  patch<T>(
    url: string,
    data?: RequestBody,
    config?: HttpConfig<T>,
  ): RequestMethod<T>;
  delete<T>(url: string, config?: HttpConfig<T>): RequestMethod<T>;
  request<T>(
    config: HttpConfig<T> & { url: string; method?: string },
  ): RequestMethod<T>;
}

export const http: HttpApi = {
  get: (url, config) =>
    request.Get(
      url,
      config as Parameters<typeof request.Get>[1],
    ) as RequestMethod,
  post: (url, data, config) =>
    request.Post(
      url,
      data,
      config as Parameters<typeof request.Post>[2],
    ) as RequestMethod,
  put: (url, data, config) =>
    request.Put(
      url,
      data,
      config as Parameters<typeof request.Put>[2],
    ) as RequestMethod,
  patch: (url, data, config) =>
    request.Patch(
      url,
      data,
      config as Parameters<typeof request.Patch>[2],
    ) as RequestMethod,
  delete: (url, config) =>
    request.Delete(
      url,
      undefined,
      config as Parameters<typeof request.Delete>[2],
    ) as RequestMethod,
  request: (config) =>
    request.Request(
      config as AlovaMethodCommonConfig<InstanceGenerics, unknown, unknown>,
    ) as RequestMethod,
};

// ----------------------------------------------------------------------------
// 5.1 便捷方法
// ----------------------------------------------------------------------------

/**
 * 文件下载：GET 出 Blob 并触发浏览器下载。
 * @example await download('/api/file/export', '报表.xlsx')
 */
export const download = async (
  url: string,
  filename?: string,
  config?: HttpConfig<Blob>,
) => {
  const blob = await send(
    http.get<Blob>(url, {
      ...config,
      meta: { ...config?.meta, responseType: "blob" },
    }),
  );
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename || url.split("/").pop() || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // 延迟回收，避免部分浏览器下载中断
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

/**
 * 文件/表单上传（返回 Method 可继续使用 .onUpload() 监听进度）。
 * @example const m = upload('/api/upload', formData); m.onUpload((e) => ...); await m
 */
export const upload = <T>(
  url: string,
  data: FormData,
  config?: HttpConfig<T>,
): RequestMethod<T> =>
  http.post<T>(url, data, {
    ...config,
    meta: { ...config?.meta, responseType: "json" },
  });
