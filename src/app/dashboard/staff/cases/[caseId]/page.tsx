import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
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
  const hostLocation = [detail.case.hostCity, detail.case.hostCountry].filter(Boolean).join(", ") || "Not set";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/staff">Return to case workspace</Link>
          </Button>
        }
        badges={<CaseStatusBadge label={detail.case.status.label} statusKey={detail.case.status.key} />}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Staff area", href: "/dashboard/staff" },
          { label: "Case detail" }
        ]}
        description="Review the current status, recorded case details, comments, and private document history for this mobility record."
        eyebrow="Case administration"
        meta={
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Host institution</dt>
              <dd className="mt-1 font-semibold text-slate-950">{detail.case.hostInstitution || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Mobility type</dt>
              <dd className="mt-1 font-semibold text-slate-950">{detail.case.mobilityTypeLabel ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Academic year</dt>
              <dd className="mt-1 font-semibold text-slate-950">{detail.case.academicYearLabel ?? "Not set"}</dd>
            </div>
          </dl>
        }
        title="Mobility case detail"
      />

      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
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
          description="Submission date becomes available once the case leaves draft."
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
            <CardTitle>Case record</CardTitle>
            <CardDescription className="leading-6">Current persisted values stored on the mobility case.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Academic year</dt>
                <dd className="mt-1 font-semibold text-slate-950">{detail.case.academicYearLabel ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Mobility type</dt>
                <dd className="mt-1 font-semibold text-slate-950">{detail.case.mobilityTypeLabel ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Host institution</dt>
                <dd className="mt-1 font-semibold text-slate-950">{detail.case.hostInstitution || "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Host location</dt>
                <dd className="mt-1 font-semibold text-slate-950">{hostLocation}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Travel dates</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {detail.case.startDate && detail.case.endDate
                    ? `${detail.case.startDate} to ${detail.case.endDate}`
                    : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="mt-1 font-semibold text-slate-950">{detail.case.createdAtLabel}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Staff note</dt>
                <dd className="mt-1 font-semibold text-slate-950">{detail.case.notes?.trim() || "No note recorded."}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Required documents</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Documents stay private, remain versioned, and are available only through permission-checked download routes.
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
          description="Officer and administrator comments recorded against this case."
          emptyTitle="No comments yet"
          emptyDescription="There are no recorded comments on this case yet."
          items={detail.comments}
        />
      </section>
    </div>
  );
}