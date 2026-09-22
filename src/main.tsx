import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "@/providers";
import { setAuthToken, setOnUnauthorized } from "@/request";
import { router } from "@/router";
import { settings } from "../config/settings.ts";

import "./i18n"; // 引入并初始化 i18n
import "./index.css";

// 全局会话失效处理：清空 token 并跳转登录页（并发 401 只会触发一次，由 request 层保证）
setOnUnauthorized(() => {
  setAuthToken(null);
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

const App = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(App());
