import { Badge, type BadgeProps } from "@/components/ui/badge";

const statusVariantByKey: Record<string, NonNullable<BadgeProps["variant"]>> = {
  draft: "muted",
  submitted: "default",
  agreement_uploaded: "info",
  under_review: "warning",
  approved: "success",
  mobility_ongoing: "info",
  certificate_uploaded: "info",
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
  return (
    <Badge aria-label={`Case status: ${label}`} variant={statusVariantByKey[statusKey] ?? "default"}>
      {label}
    </Badge>
  );
}