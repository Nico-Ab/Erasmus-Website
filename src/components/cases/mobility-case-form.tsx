"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePenLine, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  mobilityCaseDraftSchema,
  mobilityCaseSubmitSchema,
  type MobilityCaseFormValues,
  type MobilityCaseIntent
} from "@/lib/validation/mobility-case";

type MobilityCaseFormProps = {
  academicYears: Array<{
    id: string;
    label: string;
  }>;
  mobilityTypes: Array<{
    id: string;
    key: string;
    label: string;
  }>;
  initialValues: MobilityCaseFormValues;
  caseId?: string;
  currentStatus?: {
    key: string;
    label: string;
  };
};

function applyFieldErrors(
  form: ReturnType<typeof useForm<MobilityCaseFormValues>>,
  fieldErrors?: Record<string, string[] | undefined>
) {
  if (!fieldErrors) {
    return;
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];

    if (message) {
      form.setError(field as keyof MobilityCaseFormValues, {
        type: "server",
        message
      });
    }
  }
}

function readText(formData: FormData, name: keyof MobilityCaseFormValues) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readCurrentValues(formData: FormData) {
  return {
    academicYearId: readText(formData, "academicYearId"),
    mobilityTypeOptionId: readText(formData, "mobilityTypeOptionId"),
    hostInstitution: readText(formData, "hostInstitution"),
    hostCountry: readText(formData, "hostCountry"),
    hostCity: readText(formData, "hostCity"),
    startDate: readText(formData, "startDate"),
    endDate: readText(formData, "endDate"),
    notes: readText(formData, "notes")
  } satisfies MobilityCaseFormValues;
}

function subscribeToHydration() {
  return () => undefined;
}

export function MobilityCaseForm({
  academicYears,
  mobilityTypes,
  initialValues,
  caseId,
  currentStatus
}: MobilityCaseFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const isHydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<MobilityCaseFormValues>({
    resolver: zodResolver(mobilityCaseDraftSchema),
    defaultValues: initialValues
  });
  const controlsDisabled = !isHydrated || isSaving || isSubmitting;

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  async function persistValues(intent: MobilityCaseIntent, currentValues: MobilityCaseFormValues) {
    form.clearErrors();
    setFormError(null);

    const draftValues = mobilityCaseDraftSchema.safeParse(currentValues);

    if (!draftValues.success) {
      applyFieldErrors(form, draftValues.error.flatten().fieldErrors);
      setFormError("Review the case details and try again.");
      return;
    }

    if (intent === "submit") {
      const submitValues = mobilityCaseSubmitSchema.safeParse(draftValues.data);

      if (!submitValues.success) {
        applyFieldErrors(form, submitValues.error.flatten().fieldErrors);
        setFormError("Complete the required fields before submitting the case.");
        return;
      }
    }

    if (intent === "submit") {
      setIsSubmitting(true);
    } else {
      setIsSaving(true);
    }

    const response = await fetch(caseId ? `/api/staff/cases/${caseId}` : "/api/staff/cases", {
      method: caseId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...draftValues.data,
        intent
      })
    });
    const payload = await response.json().catch(() => null);

    setIsSaving(false);
    setIsSubmitting(false);

    if (!response.ok) {
      applyFieldErrors(form, payload?.fieldErrors as Record<string, string[] | undefined> | undefined);
      setFormError(payload?.message ?? "The case could not be saved.");
      return;
    }

    router.push(payload?.redirectTo ?? "/dashboard/staff");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const intent =
      submitter instanceof HTMLButtonElement && submitter.value === "submit"
        ? "submit"
        : "saveDraft";

    await persistValues(intent, readCurrentValues(new FormData(event.currentTarget)));
  }

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{caseId ? "Case details" : "New mobility case"}</CardTitle>
            <CardDescription>
              Capture the academic year, mobility type, host details, travel dates, and optional notes.
            </CardDescription>
          </div>
          {currentStatus ? <CaseStatusBadge label={currentStatus.label} statusKey={currentStatus.key} /> : null}
        </div>
      </CardHeader>
      <CardContent>
        <form
          aria-busy={controlsDisabled}
          className="space-y-6"
          data-testid={caseId ? "mobility-case-edit-form" : "mobility-case-create-form"}
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="academicYearId">Academic year</Label>
              <Select disabled={controlsDisabled} id="academicYearId" {...form.register("academicYearId")}>
                <option value="">Select academic year</option>
                {academicYears.map((academicYear) => (
                  <option key={academicYear.id} value={academicYear.id}>
                    {academicYear.label}
                  </option>
                ))}
              </Select>
              {form.formState.errors.academicYearId ? (
                <p className="text-sm text-destructive">{form.formState.errors.academicYearId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobilityTypeOptionId">Mobility type</Label>
              <Select disabled={controlsDisabled} id="mobilityTypeOptionId" {...form.register("mobilityTypeOptionId")}>
                <option value="">Select mobility type</option>
                {mobilityTypes.map((mobilityType) => (
                  <option key={mobilityType.id} value={mobilityType.id}>
                    {mobilityType.label}
                  </option>
                ))}
              </Select>
              {form.formState.errors.mobilityTypeOptionId ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.mobilityTypeOptionId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hostInstitution">Host institution</Label>
              <Input disabled={controlsDisabled} id="hostInstitution" {...form.register("hostInstitution")} />
              {form.formState.errors.hostInstitution ? (
                <p className="text-sm text-destructive">{form.formState.errors.hostInstitution.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostCountry">Host country</Label>
              <Input disabled={controlsDisabled} id="hostCountry" {...form.register("hostCountry")} />
              {form.formState.errors.hostCountry ? (
                <p className="text-sm text-destructive">{form.formState.errors.hostCountry.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hostCity">Host city</Label>
              <Input disabled={controlsDisabled} id="hostCity" {...form.register("hostCity")} />
              {form.formState.errors.hostCity ? (
                <p className="text-sm text-destructive">{form.formState.errors.hostCity.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea disabled={controlsDisabled} id="notes" rows={4} {...form.register("notes")} />
              {form.formState.errors.notes ? (
                <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input disabled={controlsDisabled} id="startDate" type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate ? (
                <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input disabled={controlsDisabled} id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate ? (
                <p className="text-sm text-destructive">{form.formState.errors.endDate.message}</p>
              ) : null}
            </div>
          </div>

          {!isHydrated ? <p className="text-sm text-slate-500">Preparing case form...</p> : null}

          {formError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button disabled={controlsDisabled} type="submit" value="saveDraft" variant="outline">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving draft..." : caseId ? "Save draft changes" : "Save draft"}
            </Button>
            <Button disabled={controlsDisabled} type="submit" value="submit">
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit case"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ReadOnlyCaseNotice() {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">
            <FilePenLine className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Case is currently read-only</CardTitle>
            <CardDescription>
              Submitted cases remain visible here. Editing can resume later when a real changes-required workflow is introduced.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}