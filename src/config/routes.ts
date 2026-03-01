export type AuthType = boolean | string | string[] | undefined;

// UmiJS风格的路由配置类型
export interface RouteConfig {
  path: string;
  absPath?: string;
  component?: string;
  layout?: string | boolean;
  redirect?: string;
  name?: string;
  auth?: AuthType;
  exact?: boolean;
  children?: RouteConfig[];
  // 约定式路由相关
  index?: boolean;
  id?: string;
}

// UmiJS风格的路由配置
const routes: RouteConfig[] = [
  {
    path: "/",
    layout: "@/layouts/basic-layout",
    children: [
      {
        path: "/",
        component: "/home",
        name: "首页",
        index: true,
      },
      {
        path: "/about",
        component: "/about",
        name: "关于我们",
        auth: true,
      },
      {
        path: "/admin",
        component: "@/layouts/basic-layout",
        auth: "admin",
        children: [
          {
            path: "/admin/user",
            component: "/admin/user",
            name: "用户管理",
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    component: "/auth/login",
    layout: false,
    name: "登录",
  },
  {
    path: "/user",
    layout: false,
    children: [
      {
        path: "/user/login",
        redirect: "/login",
      },
    ],
  },
  // 404 页面
  {
    path: "*",
    component: "/404",
    layout: false,
  },
];

export default routes;
