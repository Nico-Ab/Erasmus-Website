import Link from "next/link";
import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { getProfileSummary } from "@/lib/profile/service";

export default async function StaffDashboardPage() {
  const session = await requireRole([UserRole.STAFF, UserRole.OFFICER, UserRole.ADMIN]);
  const profile = await getProfileSummary(session.user.id);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Profile" value={profile?.faculty?.name ?? "Update needed"} description="Faculty data is now sourced from admin-managed master data." />
        <OverviewMetric title="Department" value={profile?.department?.name ?? "Update needed"} description="Department assignments stay aligned with the selected faculty." />
        <OverviewMetric title="Cases" value="0" description="No staff case workflow is implemented yet in the current slice." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Profile and readiness"
          description="The first staff-owned workflow is now available inside the protected area."
          points={[
            "Edit your own institutional profile.",
            "Keep faculty and department data aligned with master data.",
            "Preserve clean search and reporting inputs for later modules.",
            "Use the structured shell that later case workflows will inherit."
          ]}
        />
        <SectionCard
          title="What comes next"
          description="The larger staff workflow still remains intentionally narrow for now."
          points={[
            "Create and manage multiple mobility cases.",
            "Resume drafts and submit completed applications.",
            "Review officer comments and correction requests.",
            "Upload current and final supporting documents securely."
          ]}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Maintain your institutional profile</h2>
        <p className="mt-2 text-sm text-slate-600">
          Update your name, academic title, faculty, department, and contact email before the case module begins using this data in later milestones.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/profile">Open profile editor</Link>
        </Button>
      </div>
    </div>
  );
}