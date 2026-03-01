import i18n from "i18next";
import { createStore } from "./create-store";

export type LanguageEnum = "zh-CN" | "en-US";

interface LanguageState {
  lang: LanguageEnum;
  setLang: (lang: LanguageEnum) => void;
}

const defaultLang = (localStorage.getItem("sword-lang") ||
  "zh") as LanguageEnum;

export const useLanguageStore = createStore<LanguageState>(
  (set) => ({
    lang: defaultLang,
    setLang: (lang) => {
      i18n.changeLanguage(lang).then(() => {
        // do nothing
      });
      localStorage.setItem("sword-lang", lang);
      set({ lang });
    },
  }),
  "LanguageStore",
);
