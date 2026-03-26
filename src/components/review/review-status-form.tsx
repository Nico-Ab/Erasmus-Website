"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppLocale } from "@/components/app/locale-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ReviewStatusFormProps = {
  caseId: string;
  currentStatusKey: string;
  statusOptions: Array<{
    key: string;
    label: string;
  }>;
};

export function ReviewStatusForm({ caseId, currentStatusKey, statusOptions }: ReviewStatusFormProps) {
  const router = useRouter();
  const { locale } = useAppLocale();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submitStatus(nextStatusKey: string, note: string) {
    setNotice(null);
    setError(null);
    setIsSaving(true);

    const response = await fetch(`/api/review/cases/${caseId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nextStatusKey, note })
    });
    const payload = await response.json().catch(() => null);

    setIsSaving(false);

    if (!response.ok) {
      setError(payload?.message ?? (locale === "bg" ? "Статусът на случая не можа да бъде обновен." : "Case status could not be updated."));
      return false;
    }

    setNotice(payload?.message ?? (locale === "bg" ? "Статусът на случая е обновен успешно." : "Case status updated successfully."));
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{locale === "bg" ? "Статус на процеса" : "Workflow status"}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {locale === "bg" ? "Записвайте преходите на статуса на случая, без да променяте записа за преглед на документите." : "Record case-status transitions without changing the document review record."}
        </p>
      </div>
      <form
        className="space-y-4"
        data-testid="review-status-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const nextStatusKey = String(formData.get("nextStatusKey") ?? "");
          const note = String(formData.get("note") ?? "");
          await submitStatus(nextStatusKey, note);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="nextStatusKey">{locale === "bg" ? "Нов статус" : "New status"}</Label>
          <Select defaultValue="" disabled={isSaving || currentStatusKey === "archived"} id="nextStatusKey" name="nextStatusKey">
            <option value="">{locale === "bg" ? "Изберете статус на процеса" : "Select workflow status"}</option>
            {statusOptions.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="statusNote">{locale === "bg" ? "Бележка за прехода" : "Transition note"}</Label>
          <Textarea disabled={isSaving || currentStatusKey === "archived"} id="statusNote" name="note" rows={4} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {currentStatusKey === "completed" ? (
            <Button
              disabled={isSaving}
              onClick={async () => {
                await submitStatus("archived", "Case archived after completion review.");
              }}
              type="button"
              variant="outline"
            >
              {isSaving ? (locale === "bg" ? "Архивиране..." : "Archiving...") : (locale === "bg" ? "Архивирай завършения случай" : "Archive completed case")}
            </Button>
          ) : null}
          <Button disabled={isSaving || currentStatusKey === "archived"} type="submit">
            {isSaving ? (locale === "bg" ? "Запазване на статуса..." : "Saving status...") : (locale === "bg" ? "Запази промяната на статуса" : "Save status change")}
          </Button>
        </div>
      </form>
      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert">{error}</div>
      ) : null}
      {currentStatusKey === "archived" ? (
        <p className="text-sm leading-6 text-slate-600">{locale === "bg" ? "Този случай е архивиран и остава достъпен за търсене, но тук не са налични допълнителни промени по процеса." : "This case is archived and remains searchable, but no further workflow changes are available here."}</p>
      ) : null}
    </div>
  );
}
