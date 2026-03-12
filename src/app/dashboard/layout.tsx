import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/app/dashboard-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getDashboardNavigation } from "@/lib/navigation";
import { requireApprovedAuth } from "@/lib/auth/guards";
import { formatRoleLabel, formatStatusLabel } from "@/lib/utils";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireApprovedAuth();
  const navigation = getDashboardNavigation(session.user.role);

  return (
    <div
      className="grid gap-6 rounded-2xl border border-slate-200 p-4 shadow-panel lg:grid-cols-[280px_1fr] lg:p-6"
      data-role-surface="dashboard"
    >
      <aside className="rounded-xl border border-slate-200 bg-white/95 p-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Authenticated area</p>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Dashboard navigation</h2>
            <p className="text-sm text-slate-600">Formal, role-aware navigation for the protected workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">{formatRoleLabel(session.user.role)}</Badge>
            <Badge variant="muted">{formatStatusLabel(session.user.status)}</Badge>
          </div>
        </div>
        <div className="mt-6">
          <DashboardNav items={navigation} />
        </div>
      </aside>
      <div className="space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white/95 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <h1 className="text-2xl font-semibold text-slate-950">{session.user.name ?? session.user.email}</h1>
              <p className="text-sm text-slate-600">Protected foundation area for the local-first Erasmus portal.</p>
            </div>
            <SignOutButton />
          </div>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}