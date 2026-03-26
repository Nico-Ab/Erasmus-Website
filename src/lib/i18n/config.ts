export const appLocaleCookieName = "portal_locale";

export const appLocales = ["en", "bg"] as const;

export type AppLocale = (typeof appLocales)[number];

const appLocaleSet = new Set<AppLocale>(appLocales);

export function resolveAppLocale(value?: string | null): AppLocale {
  const defaultLocale = process.env.DEFAULT_LOCALE;

  if (value && appLocaleSet.has(value as AppLocale)) {
    return value as AppLocale;
  }

  return appLocaleSet.has(defaultLocale as AppLocale)
    ? (defaultLocale as AppLocale)
    : "en";
}

export function getDateLocale(locale: AppLocale) {
  return locale === "bg" ? "bg-BG" : "en-GB";
}
