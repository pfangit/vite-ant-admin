export default [
  {
    url: "/api/menus",
    method: "get",
    response: () => {
      return {
        code: 0,
        message: "",
        data: [
          {
            path: "/",
            name: "首页",
          },
          {
            path: "/about",
            name: "关于",
          },
          {
            path: "/admin",
            name: "管理",
            children: [
              {
                path: "/admin/user",
                name: "用户管理",
              },
            ],
          },
          {
            path: "/account",
            name: "个人中心",
          },
        ],
        success: true,
      };
    },
  },
];
