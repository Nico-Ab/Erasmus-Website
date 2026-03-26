import { UserApprovalStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authErrorCodes, getLoginErrorMessage } from "@/lib/auth/error-codes";
import { buildPendingApprovalPath } from "@/lib/auth/paths";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

type LoginPageProps = {
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function readSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  if (session?.user?.status === UserApprovalStatus.APPROVED) {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect(buildPendingApprovalPath({ email: session.user.email }));
  }

  const params = await searchParams;
  const initialMessage =
    (() => {
      const state = readSingleValue(params.state);

      if (state === "rejected") {
        return getLoginErrorMessage(authErrorCodes.accountRejected, locale);
      }

      if (state === "deactivated") {
        return getLoginErrorMessage(authErrorCodes.accountDeactivated, locale);
      }

      return null;
    })();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl">{messages.auth.publicLoginPage.title}</CardTitle>
          <CardDescription>{messages.auth.publicLoginPage.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{messages.auth.publicLoginPage.accessControlTitle}</p>
            <p className="mt-2 leading-6">
              {messages.auth.publicLoginPage.accessControlDescription}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-950">{messages.auth.publicLoginPage.roleSeparationTitle}</p>
            <p className="mt-2 leading-6">
              {messages.auth.publicLoginPage.roleSeparationDescription}
            </p>
          </div>
        </CardContent>
      </Card>
      <LoginForm initialMessage={initialMessage} />
    </div>
  );
}
