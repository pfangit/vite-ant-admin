import { Spin } from "antd";
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
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
const loadComponent = (componentPath: string) => {
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
    // 动态导入组件
    const Component = loadComponent(route.component);

    return {
      path: route.path,
      element: (
        <AuthWrapper requireAuth={route.auth}>
          <Suspense fallback={<LoadingIndicator />}>
            <Component />
          </Suspense>
        </AuthWrapper>
      ),
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
