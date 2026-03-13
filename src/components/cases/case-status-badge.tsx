import { Badge } from "@/components/ui/badge";

const statusVariantByKey: Record<string, "default" | "muted" | "success" | "warning"> = {
  draft: "muted",
  submitted: "default",
  agreement_uploaded: "default",
  under_review: "warning",
  approved: "success",
  mobility_ongoing: "default",
  certificate_uploaded: "default",
  completed: "success",
  changes_required: "warning",
  archived: "muted"
};

export function CaseStatusBadge({
  statusKey,
  label
}: {
  statusKey: string;
  label: string;
}) {
  return <Badge variant={statusVariantByKey[statusKey] ?? "default"}>{label}</Badge>;
}