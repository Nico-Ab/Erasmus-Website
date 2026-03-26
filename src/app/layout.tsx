import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { LanguageToggle } from "@/components/app/language-toggle";
import { LocaleProvider } from "@/components/app/locale-provider";
import { UniversityIdentity } from "@/components/app/university-identity";
import { Badge } from "@/components/ui/badge";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getPublicNavigation } from "@/lib/navigation";
import { cn, formatRoleLabel, formatStatusLabel } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SWU Erasmus Staff Mobility Portal",
    template: "%s | SWU Erasmus Staff Mobility Portal"
  },
  description: "Internal portal foundation for Erasmus staff mobility administration."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const publicNavigation = getPublicNavigation(locale);
  const navigation = session?.user
    ? [
        publicNavigation[0],
        publicNavigation[1],
        {
          title: messages.navigation.public.dashboard.title,
          href: "/dashboard",
          description: messages.navigation.public.dashboard.description
        }
      ]
    : publicNavigation;

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <div className="min-h-screen">
            <div className="bg-primary text-primary-foreground">
              <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] sm:px-6 lg:px-8">
                <span>{messages.layout.topBarLeft}</span>
                <span>{session?.user ? messages.common.signedIn : messages.common.signedOut}</span>
              </div>
            </div>

            <header className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <UniversityIdentity
                    description={messages.brand.description}
                    portalName={messages.brand.portal}
                    universityName={messages.brand.university}
                  />
                  <div className="flex flex-col items-start gap-3 xl:items-end">
                    <LanguageToggle />
                    {session?.user ? (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default">{formatRoleLabel(session.user.role, locale)}</Badge>
                        <Badge variant="muted">{formatStatusLabel(session.user.status, locale)}</Badge>
                      </div>
                    ) : null}
                    <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Primary">
                      {navigation.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "rounded-lg border px-3.5 py-2.5 font-medium transition-colors",
                            item.href === "/dashboard"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-slate-200 bg-white text-slate-700 hover:border-primary/25 hover:bg-accent hover:text-slate-900"
                          )}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

            <footer className="border-t border-slate-200/80 bg-white/70">
              <div className="mx-auto flex max-w-screen-2xl flex-col gap-2 px-4 py-5 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <p>{messages.layout.footer}</p>
                <p>
                  <Link className="font-medium text-primary hover:underline" href="/status">
                    {messages.layout.footerLink}
                  </Link>
                </p>
              </div>
            </footer>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
