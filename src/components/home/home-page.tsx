import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HomePageProps = {
  isAuthenticated: boolean;
  userName?: string | null;
};

const rolePanels = [
  {
    title: "Staff workspace",
    description: "Create and continue mobility cases, upload documents, and monitor officer feedback.",
    href: "/dashboard/staff"
  },
  {
    title: "Officer workspace",
    description: "Review institutional submissions, manage corrections, and keep case status moving.",
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
                This foundation provides a local-first Next.js application with secure credentials-based authentication,
                PostgreSQL wiring, Prisma, testing infrastructure, and role-aware dashboard placeholders for staff,
                officers, and admins.
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
            <Button asChild variant="outline">
              <Link href="/status">Review local status</Link>
            </Button>
            {isAuthenticated ? (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Signed in as {userName ?? "portal user"}.
              </p>
            ) : null}
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
            <p>Included now: app shell, auth, database wiring, health checks, tests, and dashboard placeholders.</p>
            <p>Not implemented yet: registration flows, case workflows, document handling, reporting, and admin operations.</p>
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
