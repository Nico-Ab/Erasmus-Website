"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";

type ProfileFormProps = {
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
    departments: Array<{
      id: string;
      code: string;
      name: string;
      facultyId: string;
    }>;
  }>;
};

export function ProfileForm({ initialValues, academicTitleOptions, faculties }: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
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
  const visibleDepartments =
    faculties.find((faculty) => faculty.id === selectedFacultyId)?.departments ?? [];

  useEffect(() => {
    const nextVisibleDepartments =
      faculties.find((faculty) => faculty.id === selectedFacultyId)?.departments ?? [];
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

      setFormError(payload?.message ?? "Profile update failed. Please review the form and try again.");
      return;
    }

    setFormNotice(payload?.message ?? "Profile updated successfully.");
    router.refresh();
  }

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle>Editable staff profile</CardTitle>
        <CardDescription>
          Keep your institutional contact and organisational details current for later workflow use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
              {form.formState.errors.firstName ? (
                <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
              {form.formState.errors.lastName ? (
                <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicTitleOptionId">Academic title</Label>
              <Select id="academicTitleOptionId" {...form.register("academicTitleOptionId")}>
                <option value="">Select academic title</option>
                {academicTitleOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {form.formState.errors.academicTitleOptionId ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.academicTitleOptionId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facultyId">Faculty</Label>
              <Select id="facultyId" {...form.register("facultyId")}>
                <option value="">Select faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.facultyId ? (
                <p className="text-sm text-destructive">{form.formState.errors.facultyId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                id="departmentId"
                disabled={visibleDepartments.length === 0}
                {...form.register("departmentId")}
              >
                <option value="">
                  {visibleDepartments.length === 0 ? "Select faculty first" : "Select department"}
                </option>
                {visibleDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.departmentId ? (
                <p className="text-sm text-destructive">{form.formState.errors.departmentId.message}</p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {formError}
            </div>
          ) : null}
          {formNotice ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {formNotice}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}