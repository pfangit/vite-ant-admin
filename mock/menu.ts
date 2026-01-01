import { isSuccess } from "./is-success";

export default [
  {
    url: "/api/menu", // 接口路径
    method: "get", // 请求方法
    response: () => {
      const { success, code } = isSuccess();
      if (success) {
        return {
          code: code, // 自定义状态码
          message: "", // 状态信息
          success: false,
        };
      }
      // 响应函数
      const menu = {
        "menuId|+1": 1,
        name: "@cname",
        path: "@cname",
        icon: "",
      };
      return {
        code: 0,
        message: "",
        data: menu,
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
