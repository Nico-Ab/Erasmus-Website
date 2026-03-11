import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200 bg-slate-950 text-slate-50">
        <CardHeader>
          <CardTitle className="text-3xl">Access the institutional workspace</CardTitle>
          <CardDescription className="text-slate-300">
            The local foundation includes credentials-based authentication, role-aware routing, and a structured
            dashboard shell aligned with the university administration style guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-200">
          <p>Only approved accounts can enter the protected workspace.</p>
          <p>The pending demo account is seeded to validate approval-gated login behavior later.</p>
          <p>Once signed in, navigation routes users into staff, officer, or admin placeholders.</p>
        </CardContent>
      </Card>
      <LoginForm />
    </div>
  );
}
