"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentReviewBadge } from "@/components/cases/document-review-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CaseDocumentPanel } from "@/lib/documents/service";

type MobilityCaseDocumentPanelProps = {
  caseId: string;
  document: CaseDocumentPanel;
  uploadPolicy: {
    maxUploadSizeMb: number;
    allowedExtensions: string[];
  };
};

function buildAcceptAttribute(extensions: string[]) {
  return extensions.map((extension) => `.${extension}`).join(",");
}

function getUploadErrorMessage(status: number, fallback: string) {
  if (status === 401) {
    return "Your session has ended. Sign in again to continue uploading documents.";
  }

  if (status === 403) {
    return "You do not have permission to upload documents for this case.";
  }

  return fallback;
}

export function MobilityCaseDocumentPanel({
  caseId,
  document,
  uploadPolicy
}: MobilityCaseDocumentPanelProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(formData: FormData) {
    const selectedFile = formData.get("file");

    if (!(selectedFile instanceof File) || !selectedFile.name.trim()) {
      setError("Choose a file to upload.");
      return false;
    }

    setNotice(null);
    setError(null);
    setIsUploading(true);

    formData.set("documentTypeKey", document.documentType.key);

    try {
      const response = await fetch(`/api/staff/cases/${caseId}/documents`, {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          payload?.message ??
            getUploadErrorMessage(response.status, "The document could not be uploaded.")
        );
        return false;
      }

      setNotice(payload?.message ?? "Document uploaded successfully.");
      router.refresh();
      return true;
    } catch {
      setError("The upload could not be completed. Check your connection and try again.");
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white/95" data-testid={`document-panel-${document.documentType.key}`}>
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
              {document.currentVersion?.originalFilename ?? "No file uploaded yet"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload policy</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {uploadPolicy.maxUploadSizeMb} MB max, {uploadPolicy.allowedExtensions.map((extension) => extension.toUpperCase()).join(", ")}
            </p>
            {document.currentVersion?.reviewedAtLabel ? (
              <p className="mt-2 text-xs text-slate-500">
                Reviewed {document.currentVersion.reviewedAtLabel}
                {document.currentVersion.reviewedByName ? ` | ${document.currentVersion.reviewedByName}` : ""}
              </p>
            ) : null}
          </div>
        </div>

        {document.currentVersion?.reviewComment ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Latest review note</p>
            <p className="mt-1">{document.currentVersion.reviewComment}</p>
          </div>
        ) : null}

        {document.canUpload ? (
          <form
            className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-end"
            data-testid={`document-upload-form-${document.documentType.key}`}
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const uploaded = await handleUpload(formData);

              if (uploaded) {
                event.currentTarget.reset();
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`documentFile-${document.documentType.key}`}>Upload new version</Label>
              <Input
                accept={buildAcceptAttribute(uploadPolicy.allowedExtensions)}
                disabled={isUploading}
                id={`documentFile-${document.documentType.key}`}
                name="file"
                type="file"
              />
            </div>
            <Button disabled={isUploading} type="submit">
              {isUploading ? "Uploading..." : document.currentVersion ? "Upload next version" : "Upload document"}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {document.uploadDisabledReason}
          </div>
        )}

        {notice ? (
          <div
            className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Version history</h3>
            <p className="mt-1 text-sm text-slate-600">
              Every upload is preserved. The current version marker moves forward when a newer file is accepted into the record.
            </p>
          </div>

          {document.versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600">
              No versions uploaded yet. Upload the first file once this requirement is ready for review.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table aria-label={`${document.documentType.label} version history`} className="min-w-full divide-y divide-slate-200 text-sm">
                <caption className="sr-only">
                  Version history for {document.documentType.label}, including current-version markers, review state, and secure downloads.
                </caption>
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold" scope="col">Version</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Filename</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Uploaded</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Review state</th>
                    <th className="px-4 py-3 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {document.versions.map((version) => (
                    <tr key={version.id} data-testid={`document-version-${document.documentType.key}-${version.versionNumber}`}>
                      <td className="px-4 py-3 text-slate-950">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{version.versionLabel}</span>
                          {version.isCurrent ? (
                            <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-900">
                              Current version
                            </span>
                          ) : null}
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