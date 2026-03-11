import { UserRole } from "@prisma/client";
import { SectionCard } from "@/components/app/section-card";
import { OverviewMetric } from "@/components/app/overview-metric";
import { requireRole } from "@/lib/auth/guards";

export default async function StaffDashboardPage() {
  await requireRole([UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Cases" value="0" description="No staff case workflow is implemented yet in the foundation stage." />
        <OverviewMetric title="Missing documents" value="0" description="Document management will be added after the core case module exists." />
        <OverviewMetric title="Open tasks" value="0" description="Placeholder metrics keep the surface reviewable while workflows are still pending." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Planned staff capabilities"
          description="These pages will become the end-user operational workspace in later milestones."
          points={[
            "Create and manage multiple mobility cases.",
            "Resume drafts and submit completed applications.",
            "Review officer comments and correction requests.",
            "Upload current and final supporting documents securely."
          ]}
        />
        <SectionCard
          title="Current foundation focus"
          description="The shell already provides the right navigational and design direction."
          points={[
            "Protected route access.",
            "Structured dashboard layout.",
            "Consistent institutional styling.",
            "Space reserved for future task and status summaries."
          ]}
        />
      </section>
    </div>
  );
}
