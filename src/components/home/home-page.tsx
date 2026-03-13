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
      "Maintain profile data, create and submit mobility cases, upload private documents, and monitor review feedback.",
    href: "/dashboard/staff"
  },
  {
    title: "Officer workspace",
    description:
      "Review institutional submissions, monitor missing documents, and keep protected case workflows moving.",
    href: "/dashboard/officer"
  },
  {
    title: "Admin workspace",
    description: "Manage approvals, master data, and operational settings for the local deployment.",
    href: "/dashboard/admin"
  }
];

export function HomePage({ isAuthenticated, userName }: HomePageProps) {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="border-slate-200 bg-white/95">
          <CardHeader className="space-y-4">
            <Badge className="w-fit" variant="default">
              SWU internal portal foundation
            </Badge>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Erasmus staff mobility management with a formal institutional shell.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                The current foundation now includes staff self-registration, approval-gated credentials authentication,
                editable institutional profiles, admin-managed master data, staff mobility-case management, and private
                document storage with permission-checked downloads.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
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
                Newly registered staff accounts remain in a pending approval state until an administrator reviews them.
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-950 text-slate-50 shadow-panel">
          <CardHeader>
            <CardTitle>Foundation scope</CardTitle>
            <CardDescription className="text-slate-300">
              The repository now focuses on core application readiness rather than feature completeness.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-200">
            <p>
              Included now: registration, approval workflow, secure login, editable profiles, master data, mobility
              cases, private document handling, health checks, and tests.
            </p>
            <p>Not implemented yet: officer review actions, reporting, exports, and broader operational workflows.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {rolePanels.map((panel) => (
          <Card key={panel.title} className="border-slate-200 bg-white/95">
            <CardHeader>
              <CardTitle className="text-xl">{panel.title}</CardTitle>
              <CardDescription>{panel.description}</CardDescription>
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