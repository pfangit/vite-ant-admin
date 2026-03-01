import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { LanguageProvider, ThemeProvider } from "@/providers";

import "./index.css";

import "./i18n"; // 引入并初始化 i18n
import { router } from "@/router";
import "./index.css";

const App = () => {
  return (
    <StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </ThemeProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(App());
