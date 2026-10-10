import { Language, translations } from "@/lib/translations";

export type HeroTitle = { text: string; highlight: string };
export type HeroTitles = Record<Language, HeroTitle>;

export const defaultHeroTitles: HeroTitles = Object.fromEntries(
  (["ar", "en", "tr"] as const).map((language) => {
    const hero = translations[language].hero;
    return [language, {
      text: [hero.title1.trim(), hero.titleSell?.trim()].filter(Boolean).join(" "),
      highlight: hero.titleHighlight.trim(),
    }];
  }),
) as HeroTitles;

export function normalizeHeroTitles(value: unknown): HeroTitles {
  const result = { ...defaultHeroTitles };
  if (!value || typeof value !== "object") return result;
  for (const language of ["ar", "en", "tr"] as const) {
    const entry = (value as Record<string, unknown>)[language];
    if (!entry || typeof entry !== "object") continue;
    const { text, highlight } = entry as Record<string, unknown>;
    if (typeof text === "string" && typeof highlight === "string" && (text.trim() || highlight.trim())) {
      result[language] = { text: text.trim(), highlight: highlight.trim() };
    }
  }
  return result;
}