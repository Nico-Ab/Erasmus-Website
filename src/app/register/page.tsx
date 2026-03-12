import { UserApprovalStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPendingApprovalPath } from "@/lib/auth/paths";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user?.status === UserApprovalStatus.APPROVED) {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect(buildPendingApprovalPath({ email: session.user.email }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200 bg-slate-950 text-slate-50">
        <CardHeader>
          <CardTitle className="text-3xl">Register a staff account</CardTitle>
          <CardDescription className="text-slate-300">
            Staff registrations are open locally so the approval workflow can be reviewed early alongside the protected role areas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-200">
          <p>Every new self-registration is created as a staff account in a pending approval state.</p>
          <p>Approval is handled inside the admin workspace and enforced on the server before dashboard access is granted.</p>
          <p>Officer and admin accounts remain seed-managed for the local foundation stage.</p>
        </CardContent>
      </Card>
      <RegisterForm />
    </div>
  );
}