"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages, type AppMessages } from "@/lib/i18n/messages";

type LocaleContextValue = {
  locale: AppLocale;
  messages: AppMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  locale: AppLocale;
  children: ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, messages: getMessages(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useAppLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useAppLocale must be used inside LocaleProvider.");
  }

  return context;
}
