import { type FC, type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/use-current-user.ts";
import type { AuthType } from "../config/routes.ts";
import PageLoading from "./page-loading.tsx";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: AuthType; // 支持布尔值、单个角色或角色数组
}

const AuthWrapper: FC<AuthWrapperProps> = ({ children, requireAuth }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useCurrentUser();

  // 模拟认证状态检查函数
  const isAuthenticated = async () => {
    // 实际项目中这里会检查 token 或其他认证信息
    return user !== null && user !== undefined;
  };

  // 检查是否有权限访问
  const hasPermission = async (requireAuth: AuthType): Promise<boolean> => {
    console.log("[auth][require]", requireAuth);
    // 如果不需要认证，则有权限
    if (
      requireAuth === undefined ||
      requireAuth === null ||
      requireAuth === false
    ) {
      return true;
    }

    // 如果只需要登录状态
    if (requireAuth === true) {
      return await isAuthenticated();
    }

    // 如果需要特定角色，但用户未认证
    if (!(await isAuthenticated())) {
      return false;
    }

    const userRoles = user!.role;

    // 如果是单个角色字符串
    if (typeof requireAuth === "string") {
      return userRoles.includes(requireAuth);
    }

    // 如果是角色数组
    if (Array.isArray(requireAuth)) {
      return requireAuth.some((role) => userRoles.includes(role));
    }

    return false;
  };

  useEffect(() => {
    // 使用 setTimeout 将状态更新移到下一个事件循环周期，避免级联渲染
    const timer = setTimeout(async () => {
      // 检查是否需要认证
      if (!(await hasPermission(requireAuth))) {
        // 检查用户是否已认证
        if (!(await isAuthenticated())) {
          // 重定向到登录页，同时保存尝试访问的完整页面地址（包括查询参数）
          navigate("/login", {
            state: { from: location.pathname + location.search },
            replace: true,
          });
        } else {
          // 用户已认证但没有权限，可以重定向到无权限页面
          navigate("/unauthorized", {
            replace: true,
          });
        }
        return;
      }

      // 认证检查完成
      setIsChecking(false);
    });

    return () => clearTimeout(timer);
  }, [requireAuth, navigate, location]);

  // 如果还在检查认证状态，显示加载指示器
  if (isChecking) {
    return <PageLoading description="Checking auth..." />;
  }

  // 认证检查完成后渲染子组件
  return <>{children}</>;
};

export default AuthWrapper;
