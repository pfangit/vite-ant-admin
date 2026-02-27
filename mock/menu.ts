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
            "menuId|+1": 1,
            name: "@cname",
            path: "/",
            icon: "",
          },
        ],
        success: true,
      };
    },
  },
];
