import { UserApprovalStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLoginStatePath } from "@/lib/auth/paths";

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
      <Card className="border-slate-200 bg-white/95">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {registered ? <Badge variant="success">Registration submitted</Badge> : null}
            <Badge variant="warning">Approval required</Badge>
          </div>
          <div>
            <CardTitle className="text-3xl text-slate-950">Account pending approval</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Your account has been recorded, but access to the protected workspace stays disabled until an administrator approves the registration.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-slate-700">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">Registration status</p>
            <p className="mt-2">Current state: Pending administrative review</p>
            {email ? (
              <p className="mt-1">
                Submitted email: <span className="font-medium text-slate-900">{email}</span>
              </p>
            ) : null}
          </div>
          <div>
            <p className="font-semibold text-slate-900">What happens next</p>
            <ol className="mt-3 space-y-2 text-slate-700">
              <li>1. An administrator reviews the registration inside the user management workspace.</li>
              <li>2. Approved accounts can sign in and reach the role-appropriate dashboard area.</li>
              <li>3. Rejected or deactivated accounts are blocked from the protected routes.</li>
            </ol>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Return to login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}