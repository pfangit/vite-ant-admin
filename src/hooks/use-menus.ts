import type { MenuDataItem } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { fetchMenus } from "@/services/auth.ts";

export const useMenus = () => {
  // 优先本地session缓存读取用户信息
  const [menus, setMenus] = useState<MenuDataItem[] | null>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMenu = async () => {
    try {
      if (menus === null) {
        setLoading(true);
        setError(null);
        const response = await fetchMenus();
        setMenus(response.data);
        sessionStorage.setItem("app-menu", JSON.stringify(response));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("获取用户信息失败"));
      console.error("获取当前用户失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu().then();
  }, []);

  return { menus: menus, loading, error, refetch: fetchMenu };
};
