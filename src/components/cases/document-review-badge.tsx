import { cn } from "@/lib/utils";

type DocumentReviewBadgeProps = {
  label: string;
  reviewStateKey: string;
};

const reviewStateClasses: Record<string, string> = {
  PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-900",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-900",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-900",
  NOT_UPLOADED: "border-slate-200 bg-slate-100 text-slate-700"
};

export function DocumentReviewBadge({ label, reviewStateKey }: DocumentReviewBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        reviewStateClasses[reviewStateKey] ?? reviewStateClasses.NOT_UPLOADED
      )}
    >
      {label}
    </span>
  );
}