import { type FC, type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { AuthType } from "../config/routes.ts";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: AuthType; // 支持布尔值、单个角色或角色数组
}

// 模拟认证状态检查函数
const isAuthenticated = () => {
  // 实际项目中这里会检查 token 或其他认证信息
  return !!localStorage.getItem("token");
};

// 模拟获取用户角色函数
const getUserRoles = (): string[] => {
  // 实际项目中这里会从 token 或其他地方解析用户角色
  const user = localStorage.getItem("token") ? ["user"] : [];
  // 模拟管理员角色
  if (localStorage.getItem("token") === "admin") {
    user.push("admin");
  }
  return user;
};

// 检查是否有权限访问
const hasPermission = (requireAuth: AuthType): boolean => {
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
    return isAuthenticated();
  }

  // 如果需要特定角色，但用户未认证
  if (!isAuthenticated()) {
    return false;
  }

  const userRoles = getUserRoles();

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

const AuthWrapper: FC<AuthWrapperProps> = ({ children, requireAuth }) => {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 使用 setTimeout 将状态更新移到下一个事件循环周期，避免级联渲染
    const timer = setTimeout(() => {
      // 检查是否需要认证
      if (!hasPermission(requireAuth)) {
        // 检查用户是否已认证
        if (!isAuthenticated()) {
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
    return <div>Checking auth...</div>;
  }

  // 认证检查完成后渲染子组件
  return <>{children}</>;
};

export default AuthWrapper;