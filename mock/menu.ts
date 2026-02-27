export default [
  {
    url: "/api/menus", // 接口路径
    method: "get", // 请求方法
    response: () => {
      return {
        code: 0,
        message: "",
        data: [
          {
            path: "/",
            name: "欢迎",
            routes: [
              {
                path: "/welcome",
                name: "one",
                routes: [
                  {
                    path: "/welcome/welcome",
                    name: "two",
                    exact: true,
                  },
                ],
              },
            ],
          },
          {
            path: "/demo",
            name: "例子",
          },
        ],
        success: true,
      };
    },
  },
];
