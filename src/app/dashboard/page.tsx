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
        <OverviewMetric
          title="Foundation phase"
          value="M7"
          description="Secure documents and the first officer review workflow are now live in the current slice."
        />
        <OverviewMetric
          title="Current role"
          value={session.user.role}
          description="Navigation and access remain role-aware across the protected area."
        />
        <OverviewMetric
          title="Next route"
          value={nextDestinationByRole[session.user.role]}
          description="Primary landing path for the signed-in role."
        />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="What is live now"
          description="This dashboard remains intentionally narrow and operationally focused."
          points={[
            "Credentials-based Auth.js login using Prisma-backed users.",
            "Staff self-registration with admin approval gating.",
            "Editable staff profiles tied to master data.",
            "Staff-owned mobility case draft, submission, and private document workflows.",
            "Officer review actions for comments, document decisions, status changes, and archiving."
          ]}
        />
        <SectionCard
          title="What comes next"
          description="Major product workflows still remain intentionally incomplete at this stage."
          points={[
            "Reporting, exports, and archive access surfaces.",
            "Broader admin lifecycle controls such as role changes and deactivation.",
            "Officer-to-staff change-request refinement and richer review automation.",
            "Longer-term storage hardening such as alternate drivers and retention controls."
          ]}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Continue into your primary workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          The role-specific pages now include real mobility case handling for staff plus active review operations for officer and admin users.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={nextDestinationByRole[session.user.role]}>Open my primary area</Link>
          </Button>
          {(session.user.role === UserRole.OFFICER || session.user.role === UserRole.ADMIN) ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/officer/cases">Open review register</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}