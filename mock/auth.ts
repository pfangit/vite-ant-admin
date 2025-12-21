export default [
  {
    url: "/api/current", // 接口路径
    method: "get", // 请求方法
    response: () => {
      // 响应函数
      const currentUser = {
        uid: 1,
        nickname: "@cname",
      };
      return {
        code: 0, // 自定义状态码
        message: "", // 状态信息
        data: currentUser, // 返回数据
      };
    },
  },
  {
    url: "/api/auth/login",
    method: "post",
    response: () => {
      // 响应函数
      const data = {
        token: "@cname",
      };
      return {
        code: 0, // 自定义状态码
        message: "", // 状态信息
        data: data, // 返回数据
      };
    },
  },
];
