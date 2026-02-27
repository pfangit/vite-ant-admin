import type { MenuDataItem } from "@ant-design/pro-components";
import { type ApiResponse, fetch } from "@/request.tsx";

export type CurrentUser = {
  uid: string;
  nickname: string;
  avatar: string;
  role: string[];
};

export const fetchCurrentUser = () => {
  return fetch<CurrentUser>("/api/current", {});
};

export const fetchMenus = () => {
  return fetch<ApiResponse<MenuDataItem[]>>("/api/menus", {});
};
