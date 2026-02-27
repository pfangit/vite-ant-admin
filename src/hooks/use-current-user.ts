import { useEffect, useState } from "react";
import { type CurrentUser, fetchCurrentUser } from "@/services/auth.ts";

export const useCurrentUser = () => {
  // 优先本地session缓存读取用户信息
  const sessionItem = sessionStorage.getItem("current-user");
  let currentUser: CurrentUser | null = null;
  if (sessionItem && "undefined" !== sessionItem) {
    currentUser = JSON.parse(sessionItem) as unknown as CurrentUser;
  }
  const [user, setUser] = useState<CurrentUser | null>(currentUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      if (user === null) {
        setLoading(true);
        setError(null);
        const response = await fetchCurrentUser();
        setUser(response);
        sessionStorage.setItem("current-user", JSON.stringify(response));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("获取用户信息失败"));
      console.error("获取当前用户失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser().then();
  }, []);

  return { user, loading, error, refetch: fetchUser };
};
