import { type FC, type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

// 模拟认证状态检查函数
const isAuthenticated = () => {
  // 实际项目中这里会检查 token 或其他认证信息
  return !!localStorage.getItem("authToken");
};

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已认证
    if (!isAuthenticated()) {
      // 重定向到登录页
      navigate("/login");
    }
  }, [navigate]);

  // 如果用户已认证，渲染子组件
  return isAuthenticated() ? <>{children}</> : null;
};

export default ProtectedRoute;
