import {useRequest} from "alova/client";
import {type FC, type ReactNode, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {LoadingIndicator} from "@/components/loading.tsx";
import {type CurrentUser, fetchCurrentUser} from "@/services/auth.ts";
import type {RouteConfig} from "../../config/routes.ts";

export type AuthType = boolean | string | string[] | undefined;

interface AuthWrapperProps {
  children: ReactNode;
  route?: RouteConfig;
}

const isAuthenticated = (data: CurrentUser | undefined) => !!data?.uid;

const hasPermission = (
  requireAuth: AuthType,
  data: CurrentUser | undefined,
): boolean => {
  if (requireAuth == null || requireAuth === false) {
    return true;
  }

  if (requireAuth === true) {
    return isAuthenticated(data);
  }

  if (!isAuthenticated(data)) {
    return false;
  }

  const userRoles = data?.roles || [];

  if (typeof requireAuth === "string") {
    return userRoles.includes(requireAuth);
  }

  if (Array.isArray(requireAuth)) {
    return requireAuth.some((role) => userRoles.includes(role));
  }

  return false;
};

const AuthWrapper: FC<AuthWrapperProps> = ({ children, route }) => {
  const { auth: requireAuth } = route || {};
  const [isChecking, setIsChecking] = useState(() => Boolean(requireAuth));
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  const { send } = useRequest(fetchCurrentUser(), {
    initialData: undefined as CurrentUser | undefined,
    immediate: false,
  });

  useEffect(() => {
    // 不需要认证的路由直接放行，不做任何请求
    if (!requireAuth) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    send()
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (!hasPermission(requireAuth, data)) {
          if (!isAuthenticated(data)) {
            const { pathname, search } = locationRef.current;
            const loginPath = `/auth/?redirect=${window.btoa(window.location.href)}`;
            // 重定向到登录页，同时保存尝试访问的完整页面地址（包括查询参数）
            navigate(loginPath, {
              state: { from: pathname + search },
              replace: true,
            });
          } else {
            // 用户已认证但没有权限，可以重定向到无权限页面
            navigate(`/unauthorized`, {
              replace: true,
            });
          }
          return;
        }

        setIsChecking(false);
      })
      .catch((error: Error) => {
        if (cancelled) {
          return;
        }
        console.error("认证检查失败", error);
        setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
    // 认证检查只在路由挂载/权限配置变化时执行一次，避免因 location 变化导致的重复请求
  }, [requireAuth, send, navigate]);

  // 如果还在检查认证状态，显示加载指示器
  if (isChecking) {
    return <LoadingIndicator text="认证中..." />;
  }

  // 认证检查完成后渲染子组件
  return <>{children}</>;
};

export default AuthWrapper;
