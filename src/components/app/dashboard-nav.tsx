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
    <nav className="space-y-2">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg border px-4 py-3 transition-colors",
              active
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
            )}
          >
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="mt-1 text-xs text-slate-500">{item.description}</div>
          </Link>
        );
      })}
    </nav>
  );
}