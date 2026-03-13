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
  const accountLabel = session.user.name ?? session.user.email;

  return (
    <div
      className="grid gap-6 rounded-2xl border border-slate-200 p-4 shadow-panel lg:grid-cols-[290px_1fr] lg:p-6"
      data-role-surface="dashboard"
    >
      <aside className="rounded-xl border border-slate-200 bg-white/95 p-4 lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Protected workspace</p>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Dashboard navigation</h2>
              <p className="mt-1 text-sm text-slate-600">
                Role-aware access to staff, review, reporting, and administration areas.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed-in account</p>
            <p className="mt-2 text-sm text-slate-600">Signed in as</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{accountLabel}</p>
            <p className="mt-1 text-xs text-slate-500">{session.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="default">{formatRoleLabel(session.user.role)}</Badge>
              <Badge variant="muted">{formatStatusLabel(session.user.status)}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <DashboardNav items={navigation} />
        </div>
      </aside>
      <div className="space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white/95 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Internal administration</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">Role-based university workspace</p>
              <p className="mt-1 text-sm text-slate-600">
                Review the current area, complete protected actions, and keep institutional records consistent.
              </p>
            </div>
            <SignOutButton />
          </div>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
