export default [
  {
    url: "/api/current", // 接口路径
    method: "get", // 请求方法
    response: () => {
      // 随机决定是否成功（code 为 0 或非 0）
      const isSuccess = Math.random() > 0.7; // 30% 概率成功，70% 概率失败
      const code = isSuccess ? 0 : Math.floor(Math.random() * 100) + 1; // 成功为 0，失败为 1-100 的随机数
      if (isSuccess) {
        return {
          code: code, // 自定义状态码
          message: "", // 状态信息
          success: false,
        };
      }
      // 响应函数
      const currentUser = {
        uid: 1,
        nickname: "@cname",
      };
      return {
        code: 0,
        message: "",
        data: currentUser,
        success: true,
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
