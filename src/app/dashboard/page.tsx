import { UserRole } from "@prisma/client";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { Button } from "@/components/ui/button";
import { requireApprovedAuth } from "@/lib/auth/guards";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { formatRoleLabel, formatStatusLabel } from "@/lib/utils";

const nextDestinationByRole: Record<UserRole, string> = {
  STAFF: "/dashboard/staff",
  OFFICER: "/dashboard/officer",
  ADMIN: "/dashboard/admin"
};

export default async function DashboardPage() {
  const session = await requireApprovedAuth();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const roleLabel = formatRoleLabel(session.user.role, locale);
  const statusLabel = formatStatusLabel(session.user.status, locale);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: messages.common.dashboard }]}
        description={locale === "bg" ? "Отворете работното пространство, което съответства на текущата ви роля и задача." : "Open the workspace that matches your current role and task."}
        eyebrow={locale === "bg" ? "Преглед на работното пространство" : "Workspace overview"}
        title={locale === "bg" ? "Защитено табло" : "Protected dashboard"}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <OverviewMetric
          title={locale === "bg" ? "Текуща роля" : "Current role"}
          value={roleLabel}
          description={locale === "bg" ? "Навигацията и защитените действия следват зададената ви роля." : "Navigation and protected actions follow your assigned role."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Статус на акаунта" : "Account status"}
          value={statusLabel}
          description={locale === "bg" ? "Само одобрени акаунти могат да влизат в защитените работни зони." : "Only approved accounts can enter protected work areas."}
        />
        <OverviewMetric
          title={locale === "bg" ? "Основен маршрут" : "Primary route"}
          value={nextDestinationByRole[session.user.role]}
          description={locale === "bg" ? "Препоръчителна следваща дестинация за вписаната роля." : "Recommended next destination for the signed-in role."}
        />
      </section>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-950">{locale === "bg" ? "Продължете" : "Continue"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {locale === "bg" ? "Отворете основната си зона или преминете директно към защитена оперативна страница." : "Open your main area or move directly to a protected operational page."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={nextDestinationByRole[session.user.role]}>{locale === "bg" ? "Отвори основната ми зона" : "Open my primary area"}</Link>
          </Button>
          {(session.user.role === UserRole.OFFICER || session.user.role === UserRole.ADMIN) ? (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard/officer/cases">{locale === "bg" ? "Отвори регистъра за преглед" : "Open review register"}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/reports">{messages.common.openReports}</Link>
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
