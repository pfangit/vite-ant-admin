import { PageLoading } from "@ant-design/pro-components";
import { createElement, lazy, Suspense } from "react";
import { Navigate } from "react-router";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import routes, { type RouteConfig } from "@/config/routes.ts";
import { settings } from "@/config/settings.ts";
import AuthWrapper from "@/wrappers/auth-wrapper";

// 未授权页面
const UnauthorizedPage = lazy(() => import("@/pages/unauthorized.tsx"));

// 加载指示器组件
const LoadingIndicator = () => <PageLoading />;

const lazyLoad = (path?: string, basePath: string = "") => {
  if (!path) {
    return null;
  }
  // 处理路径别名
  let normalizedPath = path;

  // 优先处理 @/ 别名
  if (path.startsWith("@/")) {
    normalizedPath = path.replace("@/", `../${basePath}`);
  }
  // 处理绝对路径（相对于 src 目录）
  else if (path.startsWith("/")) {
    normalizedPath = path.replace(/^\//, `../${basePath}`);
  }
  // 处理 ./ 相对路径（假设相对于 src 目录）
  else if (path.startsWith("./")) {
    normalizedPath = path.replace(/^\.\//, `../${basePath}`);
  }
  // 其他情况（不带前缀），也假设相对于 src 目录
  else {
    normalizedPath = `../${path}`;
  }

  return lazy(() => import(/* @vite-ignore */ normalizedPath));
};

// 动态导入组件的函数
const loadComponents = (componentPath?: string) => {
  // 返回懒加载组件
  return lazyLoad(componentPath, "pages/");
};

const loadLayouts = (componentPath?: string) => {
  return lazyLoad(componentPath);
};

const parseRoute = (parentPath: string, route: RouteConfig) => {
  const result = {} as RouteObject;
  console.group("[route][parse]", route);
  const routePath = route.path.startsWith("/") ? route.path : `/${route.path}`;
  // 如果是绝对路径，不拼接 parentPath
  const absPath =
    route.absPath ||
    (routePath.startsWith("/") ? routePath : parentPath + routePath);
  console.log("[route]", absPath, parentPath, routePath);

  result.path = absPath;

  // 处理component
  if (route.component) {
    const Component = loadComponents(route.component);
    console.log("[route]处理component", Component);
    result.element = (
      <AuthWrapper route={route}>
        <Suspense fallback={<PageLoading />}>
          {Component && createElement(Component)}
        </Suspense>
      </AuthWrapper>
    );
  }

  // 处理layout
  if (route.layout !== false && route.layout !== undefined) {
    console.log("[route]处理layout");
    const Layout = loadLayouts(route.layout as string);
    result.element = (
      <AuthWrapper route={route}>
        <Suspense fallback={<PageLoading />}>{Layout && <Layout />}</Suspense>
      </AuthWrapper>
    );
  }

  // 处理重定向
  if (route.redirect) {
    console.log("[route]处理重定向");
    result.element = (
      <Navigate to={route.absPath || parentPath + route.redirect} replace />
    );
  }

  // 递归children
  if (route.children) {
    result.children = route.children.map((childRoute) =>
      parseRoute(parentPath, childRoute),
    );
  }
  console.groupEnd();
  return result;
};

// 创建路由配置
const buildRoutes = (
  parentPath: string,
  items: typeof routes,
): RouteObject[] => {
  // console.log("[route]解析", parentPath, items);
  return items.map((route) => parseRoute(parentPath, route));
};

export const router = createBrowserRouter(
  [
    ...buildRoutes("", routes),
    {
      path: `${settings.path}/unauthorized`,
      element: (
        <Suspense fallback={<LoadingIndicator />}>
          <UnauthorizedPage />
        </Suspense>
      ),
    },
  ],
  {
    basename: settings.path,
  },
);
