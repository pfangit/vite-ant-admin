import { App } from "antd";
import type { ReactNode } from "react";
import { FeedbackBridge } from "@/utils/feedback.tsx";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <App>
      <FeedbackBridge />
      {children}
    </App>
  );
}
