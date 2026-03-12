import { UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUserManagementData } from "@/lib/auth/service";
import { getMasterDataPageData } from "@/lib/master-data/service";

export default async function AdminDashboardPage() {
  await requireRole([UserRole.ADMIN]);
  const [{ pendingCount }, masterData] = await Promise.all([
    getAdminUserManagementData(),
    getMasterDataPageData()
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Pending approvals" value={pendingCount.toString()} description="Staff registrations currently waiting for an admin decision." />
        <OverviewMetric title="Master data records" value={(masterData.faculties.length + masterData.departments.length + masterData.academicYears.length + masterData.statuses.length).toString()} description="Combined faculty, department, year, and status records." />
        <OverviewMetric title="Upload cap" value={`${masterData.uploadSetting.maxUploadSizeMb} MB`} description="Current upload policy managed within the admin workspace." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Admin controls available now"
          description="The admin area now combines account approval and foundational reference-data management."
          points={[
            "Review and approve new staff registrations.",
            "Reject registrations that should not enter the workspace.",
            "Manage faculties, departments, academic years, statuses, and select-list values.",
            "Adjust the operational upload policy inside environment guardrails."
          ]}
        />
        <SectionCard
          title="Still to be added"
          description="This page remains intentionally focused while the core product modules are still in progress."
          points={[
            "Role changes and full account lifecycle management.",
            "System settings beyond upload policy and reference data.",
            "Reporting and audit-oriented operational views.",
            "Case and document governance tools for later milestones."
          ]}
        />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-950">User approval workspace</h2>
          <p className="mt-2 text-sm text-slate-600">
            Open the user management route to review pending staff registrations and record approval decisions.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users">Open user management</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Master-data workspace</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage the reference records that later profile, case, document, and reporting workflows will rely on.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/dashboard/admin/master-data">Open master data</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}