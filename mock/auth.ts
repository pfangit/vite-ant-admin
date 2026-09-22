import type { CurrentUser } from "../src/services/auth";

const currentUser: CurrentUser = {
  uid: "1",
  nickname: "管理员",
  avatar: "https://img95.699pic.com/photo/40250/6425.jpg_wh300.jpg",
  roles: ["admin"],
  permissions: [
    "user:search",
    "user:add",
    "user:edit",
    "user:delete",
    "account:view",
    "account:update",
  ],
};

export default [
  {
    url: "/api/current",
    method: "get",
    response: () => ({
      code: 0,
      message: "",
      data: currentUser,
      success: true,
    }),
  },
  {
    url: "/api/auth/login",
    method: "post",
    response: ({
      body,
    }: {
      body?: { username?: string; password?: string };
    }) => {
      const { username, password } = body ?? {};
      if (!username || !password) {
        return {
          code: 1001,
          message: "用户名或密码不能为空",
          success: false,
        };
      }
      return {
        code: 0,
        message: "",
        data: { token: `mock-token-${Date.now()}` },
        success: true,
      };
    },
  },
  {
    url: "/api/auth/logout",
    method: "post",
    response: () => ({
      code: 0,
      message: "",
      success: true,
    }),
  },
  {
    url: "/api/auth/change-password",
    method: "post",
    response: ({
      body,
    }: {
      body?: { oldPassword?: string; newPassword?: string };
    }) => {
      const { oldPassword, newPassword } = body ?? {};
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        return {
          code: 1002,
          message: "请填写完整，且新密码长度不少于 6 位",
          success: false,
        };
      }
      return {
        code: 0,
        message: "",
        success: true,
      };
    },
  },
];
