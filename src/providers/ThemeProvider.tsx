import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import { useThemeStore } from "@/store/theme.tsx";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();

  // 根据主题设置 Ant Design 主题配置（可选）
  const antdTheme = {
    token: {
      colorPrimary: "#1677ff",
    },
    algorithm:
      theme === "dark"
        ? [
            /* 可选：暗色算法 */
          ]
        : [],
  };

  return <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>;
}
