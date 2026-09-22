export default {
  development: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
      // 保持原路径转发（Vite 使用 rewrite 函数，非 webpack 的 pathRewrite）
      rewrite: (path: string) => path,
    },
    "/auth": {
      target: "http://localhost:8080",
      changeOrigin: true,
      rewrite: (path: string) => path,
    },
  },
  production: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
      rewrite: (path: string) => path,
    },
  },
};
