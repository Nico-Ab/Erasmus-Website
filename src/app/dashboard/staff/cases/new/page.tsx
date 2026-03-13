import Link from "next/link";
import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { MobilityCaseForm } from "@/components/cases/mobility-case-form";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import {
  getEmptyMobilityCaseFormValues,
  getMobilityCaseReferenceData
} from "@/lib/mobility-case/service";

export default async function NewMobilityCasePage() {
  await requireRole([UserRole.STAFF]);
  const referenceData = await getMobilityCaseReferenceData();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Create a mobility case</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Start a new Erasmus mobility record, save it as draft while details are incomplete, or submit it once the required fields are ready.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/staff">Return to case workspace</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric
          title="Workflow entry"
          value="Draft"
          description="Every new case starts as a staff-controlled record that can be resumed later."
        />
        <OverviewMetric
          title="Submission gate"
          value="Validated"
          description="Required fields and travel dates are checked before the case can be submitted."
        />
        <OverviewMetric
          title="Persistence"
          value="Database"
          description="Case details and status history are stored in the real PostgreSQL data model."
        />
      </section>

      <MobilityCaseForm
        academicYears={referenceData.academicYears}
        initialValues={getEmptyMobilityCaseFormValues()}
        mobilityTypes={referenceData.mobilityTypes}
      />
    </div>
  );
}