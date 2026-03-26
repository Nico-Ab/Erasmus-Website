import { UserApprovalStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPendingApprovalPath } from "@/lib/auth/paths";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function RegisterPage() {
  const session = await auth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  if (session?.user?.status === UserApprovalStatus.APPROVED) {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect(buildPendingApprovalPath({ email: session.user.email }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl">{messages.auth.publicRegisterPage.title}</CardTitle>
          <CardDescription>{messages.auth.publicRegisterPage.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{messages.auth.publicRegisterPage.beforeAccessTitle}</p>
            <p className="mt-2 leading-6">
              {messages.auth.publicRegisterPage.beforeAccessDescription}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{messages.auth.publicRegisterPage.whatNextTitle}</p>
            <p className="mt-2 leading-6">
              {messages.auth.publicRegisterPage.whatNextDescription}
            </p>
          </div>
          <p>{messages.auth.publicRegisterPage.centralAccounts}</p>
        </CardContent>
      </Card>
      <RegisterForm />
    </div>
  );
}
