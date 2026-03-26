"use client";

import { Badge } from "@/components/ui/badge";
import { useAppLocale } from "@/components/app/locale-provider";
import { formatDocumentReviewLabel } from "@/lib/i18n/format";

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
  const { locale } = useAppLocale();
  const localizedLabel = formatDocumentReviewLabel(reviewStateKey, label, locale);

  return (
    <Badge
      aria-label={`Document review state: ${localizedLabel}`}
      variant={reviewStateVariantByKey[reviewStateKey as keyof typeof reviewStateVariantByKey] ?? "muted"}
    >
      {localizedLabel}
    </Badge>
  );
}
