"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { useAppLocale } from "@/components/app/locale-provider";
import { formatCaseStatusLabel } from "@/lib/i18n/format";

const statusVariantByKey: Record<string, NonNullable<BadgeProps["variant"]>> = {
  draft: "muted",
  submitted: "warning",
  agreement_uploaded: "warning",
  under_review: "warning",
  approved: "success",
  mobility_ongoing: "info",
  certificate_uploaded: "warning",
  completed: "success",
  changes_required: "danger",
  archived: "muted"
};

export function CaseStatusBadge({
  statusKey,
  label
}: {
  statusKey: string;
  label: string;
}) {
  const { locale } = useAppLocale();
  const localizedLabel = formatCaseStatusLabel(statusKey, label, locale);

  return (
    <Badge aria-label={`Case status: ${localizedLabel}`} variant={statusVariantByKey[statusKey] ?? "default"}>
      {localizedLabel}
    </Badge>
  );
}
