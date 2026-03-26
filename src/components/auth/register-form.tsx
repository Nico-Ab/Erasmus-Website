"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { redirectToPendingApproval } from "@/lib/auth/client-navigation";
import { useHydrated } from "@/hooks/use-hydrated";
import { createRegistrationSchema, type RegistrationInput } from "@/lib/validation/auth";
import { useAppLocale } from "@/components/app/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const { locale, messages } = useAppLocale();
  const isReady = useHydrated();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInteractive = isReady && !isSubmitting;
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(createRegistrationSchema(locale)),
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

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(payload?.message ?? messages.auth.errors.genericRegister);
        return;
      }

      redirectToPendingApproval({
        email: payload?.email ?? values.email,
        registered: true
      });
    } catch {
      setFormError(messages.auth.errors.requestFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{messages.auth.register.title}</CardTitle>
            <CardDescription>{messages.auth.register.description}</CardDescription>
          </div>
          <div className="rounded-full bg-accent p-3 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          data-testid="register-form"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
          <div className="space-y-2">
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">{messages.auth.fields.password}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={!isInteractive}
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{messages.auth.fields.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={!isInteractive}
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
          <Button className="w-full" disabled={!isInteractive} type="submit">
            {isSubmitting
              ? messages.auth.register.submitting
              : isReady
                ? messages.auth.register.submit
                : messages.auth.register.preparing}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{messages.auth.register.approvalProcess}</p>
          <p className="mt-2">{messages.auth.register.approvalLineOne}</p>
          <p>{messages.auth.register.approvalLineTwo}</p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {messages.auth.register.approvedPrompt}{" "}
          <Link className="font-medium text-primary hover:underline" href="/login">
            {messages.auth.register.approvedLink}
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
