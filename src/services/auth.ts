import type { MenuDataItem } from "@ant-design/pro-components";
import { http } from "@/request.ts";

export type CurrentUser = {
  uid: string;
  nickname: string;
  avatar: string;
  roles: string[];
};

export const fetchCurrentUser = () =>
  http.get<CurrentUser>("/api/current", { cacheFor: 60_000 });

export const fetchMenus = () =>
  http.get<MenuDataItem[]>("/api/menus", { cacheFor: 5 * 60_000 });
