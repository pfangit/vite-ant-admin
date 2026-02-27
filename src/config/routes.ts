export type AuthType = boolean | string | string[] | undefined;

// UmiJS风格的路由配置类型
export interface RouteConfig {
  path: string;
  component?: string;
  layout?: string | boolean;
  redirect?: string;
  wrappers?: string[];
  name?: string;
  auth?: AuthType;
  exact?: boolean;
  routes?: RouteConfig[]; // alias for children
  children?: RouteConfig[];
  // 约定式路由相关
  index?: boolean;
  id?: string;
}

// UmiJS风格的路由配置
const routes: RouteConfig[] = [
  {
    path: "/",
    component: "@/layouts/basic-layout",
    routes: [
      {
        path: "/",
        component: "@/pages/home",
        name: "首页",
        index: true,
      },
      {
        path: "/about",
        component: "@/pages/about",
        name: "关于我们",
        auth: true,
        wrappers: ["@/components/logger-wrapper"],
      },
      {
        path: "/admin",
        component: "@/layouts/basic-layout",
        auth: "admin",
        routes: [
          {
            path: "/admin/user",
            component: "@/pages/admin/user",
            name: "用户管理",
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    component: "@/pages/auth/login",
    layout: false,
    name: "登录",
  },
  {
    path: "/user",
    layout: false,
    routes: [
      {
        path: "/user/login",
        redirect: "/login",
      },
    ],
  },
  // 404 页面
  {
    path: "*",
    component: "@/pages/404",
    layout: false,
  },
];

export default routes;
