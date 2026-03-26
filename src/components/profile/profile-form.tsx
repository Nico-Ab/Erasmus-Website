"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@prisma/client";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useAppLocale } from "@/components/app/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useHydrated } from "@/hooks/use-hydrated";
import { createProfileSchema, type ProfileInput } from "@/lib/validation/profile";

type ProfileFormProps = {
  role: UserRole;
  initialValues: ProfileInput;
  academicTitleOptions: Array<{
    id: string;
    key: string;
    label: string;
  }>;
  faculties: Array<{
    id: string;
    code: string;
    name: string;
    isLegacy: boolean;
    departments: Array<{
      id: string;
      code: string;
      name: string;
      facultyId: string;
      isLegacy: boolean;
    }>;
  }>;
  legacySelection: {
    hasLegacyFaculty: boolean;
    hasLegacyDepartment: boolean;
  };
};

export function ProfileForm({
  role,
  initialValues,
  academicTitleOptions,
  faculties,
  legacySelection
}: ProfileFormProps) {
  const router = useRouter();
  const { locale, messages } = useAppLocale();
  const isReady = useHydrated();
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInteractive = isReady && !isSubmitting;
  const form = useForm<ProfileInput>({
    resolver: zodResolver(createProfileSchema(role, locale)),
    defaultValues: initialValues
  });

  const selectedFacultyId = useWatch({
    control: form.control,
    name: "facultyId"
  });
  const selectedDepartmentId = useWatch({
    control: form.control,
    name: "departmentId"
  });
  const selectedFaculty = faculties.find((faculty) => faculty.id === selectedFacultyId) ?? null;
  const visibleDepartments = selectedFaculty?.departments ?? [];
  const departmentPlaceholder = !selectedFacultyId
    ? messages.profile.selectFacultyFirst
    : visibleDepartments.length === 0
      ? messages.profile.noDepartmentsAvailable
      : messages.profile.selectDepartment;

  useEffect(() => {
    const nextVisibleDepartments = faculties.find((faculty) => faculty.id === selectedFacultyId)?.departments ?? [];
    const departmentIsVisible = nextVisibleDepartments.some(
      (department) => department.id === selectedDepartmentId
    );

    if (!departmentIsVisible && selectedDepartmentId) {
      form.setValue("departmentId", "");
    }
  }, [faculties, form, selectedDepartmentId, selectedFacultyId]);

  async function onSubmit(values: ProfileInput) {
    setFormError(null);
    setFormNotice(null);
    setIsSubmitting(true);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      const fieldErrors = payload?.fieldErrors as Record<string, string[] | undefined> | undefined;

      if (fieldErrors) {
        for (const [field, messages] of Object.entries(fieldErrors)) {
          const message = messages?.[0];

          if (message) {
            form.setError(field as keyof ProfileInput, {
              type: "server",
              message
            });
          }
        }
      }

      setFormError(payload?.message ?? messages.profile.updateFailed);
      return;
    }

    setFormNotice(payload?.message ?? messages.profile.updated);
    router.refresh();
  }

  const facultyHelperText =
    role === UserRole.STAFF
      ? messages.profile.facultyHelperStaff
      : messages.profile.facultyHelperCentral;
  const departmentHelperText =
    role === UserRole.STAFF
      ? messages.profile.departmentHelperStaff
      : messages.profile.departmentHelperCentral;

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{messages.profile.formTitle}</CardTitle>
        <CardDescription className="leading-6">
          {messages.profile.formDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          data-testid="profile-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {legacySelection.hasLegacyFaculty || legacySelection.hasLegacyDepartment ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">{messages.profile.legacyTitle}</p>
              <p className="mt-1">
                {messages.profile.legacyDescription}
              </p>
            </div>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{messages.profile.identitySection}</h3>
              <p className="mt-1 text-sm text-slate-600">{messages.profile.identityDescription}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{messages.auth.fields.firstName}</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  disabled={!isInteractive}
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName ? (
                  <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{messages.auth.fields.lastName}</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  disabled={!isInteractive}
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName ? (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">{messages.auth.fields.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={!isInteractive}
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{messages.profile.assignmentSection}</h3>
              <p className="mt-1 text-sm text-slate-600">{messages.profile.assignmentDescription}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="academicTitleOptionId">{messages.profile.academicTitle}</Label>
                <Select
                  id="academicTitleOptionId"
                  disabled={!isInteractive}
                  {...form.register("academicTitleOptionId")}
                >
                  <option value="">{messages.profile.selectAcademicTitle}</option>
                  {academicTitleOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {form.formState.errors.academicTitleOptionId ? (
                  <p className="text-sm text-destructive">{form.formState.errors.academicTitleOptionId.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="facultyId">{messages.profile.faculty}</Label>
                <Select id="facultyId" disabled={!isInteractive} {...form.register("facultyId")}>
                  <option value="">{role === UserRole.STAFF ? messages.profile.selectFaculty : messages.profile.noFacultyAssigned}</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.isLegacy ? `${faculty.name} (legacy value)` : faculty.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs leading-5 text-slate-500">{facultyHelperText}</p>
                {form.formState.errors.facultyId ? (
                  <p className="text-sm text-destructive">{form.formState.errors.facultyId.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="departmentId">{messages.profile.department}</Label>
                <Select
                  id="departmentId"
                  disabled={!isInteractive || visibleDepartments.length === 0}
                  {...form.register("departmentId")}
                >
                  <option value="">{departmentPlaceholder}</option>
                  {visibleDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.isLegacy ? `${department.name} (legacy value)` : department.name}
                    </option>
                  ))}
                </Select>
                <p className="text-xs leading-5 text-slate-500">{departmentHelperText}</p>
                {form.formState.errors.departmentId ? (
                  <p className="text-sm text-destructive">{form.formState.errors.departmentId.message}</p>
                ) : null}
              </div>
            </div>
          </section>

          {formError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
              {formError}
            </div>
          ) : null}
          {formNotice ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
              {formNotice}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={!isInteractive} type="submit">
              <Save className="h-4 w-4" />
              {isSubmitting
                ? messages.profile.saving
                : isReady
                  ? messages.profile.save
                  : messages.profile.preparing}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
