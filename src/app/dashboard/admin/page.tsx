import { UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUserManagementData } from "@/lib/auth/service";

export default async function AdminDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const { pendingCount } = await getAdminUserManagementData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Pending approvals" value={pendingCount.toString()} description="Staff registrations currently waiting for an admin decision." />
        <OverviewMetric title="Master data modules" value="0" description="Master data management has not been implemented yet." />
        <OverviewMetric title="System settings" value="0" description="Settings management remains a later milestone after the foundation stage." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Admin controls available now"
          description="The admin area has started moving from placeholder into a real operational surface."
          points={[
            "Review and approve new staff registrations.",
            "Reject registrations that should not enter the workspace.",
            "Enforce approval state before protected access is granted.",
            "Keep officer and admin access protected server-side."
          ]}
        />
        <SectionCard
          title="Still to be added"
          description="This page remains intentionally narrow while the core product modules are still in progress."
          points={[
            "Role changes and full account lifecycle management.",
            "Master data administration for faculties, departments, and years.",
            "System settings and file-policy management.",
            "Reporting and audit-oriented operational views."
          ]}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">User approval workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          Open the user management route to review pending staff registrations and record approval decisions.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/admin/users">Open user management</Link>
        </Button>
      </div>
    </div>
  );
}