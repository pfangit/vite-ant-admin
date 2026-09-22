import { App } from "antd";
import { useEffect } from "react";

// antd 静态 message/notification 无法感知主题等 ConfigProvider 上下文，
// 这里通过 App.useApp() 拿到持有实例，暴露给非 React 环境（如 request 层）使用。
type AppApi = ReturnType<typeof App.useApp>;

const holder: { api: AppApi | null } = { api: null };

/** 在 antd <App> 内部挂载，注册全局实例引用 */
export function FeedbackBridge() {
  const api = App.useApp();
  useEffect(() => {
    holder.api = api;
    return () => {
      holder.api = null;
    };
  }, [api]);
  return null;
}

type ToastOptions = { duration?: number };

const toast = {
  success(content: string, options?: ToastOptions) {
    holder.api?.message.success({ content, duration: options?.duration });
  },
  error(content: string, options?: ToastOptions) {
    holder.api?.message.error({ content, duration: options?.duration });
  },
  warning(content: string, options?: ToastOptions) {
    holder.api?.message.warning({ content, duration: options?.duration });
  },
  info(content: string, options?: ToastOptions) {
    holder.api?.message.info({ content, duration: options?.duration });
  },
};

type NoticeOptions = { description?: string; duration?: number };

const notification = {
  success(content: string, options?: NoticeOptions) {
    holder.api?.notification.success({
      message: content,
      description: options?.description,
      duration: options?.duration,
    });
  },
  error(content: string, options?: NoticeOptions) {
    holder.api?.notification.error({
      message: content,
      description: options?.description,
      duration: options?.duration,
    });
  },
  warning(content: string, options?: NoticeOptions) {
    holder.api?.notification.warning({
      message: content,
      description: options?.description,
      duration: options?.duration,
    });
  },
  info(content: string, options?: NoticeOptions) {
    holder.api?.notification.info({
      message: content,
      description: options?.description,
      duration: options?.duration,
    });
  },
};

export const feedback = { toast, notification };
