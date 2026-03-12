import { UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { requireApprovedAuth } from "@/lib/auth/guards";

const nextDestinationByRole: Record<UserRole, string> = {
  STAFF: "/dashboard/staff",
  OFFICER: "/dashboard/officer",
  ADMIN: "/dashboard/admin"
};

export default async function DashboardPage() {
  const session = await requireApprovedAuth();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Foundation phase" value="M4" description="Authentication, profile editing, and master-data administration are now live in the current slice." />
        <OverviewMetric title="Current role" value={session.user.role} description="Navigation and access remain role-aware across the protected area." />
        <OverviewMetric title="Next route" value={nextDestinationByRole[session.user.role]} description="Primary landing path for the signed-in role." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="What is live now"
          description="This dashboard remains intentionally narrow and operationally focused."
          points={[
            "Credentials-based Auth.js login using Prisma-backed users.",
            "Staff self-registration with admin approval gating.",
            "Editable staff profiles tied to master data.",
            "Admin-managed faculties, departments, statuses, years, and upload policy."
          ]}
        />
        <SectionCard
          title="What comes next"
          description="Major product workflows remain intentionally unimplemented at this stage."
          points={[
            "Mobility case drafting, submission, and status history.",
            "Private document upload, versioning, and review.",
            "Reporting, exports, and archive access.",
            "Broader admin lifecycle controls such as role changes and deactivation."
          ]}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Continue into your primary workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          The role-specific pages remain structured placeholders where the full mobility workflows have not been implemented yet.
        </p>
        <Button asChild className="mt-4">
          <Link href={nextDestinationByRole[session.user.role]}>Open my primary area</Link>
        </Button>
      </div>
    </div>
  );
}