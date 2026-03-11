import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboardPage() {
  await requireRole([UserRole.ADMIN]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Pending approvals" value="1" description="The seeded pending user is available to validate later approval workflows." />
        <OverviewMetric title="Master data modules" value="0" description="Master data management has not been implemented yet." />
        <OverviewMetric title="System settings" value="0" description="Settings management remains a later milestone after the foundation stage." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Planned admin controls"
          description="This area will become the operational governance center for the portal."
          points={[
            "Approve or reject registrations.",
            "Change user roles and deactivate accounts.",
            "Manage faculties, departments, and academic years.",
            "Adjust upload, storage, and reporting settings."
          ]}
        />
        <SectionCard
          title="Current foundation focus"
          description="The route exists now so the local app is reviewable across all future roles."
          points={[
            "Admin-only access guard.",
            "Structured shell for dense settings screens.",
            "Space reserved for future user administration tables.",
            "No production feature claims beyond the implemented foundation."
          ]}
        />
      </section>
    </div>
  );
}
