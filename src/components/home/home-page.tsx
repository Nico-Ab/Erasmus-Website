import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HomePageProps = {
  isAuthenticated: boolean;
  userName?: string | null;
};

const rolePanels = [
  {
    title: "Staff workspace",
    description:
      "Maintain your profile, prepare mobility cases, upload required documents, and monitor review feedback.",
    href: "/dashboard/staff"
  },
  {
    title: "Officer workspace",
    description:
      "Review submitted cases, assess documents, record comments, and manage workflow progress.",
    href: "/dashboard/officer"
  },
  {
    title: "Admin workspace",
    description: "Manage approvals, user access, master data, and reporting settings for the local deployment.",
    href: "/dashboard/admin"
  }
];

export function HomePage({ isAuthenticated, userName }: HomePageProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader className="space-y-5">
            <Badge className="w-fit" variant="default">
              Internal university administration system
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Erasmus staff mobility administration in one structured portal.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                Use the portal to manage staff registration and approval, mobility cases, private document handling,
                officer review, and operational reporting with a calm, institution-first interface.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? "Open dashboard" : "Open login"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!isAuthenticated ? (
              <Button asChild variant="outline">
                <Link href="/register">Register staff account</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/status">Review local status</Link>
            </Button>
            {isAuthenticated ? (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Signed in as {userName ?? "portal user"}.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Staff registrations remain pending until the Erasmus office or an administrator approves access.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50/85">
          <CardHeader>
            <CardTitle>Current operational scope</CardTitle>
            <CardDescription className="leading-6 text-slate-600">
              The local portal already supports the core administration workflow and remains explicit about what is still pending.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">Available now</p>
              <p className="mt-2 leading-6">
                Registration, approval, secure login, editable profiles, mobility cases, private documents, officer review, audit logging, and CSV reporting.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Still to deepen</p>
              <p className="mt-2 leading-6">
                Bulk operations, richer requested-changes handling, stronger file inspection, and broader hardening for long-term release readiness.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {rolePanels.map((panel) => (
          <Card key={panel.title} className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle className="text-xl">{panel.title}</CardTitle>
              <CardDescription className="leading-6">{panel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" variant="outline">
                <Link href={isAuthenticated ? panel.href : "/login"}>Open area</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}