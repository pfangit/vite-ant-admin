import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";
import { useLanguageStore } from "@/store/language.tsx";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguageStore();
  const locale = lang === "zh-CN" ? zhCN : enUS;

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
}
