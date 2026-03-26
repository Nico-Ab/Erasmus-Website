import { UserApprovalStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLoginStatePath } from "@/lib/auth/paths";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

type PendingApprovalPageProps = {
  searchParams: Promise<{
    email?: string | string[];
    registered?: string | string[];
  }>;
};

function readSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PendingApprovalPage({ searchParams }: PendingApprovalPageProps) {
  const session = await auth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  if (session?.user?.status === UserApprovalStatus.APPROVED) {
    redirect("/dashboard");
  }

  if (session?.user?.status === UserApprovalStatus.REJECTED) {
    redirect(buildLoginStatePath("rejected"));
  }

  if (session?.user?.status === UserApprovalStatus.DEACTIVATED) {
    redirect(buildLoginStatePath("deactivated"));
  }

  const params = await searchParams;
  const email = session?.user?.email ?? readSingleValue(params.email);
  const registered = readSingleValue(params.registered) === "1";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {registered ? <Badge variant="success">{messages.auth.pending.submitted}</Badge> : null}
            <Badge variant="warning">{messages.auth.pending.approvalRequired}</Badge>
          </div>
          <div>
            <CardTitle className="text-3xl text-slate-950">{messages.auth.pending.title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              {messages.auth.pending.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-slate-700">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{messages.auth.pending.registrationStatus}</p>
            <p className="mt-2">{messages.auth.pending.currentState}</p>
            {email ? (
              <p className="mt-1">
                {messages.auth.pending.submittedEmail}: <span className="font-medium text-slate-900">{email}</span>
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{messages.auth.pending.nextStep}</p>
            <p className="mt-2 leading-6">
              {messages.auth.pending.nextStepDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">{messages.auth.pending.returnLogin}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{messages.auth.pending.returnHome}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
