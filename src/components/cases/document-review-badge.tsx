import { Badge } from "@/components/ui/badge";

type DocumentReviewBadgeProps = {
  label: string;
  reviewStateKey: string;
};

const reviewStateVariantByKey = {
  PENDING_REVIEW: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  NOT_UPLOADED: "muted"
} as const;

export function DocumentReviewBadge({ label, reviewStateKey }: DocumentReviewBadgeProps) {
  return (
    <Badge
      aria-label={`Document review state: ${label}`}
      className="uppercase"
      variant={reviewStateVariantByKey[reviewStateKey as keyof typeof reviewStateVariantByKey] ?? "muted"}
    >
      {label}
    </Badge>
  );
}