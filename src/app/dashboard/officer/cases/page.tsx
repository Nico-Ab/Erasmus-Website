import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { ReviewCaseFilters } from "@/components/review/review-case-filters";
import { ReviewCaseTable } from "@/components/review/review-case-table";
import { requireRole } from "@/lib/auth/guards";
import { getReviewCaseListData } from "@/lib/review-workflow/service";
import { reviewCaseFiltersSchema } from "@/lib/validation/review-workflow";

type ReviewCasesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ReviewCasesPage({ searchParams }: ReviewCasesPageProps) {
  await requireRole([UserRole.OFFICER, UserRole.ADMIN]);
  const rawSearchParams = await searchParams;
  const filters = reviewCaseFiltersSchema.parse({
    search: readSingleValue(rawSearchParams.search),
    statusDefinitionId: readSingleValue(rawSearchParams.statusDefinitionId),
    academicYearId: readSingleValue(rawSearchParams.academicYearId),
    facultyId: readSingleValue(rawSearchParams.facultyId),
    departmentId: readSingleValue(rawSearchParams.departmentId),
    mobilityTypeOptionId: readSingleValue(rawSearchParams.mobilityTypeOptionId),
    country: readSingleValue(rawSearchParams.country),
    hostInstitution: readSingleValue(rawSearchParams.hostInstitution)
  });
  const data = await getReviewCaseListData(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Review cases" }
        ]}
        description="Search the full mobility case register, combine filters freely, and review case and document decisions from one operational workspace."
        eyebrow="Review operations"
        title="Case review workspace"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OverviewMetric
          title="Results"
          value={data.metrics.totalResults.toString()}
          description="Cases currently matching the active search and filter set."
        />
        <OverviewMetric
          title="Submitted"
          value={data.metrics.submittedCount.toString()}
          description="Submitted cases still visible inside the filtered review queue."
        />
        <OverviewMetric
          title="Open review"
          value={data.metrics.openReviewCount.toString()}
          description="Cases that remain outside the archived state in the filtered result set."
        />
        <OverviewMetric
          title="Missing documents"
          value={data.metrics.missingDocumentsCount.toString()}
          description="Required document gaps currently visible in the filtered result set."
        />
        <OverviewMetric
          title="Archived"
          value={data.metrics.archivedCount.toString()}
          description="Archived records remain searchable here for later lookup and export work."
        />
      </section>

      <ReviewCaseFilters data={data} />
      <ReviewCaseTable cases={data.cases} />
    </div>
  );
}