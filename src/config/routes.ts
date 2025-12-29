export type AuthType = boolean | string | string[] | undefined;

// 定义路由配置类型
export interface RouteConfig {
  path: string;
  component: string;
  auth?: AuthType; // 支持布尔值、单个角色或角色数组
  children?: RouteConfig[];
}

// 简化的路由配置 - 用户只需提供路径和组件路径
const routes: RouteConfig[] = [
  {
    path: "/login",
    component: "@/pages/auth/login",
  },
  {
    path: "/",
    component: "@/layouts/basic-layout",
    children: [
      {
        path: "/",
        component: "@/pages/home",
      },
      {
        path: "/about",
        component: "@/pages/about",
        auth: true, // 示例：about 页面需要登录才能访问
      },
    ],
  },
];

export default routes;
