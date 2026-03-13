import { UserApprovalStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { AdminUserManagementTable } from "@/components/admin/admin-user-management-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUserManagementData } from "@/lib/admin/service";

export default async function AdminUsersPage() {
  await requireRole([UserRole.ADMIN]);
  const { users, pendingCount } = await getAdminUserManagementData();
  const approvedCount = users.filter((user) => user.status === UserApprovalStatus.APPROVED).length;
  const deactivatedCount = users.filter((user) => user.status === UserApprovalStatus.DEACTIVATED).length;
  const officerOrAdminCount = users.filter(
    (user) => user.role === UserRole.OFFICER || user.role === UserRole.ADMIN
  ).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">User management</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Approve or reject registrations, adjust approved user roles, and deactivate access with explicit confirmation before dangerous changes are committed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/audit-log">View audit log</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin">Return to admin overview</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric title="Pending registrations" value={pendingCount.toString()} description="Accounts waiting for review in the current queue." />
        <OverviewMetric title="Approved users" value={approvedCount.toString()} description="Accounts that can reach protected work areas." />
        <OverviewMetric title="Review roles" value={officerOrAdminCount.toString()} description="Users currently assigned to officer or admin responsibilities." />
        <OverviewMetric title="Deactivated users" value={deactivatedCount.toString()} description="Accounts that remain blocked from new sign-ins." />
      </section>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Registration and access control</CardTitle>
          <CardDescription>
            Pending staff requests can be approved or rejected here. Approved accounts can then receive a new role or be deactivated with explicit email confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUserManagementTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}