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

  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  South-West University internal systems
                </p>
                <Link className="mt-2 inline-block text-2xl font-semibold text-slate-950" href="/">
                  SWU Erasmus Staff Mobility Portal
                </Link>
                <p className="mt-1 text-sm text-slate-600">
                  Local-first administrative workspace for staff mobility coordination.
                </p>
              </div>
              <nav className="flex flex-wrap items-center gap-2 text-sm">
                {publicNavigation.map((item) => {
                  const isDashboardLink = item.href === "/login" && session?.user;

                  return (
                    <Link
                      key={item.href}
                      href={isDashboardLink ? "/dashboard" : item.href}
                      className={cn(
                        "rounded-full border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
                        isDashboardLink && "border-primary/20 bg-primary/10 text-primary"
                      )}
                    >
                      {isDashboardLink ? "Dashboard" : item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
