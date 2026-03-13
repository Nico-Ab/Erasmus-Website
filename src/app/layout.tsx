import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { publicNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
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
  const navigation = session?.user
    ? [
        publicNavigation[0],
        publicNavigation[1],
        {
          title: "Dashboard",
          href: "/dashboard",
          description: "Protected workspace"
        }
      ]
    : publicNavigation;

  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 rounded-2xl border border-slate-200 bg-white/95 px-5 py-5 shadow-panel backdrop-blur sm:px-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  South-West University internal administration
                </p>
                <div>
                  <Link className="inline-block text-2xl font-semibold tracking-tight text-slate-950" href="/">
                    SWU Erasmus Staff Mobility Portal
                  </Link>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Structured workspace for staff mobility cases, document review, operational reporting, and protected university administration.
                  </p>
                </div>
              </div>
              <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Primary">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg border px-3.5 py-2.5 font-medium transition-colors",
                      item.href === "/dashboard"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}