import { buildPendingApprovalPath } from "@/lib/auth/paths";

export function redirectToPendingApproval(input: {
  email: string;
  registered?: boolean;
}) {
  window.location.assign(buildPendingApprovalPath(input));
}
