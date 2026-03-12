import { UserApprovalStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUserManagementData } from "@/lib/auth/service";
import { formatRoleLabel, formatStatusLabel } from "@/lib/utils";
import { approveRegistrationAction, rejectRegistrationAction } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short"
});

function getStatusVariant(status: UserApprovalStatus) {
  if (status === UserApprovalStatus.APPROVED) {
    return "success" as const;
  }

  if (status === UserApprovalStatus.PENDING) {
    return "warning" as const;
  }

  return "muted" as const;
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not reviewed";
  }

  return dateFormatter.format(value);
}

function formatUserName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
}) {
  const fallbackName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  return user.name ?? (fallbackName || "Unnamed user");
}

export default async function AdminUsersPage() {
  await requireRole([UserRole.ADMIN]);
  const { users, pendingCount } = await getAdminUserManagementData();
  const approvedCount = users.filter((user) => user.status === UserApprovalStatus.APPROVED).length;
  const rejectedCount = users.filter((user) => user.status === UserApprovalStatus.REJECTED).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">User management</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            This page handles the current registration approval workflow. Staff sign up publicly, then an admin approves or rejects the request before protected access is granted.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/admin">Return to admin overview</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Pending registrations" value={pendingCount.toString()} description="Accounts waiting for review in the current queue." />
        <OverviewMetric title="Approved users" value={approvedCount.toString()} description="Accounts that can reach their protected dashboard area." />
        <OverviewMetric title="Rejected registrations" value={rejectedCount.toString()} description="Requests that remain blocked from the workspace." />
      </section>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Registration review table</CardTitle>
          <CardDescription>
            Officer and admin accounts remain seed-managed at this stage. Approval actions on this page are limited to staff registrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm" aria-label="User management table">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Registered</th>
                  <th className="px-3 py-3 font-medium">Reviewed</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 align-top text-slate-700 last:border-b-0">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{formatUserName(user)}</div>
                      <div className="mt-1 text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-3 py-4">
                      <Badge variant="muted">{formatRoleLabel(user.role)}</Badge>
                    </td>
                    <td className="px-3 py-4">
                      <Badge variant={getStatusVariant(user.status)}>{formatStatusLabel(user.status)}</Badge>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-4 text-xs text-slate-500">{formatDate(user.reviewedAt)}</td>
                    <td className="px-3 py-4">
                      {user.role === UserRole.STAFF ? (
                        <div className="flex flex-wrap gap-2">
                          <form action={approveRegistrationAction}>
                            <input name="userId" type="hidden" value={user.id} />
                            <Button size="sm" type="submit">Approve</Button>
                          </form>
                          <form action={rejectRegistrationAction}>
                            <input name="userId" type="hidden" value={user.id} />
                            <Button size="sm" type="submit" variant="outline">Reject</Button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Managed outside this page</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}