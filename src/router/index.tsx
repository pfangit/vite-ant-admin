import { type ComponentType, lazy, Suspense } from "react";
import { Navigate, useRouteError } from "react-router";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { LoadingIndicator } from "@/components/loading.tsx";
import AuthWrapper from "@/wrappers/auth-wrapper";
import routes, {
  type AuthType,
  type RouteConfig,
} from "../../config/routes.ts";
import { settings } from "../../config/settings.ts";

const exception = {
  403: "/src/pages/exception/exception-403",
  404: "/src/pages/exception/exception-404",
  500: "/src/pages/exception/exception-500",
};

// 页面按文件分包、按需加载（未开启 eager，路由命中时才动态 import）
const pages = import.meta.glob([
  "/src/{pages,layouts}/*.{ts,tsx,js,jsx}",
  "/src/{pages,layouts}/**/*.{ts,tsx,js,jsx}",
  "!**/{components,utils,services}",
  "!**/{utils,util,services}.{ts,tsx,js,jsx}",
  "!**/*.{d.ts,json}",
]);

type PageLoader = () => Promise<{ default: ComponentType }>;

const metaPages = Object.entries(pages).reduce(
  (prev, [key, val]) => {
    prev[key.replace(/(\/index)?\.(tsx|ts|jsx|js)$/, "")] = val as PageLoader;
    return prev;
  },
  {} as Record<string, PageLoader>,
);

const loadPage = (name: string) => () => {
  const loader = metaPages[name];
  if (!loader) {
    return Promise.reject(new Error(`页面模块不存在: ${name}`));
  }
  return loader();
};

// 未授权页面
const UnauthorizedPage = lazy(loadPage("/src/pages/unauthorized"));

// 404 兜底页面
const NotFoundPage = lazy(loadPage("/src/pages/404"));

// 500 错误页面（供 ErrorBoundary 兜底展示）
const ServerErrorPage = lazy(loadPage(exception[500]));

// 路由懒加载期间的占位 UI
const RouteHydrateFallback = () => <LoadingIndicator text="页面加载中..." />;

// 路由出错时的兜底 UI
const RouteErrorBoundary = () => {
  const error = useRouteError();
  console.error("RouteErrorBoundary", error);
  return (
    <Suspense fallback={<LoadingIndicator text="页面加载失败" />}>
      <ServerErrorPage />
    </Suspense>
  );
};

const parsePath = (path?: string, basePath = ""): string => {
  if (!path) {
    return "";
  }
  const pathPrefix = `/src/${basePath}`;
  let normalizedPath = path;
  // 处理路径别名
  if (path.startsWith("@/")) {
    normalizedPath = path.replace("@/", pathPrefix);
  }
  // 处理绝对路径（相对于 src 目录）
  else if (path.startsWith("/")) {
    normalizedPath = path;
  }
  // 处理 ./ 相对路径（假设相对于 src 目录）
  else if (path.startsWith("./")) {
    normalizedPath = path.replace(/^\.\//, pathPrefix);
  }
  // 其他情况（不带前缀），也假设相对于 src 目录
  else {
    normalizedPath = `${pathPrefix}/${path}`;
  }
  normalizedPath = normalizedPath.replace(/\.(tsx|ts|jsx|js)$/, "");
  if (metaPages[normalizedPath]) {
    return normalizedPath;
  }
  const withoutIndex = normalizedPath.replace(/\/index$/, "");
  if (metaPages[withoutIndex]) {
    return withoutIndex;
  }
  console.warn(`No matching path found for "${path}"`);
  return "";
};

const parseRoute = (route: RouteConfig, parentAuth?: AuthType) => {
  const { layout, index, path, redirect, component, children } = route;
  // 子路由未声明 auth 时继承父级权限，避免 /admin/user 因自身无 auth 而绕过鉴权
  const effectiveAuth = route.auth ?? parentAuth;

  let page: PageLoader | undefined;
  if (typeof layout === "string") {
    const file = parsePath(layout);
    page = metaPages[file];
  } else if (component) {
    const file = parsePath(component, "pages/");
    page = metaPages[file];
  }

  const hasChildren = Boolean(children?.length);
  const routeChildren = hasChildren
    ? buildRoutes(children as RouteConfig[], effectiveAuth)
    : undefined;
  // 纯 redirect 路由只渲染 <Navigate>，不再挂 404/组件，避免覆盖重定向
  const pageLoader = redirect
    ? undefined
    : (page ?? (!hasChildren ? metaPages[exception[404]] : undefined));

  const element = redirect ? <Navigate to={redirect} replace /> : undefined;

  return {
    ...(index ? { index } : { path }),
    ...(element ? { element } : {}),
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: RouteHydrateFallback,
    ...(routeChildren ? { children: routeChildren } : {}),
    ...(layout === false ? { handle: { layout: false } } : {}),
    lazy: pageLoader
      ? async () => {
          const { default: Component } = await pageLoader();
          const wrapped = effectiveAuth
            ? () => (
                <AuthWrapper route={{ ...route, auth: effectiveAuth }}>
                  <Component />
                </AuthWrapper>
              )
            : Component;
          return { Component: wrapped };
        }
      : undefined,
  } as RouteObject;
};

// 创建路由配置
const buildRoutes = (
  items: RouteConfig[],
  parentAuth?: AuthType,
): RouteObject[] => {
  return items.map((route) => parseRoute(route, parentAuth));
};

export const router = createBrowserRouter(
  [
    ...buildRoutes(routes),
    {
      path: "unauthorized",
      element: (
        <Suspense fallback={<LoadingIndicator text="加载中..." />}>
          <UnauthorizedPage />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: (
        <Suspense fallback={<LoadingIndicator text="加载中..." />}>
          <NotFoundPage />
        </Suspense>
      ),
      ErrorBoundary: RouteErrorBoundary,
      HydrateFallback: RouteHydrateFallback,
    },
  ],
  {
    basename: settings.path,
  },
);
