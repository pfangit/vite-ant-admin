import type { MenuDataItem } from "@ant-design/pro-components";
import { http } from "@/request.ts";

export type CurrentUser = {
  uid: string;
  nickname: string;
  avatar: string;
  roles: string[];
  /** 按钮级权限码，形如 "user:add"、"user:edit" */
  permissions?: string[];
};

export type LoginParams = {
  username: string;
  password: string;
};

export type LoginResult = {
  token: string;
};

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
};

export const fetchCurrentUser = () =>
  http.get<CurrentUser>("/api/current", { cacheFor: 60_000 });

export const fetchMenus = () =>
  http.get<MenuDataItem[]>("/api/menus", { cacheFor: 5 * 60_000 });

export const login = (params: LoginParams) =>
  http.post<LoginResult>("/api/auth/login", params, {
    meta: { skipUnauthorized: true, silent: true },
  });

export const logout = () => http.post<null>("/api/auth/logout");

export const changePassword = (params: ChangePasswordParams) =>
  http.post<null>("/api/auth/change-password", params);
