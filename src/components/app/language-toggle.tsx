"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type AppLocale } from "@/lib/i18n/config";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useAppLocale } from "@/components/app/locale-provider";

const languageOptions: Array<{ locale: AppLocale; flag: string }> = [
  { locale: "en", flag: "🇬🇧" },
  { locale: "bg", flag: "🇧🇬" }
];

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isReady = useHydrated();
  const { locale, messages } = useAppLocale();
  const isInteractive = isReady && !isPending;

  async function setLocale(nextLocale: AppLocale) {
    if (!isReady || nextLocale === locale) {
      return;
    }

    await fetch("/api/locale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ locale: nextLocale })
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2" data-testid="language-toggle">
      <span
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500",
          compact && "sr-only"
        )}
      >
        {messages.language.label}
      </span>
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
        {languageOptions.map((option) => {
          const isActive = option.locale === locale;
          const label =
            option.locale === "en"
              ? messages.languageToggle.english
              : messages.languageToggle.bulgarian;

          return (
            <button
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100",
                !isInteractive && "cursor-not-allowed opacity-70"
              )}
              data-testid={`language-toggle-${option.locale}`}
              disabled={!isInteractive}
              key={option.locale}
              onClick={() => {
                void setLocale(option.locale);
              }}
              type="button"
            >
              <span aria-hidden="true">{option.flag}</span>
              <span>{compact ? option.locale.toUpperCase() : label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
