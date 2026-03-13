"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2" aria-label="Dashboard sections">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-xl border px-4 py-3.5 transition-colors",
              active
                ? "border-primary/20 bg-primary/8 text-primary shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="text-sm font-semibold">{item.title}</div>
            <div className={cn("mt-1 text-xs leading-5", active ? "text-primary/80" : "text-slate-500")}>
              {item.description}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}