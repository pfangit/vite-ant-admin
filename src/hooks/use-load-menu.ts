import type { MenuDataItem } from "@ant-design/pro-components";
import { useRequest } from "alova/client";
import { fetchMenus } from "@/services/auth.ts";

const menuToRoutes = (menus: MenuDataItem[]) => {
  return menus.map((menu: MenuDataItem) => {
    const children = (
      menu.children ? menuToRoutes(menu.children) : undefined
    ) as MenuDataItem[] | undefined;
    return {
      ...menu,
      children,
    } as MenuDataItem;
  });
};

const useLoadMenu = () => {
  const { data, loading } = useRequest(fetchMenus(), {
    initialData: [],
  });

  const routes = menuToRoutes(data);
  return { menus: data, routes, loading };
};

export default useLoadMenu;
