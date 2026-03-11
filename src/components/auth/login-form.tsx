"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { AlertCircle, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/dashboard"
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setFormError("Sign-in failed. Check your credentials or account approval status.");
      return;
    }

    router.push(result.url ?? "/dashboard");
    router.refresh();
  }

  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Secure login</CardTitle>
            <CardDescription>Use your university portal credentials to continue.</CardDescription>
          </div>
          <div className="rounded-full bg-slate-100 p-3 text-slate-700">
            <LogIn className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          {formError ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Development seed accounts</p>
          <p className="mt-2"><code>staff@swu.local</code> / <code>StaffPass123!</code></p>
          <p><code>officer@swu.local</code> / <code>OfficerPass123!</code></p>
          <p><code>admin@swu.local</code> / <code>AdminPass123!</code></p>
          <p className="mt-3 text-xs text-slate-600">
            The pending user is intentionally blocked to demonstrate approval gating.
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Need the system overview first? <Link className="font-medium text-primary hover:underline" href="/">Return to the home page</Link>.
        </p>
      </CardContent>
    </Card>
  );
}
