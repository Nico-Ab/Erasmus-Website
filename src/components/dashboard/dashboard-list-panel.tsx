import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardPanelItem } from "@/lib/dashboard/service";

type DashboardListPanelProps = {
  title: string;
  description: string;
  items: DashboardPanelItem[];
  emptyTitle: string;
  emptyDescription: string;
  footer?: ReactNode;
};

function ItemBadge({ value }: { value: string }) {
  return <Badge variant="muted">{value}</Badge>;
}

export function DashboardListPanel({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  footer
}: DashboardListPanelProps) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">{emptyTitle}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{emptyDescription}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    {item.meta ? <span className="text-xs text-slate-500">{item.meta}</span> : null}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
                {item.badge ? <ItemBadge value={item.badge} /> : null}
              </div>
            ))}
          </div>
        )}
        {footer ? <div className="border-t border-slate-100 pt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}