import { UserApprovalStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authErrorCodes, getLoginErrorMessage } from "@/lib/auth/error-codes";
import { buildPendingApprovalPath } from "@/lib/auth/paths";

type LoginPageProps = {
  searchParams: Promise<{
    state?: string | string[];
  }>;
};

function readSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getStateMessage(state?: string) {
  if (state === "rejected") {
    return getLoginErrorMessage(authErrorCodes.accountRejected);
  }

  if (state === "deactivated") {
    return getLoginErrorMessage(authErrorCodes.accountDeactivated);
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user?.status === UserApprovalStatus.APPROVED) {
    redirect("/dashboard");
  }

  if (session?.user) {
    redirect(buildPendingApprovalPath({ email: session.user.email }));
  }

  const params = await searchParams;
  const initialMessage = getStateMessage(readSingleValue(params.state));

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-slate-200 bg-slate-950 text-slate-50">
        <CardHeader>
          <CardTitle className="text-3xl">Access the institutional workspace</CardTitle>
          <CardDescription className="text-slate-300">
            The local foundation now includes credentials-based registration, approval-gated login, and structured role-aware routing across the protected dashboard shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-200">
          <p>Approved accounts can enter the protected workspace immediately after sign-in.</p>
          <p>Pending accounts are redirected into a clear approval-state screen instead of reaching sensitive routes.</p>
          <p>Staff, officer, and admin areas remain separated through server-side role checks.</p>
        </CardContent>
      </Card>
      <LoginForm initialMessage={initialMessage} />
    </div>
  );
}