import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { MobilityCaseDocumentPanel } from "@/components/cases/mobility-case-document-panel";
import { MobilityCaseForm, ReadOnlyCaseNotice } from "@/components/cases/mobility-case-form";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getStaffMobilityCaseDetail } from "@/lib/mobility-case/service";

type MobilityCaseDetailPageProps = {
  params: Promise<{
    caseId: string;
  }>;
  searchParams: Promise<{
    saved?: string | string[];
  }>;
};

function readSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getNoticeMessage(saved?: string) {
  if (saved === "draft") {
    return "Draft saved successfully.";
  }

  if (saved === "submitted") {
    return "Case submitted successfully.";
  }

  return null;
}

export default async function MobilityCaseDetailPage({
  params,
  searchParams
}: MobilityCaseDetailPageProps) {
  const session = await requireRole([UserRole.STAFF]);
  const { caseId } = await params;
  const detail = await getStaffMobilityCaseDetail(session.user.id, caseId);

  if (!detail) {
    notFound();
  }

  const notice = getNoticeMessage(readSingleValue((await searchParams).saved));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-950">Mobility case detail</h1>
            <CaseStatusBadge label={detail.case.status.label} statusKey={detail.case.status.key} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review the current status, comments, recorded case details, and the private document record for this mobility case.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/staff">Return to case workspace</Link>
        </Button>
      </section>

      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric
          title="Current status"
          value={detail.case.status.label}
          description="Current workflow state stored in the case-status definition table."
        />
        <OverviewMetric
          title="Last updated"
          value={detail.case.updatedAtLabel}
          description="Most recent persistence timestamp for the case record."
        />
        <OverviewMetric
          title="Submitted on"
          value={detail.case.submittedAtLabel ?? "Not submitted"}
          description="Submission date appears once the case moves out of draft."
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {detail.isEditable ? (
            <MobilityCaseForm
              academicYears={detail.academicYears}
              caseId={detail.case.id}
              currentStatus={detail.case.status}
              initialValues={{
                academicYearId: detail.case.academicYearId,
                mobilityTypeOptionId: detail.case.mobilityTypeOptionId,
                hostInstitution: detail.case.hostInstitution,
                hostCountry: detail.case.hostCountry,
                hostCity: detail.case.hostCity,
                startDate: detail.case.startDate,
                endDate: detail.case.endDate,
                notes: detail.case.notes
              }}
              mobilityTypes={detail.mobilityTypes}
            />
          ) : (
            <ReadOnlyCaseNotice />
          )}
        </div>

        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Recorded summary</CardTitle>
            <CardDescription>Current persisted values for the staff-owned mobility case.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-slate-500">Academic year</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.academicYearLabel ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-slate-500">Mobility type</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.mobilityTypeLabel ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-slate-500">Host institution</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.hostInstitution || "Not set"}</p>
            </div>
            <div>
              <p className="text-slate-500">Host location</p>
              <p className="mt-1 font-semibold text-slate-950">
                {[detail.case.hostCity, detail.case.hostCountry].filter(Boolean).join(", ") || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Travel dates</p>
              <p className="mt-1 font-semibold text-slate-950">
                {detail.case.startDate && detail.case.endDate
                  ? `${detail.case.startDate} to ${detail.case.endDate}`
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Created</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.createdAtLabel}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Required documents</h2>
          <p className="mt-2 text-sm text-slate-600">
            Uploaded files stay private, remain versioned, and are only available through permission-checked download routes.
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Current upload policy: {detail.documentUploadPolicy.maxUploadSizeMb} MB maximum, {detail.documentUploadPolicy.allowedExtensions.map((extension) => extension.toUpperCase()).join(", ")}.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {detail.documents.map((document) => (
            <MobilityCaseDocumentPanel
              caseId={detail.case.id}
              document={document}
              key={document.documentType.key}
              uploadPolicy={detail.documentUploadPolicy}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardListPanel
          title="Status history"
          description="Explicit case-status transitions recorded as the workflow changes over time."
          emptyTitle="No status history yet"
          emptyDescription="Status transitions will appear here once the case record changes state."
          items={detail.statusHistory}
        />
        <DashboardListPanel
          title="Comments"
          description="Officer and admin comments will appear here once review actions begin using the case record."
          emptyTitle="No comments yet"
          emptyDescription="There are no recorded comments on this case yet."
          items={detail.comments}
        />
      </section>
    </div>
  );
}