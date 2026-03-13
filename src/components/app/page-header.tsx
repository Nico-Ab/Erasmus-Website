import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: string;
  badges?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  eyebrow,
  badges,
  meta,
  actions
}: PageHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 px-5 py-5 shadow-panel sm:px-6">
      {breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
                  {item.href && !isLast ? (
                    <Link className="transition-colors hover:text-slate-700" href={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-semibold text-slate-700" : undefined}>{item.label}</span>
                  )}
                  {!isLast ? <ChevronRight className="h-3.5 w-3.5 text-slate-400" /> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.9rem]">{title}</h1>
            {badges}
          </div>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
          {meta ? <div className="pt-1">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}