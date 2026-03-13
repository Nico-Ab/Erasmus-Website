"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type MissingDocumentActionsProps = {
  caseId: string;
  missingDocuments: Array<{
    key: string;
    label: string;
  }>;
};

export function MissingDocumentActions({ caseId, missingDocuments }: MissingDocumentActionsProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (missingDocuments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Missing required documents</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          All required document types currently have a stored current version.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white/95 p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Missing required documents</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record a formal review note when a required document has not yet been uploaded to the case file.
        </p>
      </div>
      <div className="space-y-3">
        {missingDocuments.map((document) => (
          <div key={document.key} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">{document.label}</p>
              <p className="mt-1 text-sm text-slate-600">No current version is available for review.</p>
            </div>
            <Button
              data-testid={`missing-document-action-${document.key}`}
              disabled={activeKey === document.key}
              onClick={async () => {
                setNotice(null);
                setError(null);
                setActiveKey(document.key);

                const response = await fetch(`/api/review/cases/${caseId}/missing-documents`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ documentTypeKey: document.key, note: "Officer marked this document as missing." })
                });
                const payload = await response.json().catch(() => null);

                setActiveKey(null);

                if (!response.ok) {
                  setError(payload?.message ?? "Missing-document note could not be recorded.");
                  return;
                }

                setNotice(payload?.message ?? "Missing-document note recorded successfully.");
                router.refresh();
              }}
              type="button"
              variant="outline"
            >
              {activeKey === document.key ? "Recording note..." : "Mark as missing"}
            </Button>
          </div>
        ))}
      </div>
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
    </div>
  );
}