declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_USE_MOCK?: string;
    readonly VITE_ANALYZE?: string;
    readonly VITE_PORT?: string;
  }
}

export {};
