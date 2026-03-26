import { LanguageToggle } from "@/components/app/language-toggle";
import { UniversityIdentity } from "@/components/app/university-identity";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/app/dashboard-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getDashboardNavigation } from "@/lib/navigation";
import { requireApprovedAuth } from "@/lib/auth/guards";
import { formatRoleLabel, formatStatusLabel } from "@/lib/utils";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireApprovedAuth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const navigation = getDashboardNavigation(session.user.role, locale);
  const accountLabel = session.user.name ?? session.user.email;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]" data-role-surface="dashboard">
      <aside className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white lg:sticky lg:top-6 lg:self-start">
        <div className="border-b border-slate-200 bg-primary p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">{messages.common.protectedWorkspace}</p>
          <div className="mt-4">
            <UniversityIdentity
              compact
              description={messages.brand.description}
              href="/dashboard"
              inverse
              portalName={messages.brand.portal}
              universityName={messages.brand.university}
            />
          </div>
        </div>
        <div className="space-y-6 p-5">
          <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{messages.dashboardShell.signedInAccount}</p>
            <p className="mt-3 text-sm text-slate-600">{messages.common.signedInAs}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{accountLabel}</p>
            <p className="mt-1 text-xs text-slate-500">{session.user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="default">
                {formatRoleLabel(session.user.role, locale)}
              </Badge>
              <Badge variant="muted">
                {formatStatusLabel(session.user.status, locale)}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-950">{messages.common.navigation}</h2>
            <p className="text-sm leading-6 text-slate-600">
              {messages.dashboardShell.navigationDescription}
            </p>
          </div>
          <DashboardNav items={navigation} />
        </div>
      </aside>
      <div className="space-y-6">
        <header className="rounded-[1.25rem] border border-slate-200 bg-white px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">{messages.common.protectedWorkspace}</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{messages.dashboardShell.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{messages.dashboardShell.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageToggle compact />
              <SignOutButton />
            </div>
          </div>
        </header>
        <div>{children}</div>
      </div>
    </div>
  );
}
