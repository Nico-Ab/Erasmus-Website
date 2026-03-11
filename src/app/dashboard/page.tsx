import { UserRole } from "@prisma/client";
import Link from "next/link";
import { OverviewMetric } from "@/components/app/overview-metric";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/guards";

const nextDestinationByRole: Record<UserRole, string> = {
  STAFF: "/dashboard/staff",
  OFFICER: "/dashboard/officer",
  ADMIN: "/dashboard/admin"
};

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric title="Foundation phase" value="M1" description="Application shell, auth, testing, and Prisma wiring are in place." />
        <OverviewMetric title="Current role" value={session.user.role} description="Navigation and access are already role-aware in the protected area." />
        <OverviewMetric title="Next route" value={nextDestinationByRole[session.user.role]} description="Primary landing path for the signed-in role." />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="What is live now"
          description="This dashboard is intentionally narrow and foundation-focused."
          points={[
            "Credentials-based Auth.js login using Prisma-backed users.",
            "Role-aware protected navigation for staff, officer, and admin spaces.",
            "Status page and health API for local observability.",
            "Testing stack wired with Vitest, React Testing Library, and Playwright."
          ]}
        />
        <SectionCard
          title="What comes next"
          description="Major product workflows remain intentionally unimplemented at this stage."
          points={[
            "Staff registration and approval workflow.",
            "Mobility case drafting, submission, and status history.",
            "Private document upload, versioning, and review.",
            "Reporting, exports, and full admin management."
          ]}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Continue into your primary workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          The role-specific placeholder pages keep the authenticated shell reviewable before feature workflows are built.
        </p>
        <Button asChild className="mt-4">
          <Link href={nextDestinationByRole[session.user.role]}>Open my primary area</Link>
        </Button>
      </div>
    </div>
  );
}
