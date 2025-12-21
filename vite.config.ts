import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { type ConfigEnv, defineConfig, type UserConfigExport } from "vite";
import { viteMockServe } from "vite-plugin-mock";

// https://vite.dev/config/
export default ({ command }: ConfigEnv): UserConfigExport => {
  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      viteMockServe({
        mockPath: "mock",
        enable: command === "serve",
        watchFiles: true, // 监听mock文件变化
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
