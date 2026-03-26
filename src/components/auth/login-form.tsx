"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { AlertCircle, LogIn } from "lucide-react";
import { authErrorCodes, getLoginErrorMessage } from "@/lib/auth/error-codes";
import { buildPendingApprovalPath } from "@/lib/auth/paths";
import { useHydrated } from "@/hooks/use-hydrated";
import { createLoginSchema, type LoginInput } from "@/lib/validation/auth";
import { useAppLocale } from "@/components/app/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  initialMessage?: string | null;
};

function resolveRedirectPath(url?: string | null) {
  if (!url) {
    return "/dashboard";
  }

  try {
    const resolved = new URL(url, window.location.origin);
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;

    return path || "/dashboard";
  } catch {
    return "/dashboard";
  }
}

export function LoginForm({ initialMessage = null }: LoginFormProps) {
  const router = useRouter();
  const { locale, messages } = useAppLocale();
  const isReady = useHydrated();
  const [notice, setNotice] = useState<string | null>(initialMessage);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInteractive = isReady && !isSubmitting;
  const form = useForm<LoginInput>({
    resolver: zodResolver(createLoginSchema(locale)),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginInput) {
    setNotice(null);
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        redirectTo: "/dashboard"
      });

      if (result?.code === authErrorCodes.pendingApproval) {
        router.push(buildPendingApprovalPath({ email: values.email }));
        router.refresh();
        return;
      }

      if (!result || result.error) {
        setFormError(getLoginErrorMessage(result?.code, locale));
        return;
      }

      router.push(resolveRedirectPath(result.url));
      router.refresh();
    } catch {
      setFormError(getLoginErrorMessage(undefined, locale));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{messages.auth.login.title}</CardTitle>
            <CardDescription>{messages.auth.login.description}</CardDescription>
          </div>
          <div className="rounded-full bg-accent p-3 text-primary">
            <LogIn className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
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
          <div className="space-y-2">
            <Label htmlFor="password">{messages.auth.fields.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={!isInteractive}
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          {notice ? (
            <div
              className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              role="status"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          ) : null}
          {formError ? (
            <div
              className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}
          <Button className="w-full" disabled={!isInteractive} type="submit">
            {isSubmitting
              ? messages.auth.login.submitting
              : isReady
                ? messages.auth.login.submit
                : messages.auth.login.preparing}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{messages.auth.login.demoAccounts}</p>
          <p className="mt-2">
            <code>staff@swu.local</code> / <code>StaffPass123!</code>
          </p>
          <p>
            <code>officer@swu.local</code> / <code>OfficerPass123!</code>
          </p>
          <p>
            <code>admin@swu.local</code> / <code>AdminPass123!</code>
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {messages.auth.login.needAccount}{" "}
          <Link className="font-medium text-primary hover:underline" href="/register">
            {messages.auth.login.registerLink}
          </Link>
          .
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {messages.auth.login.needEntry}{" "}
          <Link className="font-medium text-primary hover:underline" href="/">
            {messages.auth.login.homeLink}
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
