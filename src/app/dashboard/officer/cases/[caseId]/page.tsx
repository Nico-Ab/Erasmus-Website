import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { DashboardListPanel } from "@/components/dashboard/dashboard-list-panel";
import { MissingDocumentActions } from "@/components/review/missing-document-actions";
import { ReviewCommentForm } from "@/components/review/review-comment-form";
import { ReviewDocumentPanel } from "@/components/review/review-document-panel";
import { ReviewStatusForm } from "@/components/review/review-status-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { getReviewCaseDetail } from "@/lib/review-workflow/service";

type ReviewCaseDetailPageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function ReviewCaseDetailPage({ params }: ReviewCaseDetailPageProps) {
  await requireRole([UserRole.OFFICER, UserRole.ADMIN]);
  const { caseId } = await params;
  const detail = await getReviewCaseDetail(caseId);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-950">{detail.case.hostInstitution}</h1>
            <CaseStatusBadge label={detail.case.status.label} statusKey={detail.case.status.key} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Review case details, document decisions, comments, and explicit status history from one protected officer workspace.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/officer/cases">Return to review register</Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          title="Staff member"
          value={detail.staff.name}
          description={detail.staff.email}
        />
        <OverviewMetric
          title="Assignment"
          value={detail.staff.faculty ?? "Not assigned"}
          description={detail.staff.department ?? "No department assigned"}
        />
        <OverviewMetric
          title="Mobility"
          value={detail.case.mobilityTypeLabel ?? "Not set"}
          description={detail.case.academicYearLabel ?? "No academic year"}
        />
        <OverviewMetric
          title="Dates"
          value={detail.case.startDateLabel ?? "Not set"}
          description={detail.case.endDateLabel ?? "End date not set"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader>
            <CardTitle>Case summary</CardTitle>
            <CardDescription>Current persisted case details and staff assignment context.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <p className="text-slate-500">Host location</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.hostCity}, {detail.case.hostCountry}</p>
            </div>
            <div>
              <p className="text-slate-500">Academic title</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.staff.academicTitle ?? "Not assigned"}</p>
            </div>
            <div>
              <p className="text-slate-500">Created</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.createdAtLabel}</p>
            </div>
            <div>
              <p className="text-slate-500">Updated</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.updatedAtLabel}</p>
            </div>
            <div>
              <p className="text-slate-500">Submitted</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.submittedAtLabel ?? "Not submitted"}</p>
            </div>
            <div>
              <p className="text-slate-500">Notes</p>
              <p className="mt-1 font-semibold text-slate-950">{detail.case.notes ?? "No staff notes recorded."}</p>
            </div>
          </CardContent>
        </Card>
        <ReviewStatusForm
          caseId={detail.case.id}
          currentStatusKey={detail.case.status.key}
          statusOptions={detail.statusOptions}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <MissingDocumentActions caseId={detail.case.id} missingDocuments={detail.missingDocuments} />
        <ReviewCommentForm caseId={detail.case.id} />
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Document review</h2>
          <p className="mt-2 text-sm text-slate-600">
            Accept or reject current uploaded versions without silently changing the case status.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {detail.documents.map((document) => (
            <ReviewDocumentPanel caseId={detail.case.id} document={document} key={document.documentType.key} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white/95" data-testid="review-comments-list">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Reviewer and staff comments remain timestamped and attributable.</CardDescription>
          </CardHeader>
          <CardContent>
            {detail.comments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No comments have been recorded on this case yet.
              </div>
            ) : (
              <div className="space-y-3">
                {detail.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{comment.authorName}</p>
                      <span className="text-xs text-slate-500">{comment.authorRoleLabel}</span>
                      <span className="text-xs text-slate-500">{comment.createdAtLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <DashboardListPanel
          description="Explicit history of every stored workflow transition on this case."
          emptyDescription="No status history has been recorded yet."
          emptyTitle="No status history"
          items={detail.statusHistory}
          title="Status history"
        />
      </section>
    </div>
  );
}