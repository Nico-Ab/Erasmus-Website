"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { buildPendingApprovalPath } from "@/lib/auth/paths";
import { registrationSchema, type RegistrationInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: RegistrationInput) {
    setFormError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = await response.json().catch(() => null);

    setIsSubmitting(false);

    if (!response.ok) {
      setFormError(payload?.message ?? "Registration failed. Please review the form and try again.");
      return;
    }

    router.push(
      buildPendingApprovalPath({
        email: payload?.email ?? values.email,
        registered: true
      })
    );
    router.refresh();
  }

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Staff registration</CardTitle>
            <CardDescription>
              New staff accounts are reviewed by an administrator before full access is granted.
            </CardDescription>
          </div>
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-2">
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
          </div>
          {formError ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Submitting..." : "Submit registration"}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Approval process</p>
          <p className="mt-2">After submission, your account enters a pending review state.</p>
          <p>The Erasmus office or an administrator must approve the account before dashboard access is enabled.</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Already approved?{" "}
          <Link className="font-medium text-primary hover:underline" href="/login">
            Go to login
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}