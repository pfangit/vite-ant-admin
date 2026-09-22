import { Button, Result } from "antd";
import { Component, type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppProvider, ThemeProvider } from "@/providers";
import {
  onRequestError,
  type RequestError,
  type RequestMeta,
  setAuthToken,
  setOnUnauthorized,
} from "@/request";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth";
import { feedback } from "@/utils/feedback";
import { settings } from "../config/settings.ts";

import "./i18n"; // 引入并初始化 i18n
import "./index.css";

// 全局会话失效处理：清空 token 并跳转登录页（并发 401 只会触发一次，由 request 层保证）
setOnUnauthorized(() => {
  setAuthToken(null);
  useAuthStore.getState().clear();
  try {
    localStorage.removeItem("token");
  } catch {
    // ignore
  }
  const from = window.location.pathname + window.location.search;
  // 已在登录页则不再重复跳转，防止循环
  if (!from.startsWith(`${settings.path}/auth`)) {
    void router.navigate(`/auth?redirect=${encodeURIComponent(from)}`, {
      replace: true,
    });
  }
});

// 全局请求错误提示：未标记 silent 的错误统一给出可读提示（幂等防抖）
const KIND_LABEL: Record<RequestError["kind"], string> = {
  timeout: "请求超时，请稍后重试",
  network: "网络异常，请检查网络连接",
  http: "服务暂不可用，请稍后重试",
  business: "",
  cancel: "",
};

onRequestError((error, method) => {
  const meta = method.meta as RequestMeta | undefined;
  // 业务侧声明 silent 时自行处理错误提示（如登录页）
  if (meta?.silent) {
    return;
  }
  if (error.kind === "cancel") {
    return;
  }
  if (error.kind === "business") {
    if (error.message) {
      feedback.toast.error(error.message);
    }
    return;
  }
  feedback.notification.error(KIND_LABEL[error.kind] || error.message, {
    description:
      error.kind === "http" ? `HTTP ${error.status ?? "-"}` : undefined,
  });
});

// 根级错误边界：捕获 Provider/布局等路由边界之外的上抛错误，避免白屏
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("RootErrorBoundary", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="页面出错了"
          subTitle="系统出现异常，请刷新页面重试"
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <AppProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </AppProvider>
      </ThemeProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(App());
