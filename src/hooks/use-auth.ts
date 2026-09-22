import type { CurrentUser } from "@/services/auth.ts";
import { useAuthStore } from "@/store/auth.ts";

export type AuthScope = string;

const matchAuth = (
  scope: AuthScope | undefined,
  user: CurrentUser | null,
): boolean => {
  if (!scope) {
    return true;
  }
  if (!user) {
    return false;
  }
  const roles = user.roles ?? [];
  const permissions = user.permissions ?? [];
  return roles.includes(scope) || permissions.includes(scope);
};

/** 非组件环境下的权限判断（如事件处理/菜单过滤） */
export const hasAuth = (scope?: AuthScope): boolean =>
  matchAuth(scope, useAuthStore.getState().user);

/** 组件内权限判断：返回登录态、当前用户与 hasAuth 校验函数 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  return {
    user,
    isLogin: Boolean(user?.uid),
    hasAuth: (scope?: AuthScope) => matchAuth(scope, user),
  };
};
