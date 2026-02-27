import { Spin } from "antd";
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
  RouterProvider,
} from "react-router-dom";
import AuthWrapper from "@/components/auth-wrapper.tsx";
import routes from "@/config/routes";

// 未授权页面
const UnauthorizedPage = lazy(() => import("@/pages/unauthorized.tsx"));

// 加载指示器组件
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="flex flex-col items-center">
      <Spin size="large" />
      <span className="mt-4 text-gray-500">Loading...</span>
    </div>
  </div>
);

// 动态导入组件的函数
const loadComponent = (componentPath?: string) => {
  if (!componentPath) {
    return null;
  }

  // 处理路径别名
  let normalizedPath = componentPath;
  if (componentPath.startsWith("@/")) {
    normalizedPath = componentPath.replace("@/", "../");
  }
  console.log("[load]", componentPath, normalizedPath);
  // 返回懒加载组件
  return lazy(
    () =>
      import(
        /* @vite-ignore */
        normalizedPath
      ),
  );
};

// 创建路由配置
const createRoutesConfig = (routesConfig: typeof routes): RouteObject[] => {
  return routesConfig.map((route) => {
    // 处理重定向路由
    if (route.redirect) {
      return {
        path: route.path,
        element: <Navigate to={route.redirect} replace />,
      };
    }

    // 动态导入组件
    const Component = loadComponent(route.component);

    // 处理布局组件
    if (route.layout !== false && (route.children || route.routes)) {
      const LayoutComponent = loadComponent(
        typeof route.layout === "string"
          ? route.layout
          : "@/layouts/basic-layout",
      );
      if (LayoutComponent) {
        // 处理子路由
        const childrenRoutes = createRoutesConfig(
          route.children || route.routes || [],
        );

        // 检查是否有index路由
        const hasIndexRoute = childrenRoutes.some((child) => child.index);

        // 如果没有index路由且当前路由有component，则添加一个index路由
        if (!hasIndexRoute && Component) {
          childrenRoutes.unshift({
            index: true,
            element: (
              <AuthWrapper requireAuth={route.auth}>
                <Suspense fallback={<LoadingIndicator />}>
                  <Component />
                </Suspense>
              </AuthWrapper>
            ),
          });
        }

        return {
          path: route.path,
          element: (
            <AuthWrapper requireAuth={route.auth}>
              <Suspense fallback={<LoadingIndicator />}>
                <LayoutComponent />
              </Suspense>
            </AuthWrapper>
          ),
          children: childrenRoutes,
        };
      }
    }

    // 构建路由元素（没有布局的情况）
    const routeElement = (
      <AuthWrapper key={route.path} requireAuth={route.auth}>
        <Suspense fallback={<LoadingIndicator />}>
          {Component && <Component />}
        </Suspense>
      </AuthWrapper>
    );

    return {
      path: route.path,
      ...(route.index && { index: true }),
      element: routeElement,
      ...(route.children && {
        children: createRoutesConfig(route.children),
      }),
    };
  });
};

const router = createBrowserRouter([
  ...createRoutesConfig(routes),
  {
    path: "/unauthorized",
    element: (
      <Suspense fallback={<LoadingIndicator />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
