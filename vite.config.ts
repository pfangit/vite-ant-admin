import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { type ConfigEnv, defineConfig, type UserConfigExport } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteMockServe } from "vite-plugin-mock";
import proxy from "./config/proxy";
import { settings } from "./config/settings.ts";

const port = parseInt(process.env.PORT || "1420", 10);
const appEnv = process.env.NODE_ENV || "dev";
const mock = process.env.VITE_USE_MOCK !== "false";
const analyze = process.env.VITE_ANALYZE === "true";

console.log(
  "----------------- app env ---------- ",
  appEnv,
  mock ? "mock" : "no mock",
);

// https://vite.dev/config/
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const isProd = mode === "production";

  return defineConfig({
    build: {
      rollupOptions: {
        output: {
          chunkFileNames: "js/[name]-[hash].js",
          entryFileNames: "js/[name]-[hash].js",
          assetFileNames: "[ext]/[name]-[hash].[ext]",
          manualChunks(id) {
            // pro-components 及 @ant-design/pro-* 仅被布局按需加载，保持独立分包，
            // 避免被并入入口 vendor 导致首屏全量加载。
            if (id.includes("node_modules/@ant-design/pro-")) {
              return undefined;
            }
            if (
              id.includes("node_modules/react-router") ||
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/alova") ||
              id.includes("node_modules/zustand")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("node_modules/i18next") ||
              id.includes("node_modules/react-i18next")
            ) {
              return "vendor-i18n";
            }
            if (
              id.includes("node_modules/antd") ||
              id.includes("node_modules/@ant-design")
            ) {
              return "vendor-antd";
            }
            return undefined;
          },
        },
      },
    },
    esbuild: {
      // 生产构建时移除 console/debugger，开发环境保留
      drop: isProd ? ["console", "debugger"] : [],
    },
    plugins: [
      react(),
      tailwindcss(),
      viteMockServe({
        mockPath: "mock",
        cors: true,
        logger: true,
        enable: mock,
        watchFiles: true, // 监听mock文件变化
      }),
      createHtmlPlugin({
        inject: {
          data: {
            // 定义了一个title 变量，可以被html中进行引用
            title: settings.appName,
          },
        },
      }),
      ...(analyze
        ? [
            visualizer({
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: port || 5173,
      strictPort: true,
      open: true,
      proxy: proxy[appEnv as keyof typeof proxy],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, ".", "src"),
        // 强制主项目和链接包使用同一个 React 实例，否则容易造成useState null问题
        react: resolve(__dirname, "./node_modules/react"),
        "react-dom": resolve(__dirname, "./node_modules/react-dom"),
      },
    },
    base: settings.path,
  });
};
