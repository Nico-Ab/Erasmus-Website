"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentReviewBadge } from "@/components/cases/document-review-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CaseDocumentPanel } from "@/lib/documents/service";

type ReviewDocumentPanelProps = {
  caseId: string;
  document: CaseDocumentPanel;
};

function getReviewErrorMessage(status: number) {
  if (status === 401) {
    return "Your session has ended. Sign in again to continue reviewing documents.";
  }

  if (status === 403) {
    return "You no longer have permission to review this document.";
  }

  return "Document review could not be saved.";
}

export function ReviewDocumentPanel({ caseId, document }: ReviewDocumentPanelProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentVersionId = document.currentVersion?.id ?? "";

  return (
    <Card className="border-slate-200 bg-white/95" data-testid={`review-document-panel-${document.documentType.key}`}>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{document.documentType.label}</CardTitle>
            <CardDescription>{document.uploadHint}</CardDescription>
          </div>
          <DocumentReviewBadge
            label={document.currentReviewStateLabel}
            reviewStateKey={document.currentVersion?.reviewState.key ?? "NOT_UPLOADED"}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current version</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {document.currentVersion ? document.currentVersion.versionLabel : "Not uploaded"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest file</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {document.currentVersion?.originalFilename ?? "No current file on record"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest review</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {document.currentVersion?.reviewState.label ?? "Not uploaded"}
            </p>
            {document.currentVersion?.reviewedAtLabel ? (
              <p className="mt-1 text-xs text-slate-500">
                {document.currentVersion.reviewedAtLabel}
                {document.currentVersion.reviewedByName ? ` | ${document.currentVersion.reviewedByName}` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {document.currentVersion ? (
          <form
            className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            data-testid={`review-document-form-${document.documentType.key}`}
            onSubmit={async (event) => {
              event.preventDefault();
              setNotice(null);
              setError(null);
              setIsSaving(true);

              const formData = new FormData(event.currentTarget);
              const submitter = event.nativeEvent instanceof SubmitEvent ? event.nativeEvent.submitter : null;
              const decision = submitter instanceof HTMLButtonElement ? submitter.value : "accept";
              const reason = String(formData.get("reason") ?? "").trim();

              if (decision === "reject" && reason.length === 0) {
                setError("Provide a reason when rejecting a document.");
                setIsSaving(false);
                return;
              }

              try {
                const response = await fetch(`/api/review/cases/${caseId}/documents/review`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    versionId: currentVersionId,
                    decision,
                    reason
                  })
                });
                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                  setError(payload?.message ?? getReviewErrorMessage(response.status));
                  return;
                }

                setNotice(payload?.message ?? "Document review saved successfully.");
                router.refresh();
              } catch {
                setError("Document review could not be saved right now. Please try again.");
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`reviewReason-${document.documentType.key}`}>Review note</Label>
              <Textarea disabled={isSaving} id={`reviewReason-${document.documentType.key}`} name="reason" rows={4} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button disabled={isSaving} type="submit" value="accept" variant="outline">
                {isSaving ? "Saving review..." : "Accept current version"}
              </Button>
              <Button disabled={isSaving} type="submit" value="reject">
                {isSaving ? "Saving review..." : "Reject current version"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
            No uploaded version is currently on file for review. Ask staff to upload the required document before review continues.
          </div>
        )}

        {notice ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Version history</h3>
              <p className="mt-1 text-sm text-slate-600">
                Document review remains version-specific. Case status changes must still be recorded separately.
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {document.versions.length} version{document.versions.length === 1 ? "" : "s"} on file
            </p>
          </div>

          {document.versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
              No versions uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table aria-label={`${document.documentType.label} review history`} className="min-w-full divide-y divide-slate-200 text-sm">
                <caption className="sr-only">
                  Review history for {document.documentType.label}, including current version markers, review notes, and secure downloads.
                </caption>
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold" scope="col">Version</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Filename</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Uploaded</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Review</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {document.versions.map((version) => (
                    <tr
                      className="transition-colors hover:bg-slate-50/60"
                      key={version.id}
                      data-testid={`review-document-version-${document.documentType.key}-${version.versionNumber}`}
                    >
                      <td className="px-4 py-3 text-slate-950">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{version.versionLabel}</span>
                          {version.isCurrent ? <Badge variant="info">Current version</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium text-slate-950">{version.originalFilename}</p>
                        <p className="text-xs text-slate-500">{version.sizeLabel}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{version.uploadedAtLabel}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="space-y-2">
                          <DocumentReviewBadge label={version.reviewState.label} reviewStateKey={version.reviewState.key} />
                          {version.reviewComment ? <p className="text-xs text-slate-600">{version.reviewComment}</p> : null}
                          {version.reviewedAtLabel ? (
                            <p className="text-xs text-slate-500">
                              {version.reviewedAtLabel}
                              {version.reviewedByName ? ` | ${version.reviewedByName}` : ""}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Button asChild size="sm" variant="outline">
                          <a href={version.downloadPath}>Download</a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
