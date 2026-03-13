"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewCommentFormProps = {
  caseId: string;
};

function getCommentErrorMessage(status: number) {
  if (status === 401) {
    return "Your session has ended. Sign in again to continue reviewing cases.";
  }

  if (status === 403) {
    return "You no longer have permission to add comments to this case.";
  }

  return "Comment could not be added.";
}

export function ReviewCommentForm({ caseId }: ReviewCommentFormProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white/95 p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Leave comment</h2>
        <p className="mt-1 text-sm text-slate-600">
          Comments remain separate from status changes so review reasoning stays visible to staff and later reviewers.
        </p>
      </div>
      <form
        className="space-y-4"
        data-testid="review-comment-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setNotice(null);
          setError(null);

          const formData = new FormData(event.currentTarget);
          const body = String(formData.get("body") ?? "").trim();

          if (!body) {
            setError("Comment is required.");
            return;
          }

          setIsSaving(true);

          try {
            const response = await fetch(`/api/review/cases/${caseId}/comments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ body })
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
              setError(payload?.message ?? getCommentErrorMessage(response.status));
              return;
            }

            event.currentTarget.reset();
            setNotice(payload?.message ?? "Comment added successfully.");
            router.refresh();
          } catch {
            setError("Comment could not be saved right now. Please try again.");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="reviewCommentBody">Comment</Label>
          <Textarea disabled={isSaving} id="reviewCommentBody" name="body" rows={5} />
        </div>
        <div className="flex justify-end">
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving comment..." : "Add comment"}
          </Button>
        </div>
      </form>
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