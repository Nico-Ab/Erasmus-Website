import Link from "next/link";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
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
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/staff">Return to case workspace</Link>
          </Button>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff area", href: "/dashboard/staff" },
          { label: "New case" }
        ]}
        description="Open a new mobility record, save it as a draft while details are still being gathered, or submit it once the required fields are complete."
        eyebrow="Case administration"
        title="Create a mobility case"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric
          title="Workflow entry"
          value="Draft"
          description="Every new case starts as a staff-controlled draft that can be resumed later."
        />
        <OverviewMetric
          title="Submission gate"
          value="Validated"
          description="Required fields and travel dates are checked before submission is accepted."
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