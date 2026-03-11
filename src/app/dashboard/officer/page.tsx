import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { requireRole } from "@/lib/auth/guards";

export default async function OfficerDashboardPage() {
  await requireRole([UserRole.OFFICER, UserRole.ADMIN]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Review queue" value="0" description="The case review workflow will populate this area in a later milestone." />
        <OverviewMetric title="Changes required" value="0" description="Correction loops and officer comments are not implemented yet." />
        <OverviewMetric title="Archived records" value="0" description="Archive management and reporting come after core case handling." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Planned officer workflow"
          description="The eventual officer area will prioritize dense but readable review operations."
          points={[
            "Search and filter submitted mobility cases.",
            "Review document status and version history.",
            "Leave comments and request corrections.",
            "Advance or return case statuses."
          ]}
        />
        <SectionCard
          title="Current shell objectives"
          description="This placeholder confirms the officer route and information density direction early."
          points={[
            "Protected officer-only access.",
            "Structured table and review-panel ready layout.",
            "Formal visual language instead of marketing patterns.",
            "Navigation alignment with later reporting features."
          ]}
        />
      </section>
    </div>
  );
}
