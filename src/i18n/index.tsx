/*
 * Contexte de langue : fournit la langue courante, sa traduction et
 * le setter à toute l'application. La langue est mémorisée dans
 * localStorage et appliquée à l'attribut lang du document.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, Translation } from "./types";
import { fr } from "./fr";
import { en } from "./en";
import { de } from "./de";
import { es } from "./es";
import { it } from "./it";
import { DESCRIPTIONS } from "./descriptions";
import type { Perfume } from "../data/perfumes";

export { LANGUAGES } from "./types";
export type { Lang, Translation } from "./types";

const TRANSLATIONS: Record<Lang, Translation> = { fr, en, de, es, it };

const STORAGE_KEY = "parfumarium-lang";

const isLang = (value: string | null): value is Lang =>
  value !== null && value in TRANSLATIONS;

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translation;
}

const I18nContext = createContext<I18nValue>({ lang: "fr", setLang: () => {}, t: fr });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isLang(stored) ? stored : "fr";
    } catch {
      return "fr";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage indisponible : la langue reste en mémoire.
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

/** Description d'un parfum dans la langue demandée (repli : français). */
export const getDescription = (perfume: Perfume, lang: Lang): string =>
  lang === "fr" ? perfume.description : DESCRIPTIONS[lang][perfume.id] ?? perfume.description;
