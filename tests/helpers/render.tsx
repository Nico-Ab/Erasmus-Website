import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { LocaleProvider } from "@/components/app/locale-provider";
import type { AppLocale } from "@/lib/i18n/config";

type RenderWithUserOptions = Omit<RenderOptions, "queries"> & {
  locale?: AppLocale;
};

export function renderWithUser(ui: ReactElement, options?: RenderWithUserOptions) {
  const locale = options?.locale ?? "en";

  function Wrapper({ children }: { children: ReactNode }) {
    return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { ...options, wrapper: Wrapper })
  };
}
