import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { type AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export type StaffCaseTableItem = {
  id: string;
  academicYearLabel: string | null;
  mobilityTypeLabel: string | null;
  hostInstitution: string;
  hostLocation: string;
  dateRangeLabel: string;
  status: {
    key: string;
    label: string;
  };
  updatedAtLabel: string;
  submittedAtLabel: string | null;
};

export function StaffCaseTable({
  items,
  locale = "en"
}: {
  items: StaffCaseTableItem[];
  locale?: AppLocale;
}) {
  const messages = getMessages(locale);

  return (
    <Card className="border-slate-200 bg-white" data-testid="staff-case-table">
      <CardHeader>
        <CardTitle>{locale === "bg" ? "Моите случаи за мобилност" : "My mobility cases"}</CardTitle>
        <CardDescription>{locale === "bg" ? "Чернови, подавания и последващи резултати от прегледа." : "Drafts, submissions, and later review outcomes."}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
            <p className="text-sm font-semibold text-slate-900">{locale === "bg" ? "Все още няма случаи за мобилност" : "No mobility cases yet"}</p>
            <p className="mt-1 text-sm text-slate-600">
              {locale === "bg" ? "Създайте първия си случай за мобилност, за да започнете да попълвате учебната година, домакина и данните за пътуването." : "Create your first mobility case to start drafting the academic-year, host, and travel details."}
            </p>
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href="/dashboard/staff/cases/new">{locale === "bg" ? "Създай първи случай" : "Create first case"}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {items.length} {items.length === 1 ? (locale === "bg" ? "случай" : "case") : (locale === "bg" ? "случая" : "cases")} {locale === "bg" ? "показани" : "shown"}
            </p>
            <div className="overflow-x-auto">
              <table aria-label={locale === "bg" ? "Случаи за мобилност на staff" : "Staff mobility cases"} className="min-w-full border-separate border-spacing-0 text-sm">
                <caption className="sr-only">
                  {locale === "bg" ? "Случаи за мобилност на staff със статус, дати и директни връзки към детайлите на всеки случай." : "Staff mobility cases with status, dates, and direct links to each case detail page."}
                </caption>
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Учебна година" : "Academic year"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Мобилност" : "Mobility"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Домакин" : "Host"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Дати" : "Dates"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Статус" : "Status"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Обновено" : "Updated"}</th>
                    <th className="border-b border-slate-200 px-4 py-3 font-semibold" scope="col">{locale === "bg" ? "Отвори" : "Open"}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="align-top text-slate-700 hover:bg-accent/40">
                      <td className="border-b border-slate-100 px-4 py-4">{item.academicYearLabel ?? messages.common.notSet}</td>
                      <td className="border-b border-slate-100 px-4 py-4">{item.mobilityTypeLabel ?? messages.common.notSet}</td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <p className="font-semibold text-slate-900">{item.hostInstitution}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.hostLocation}</p>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4">{item.dateRangeLabel}</td>
                      <td className="border-b border-slate-100 px-4 py-4">
                        <div className="space-y-2">
                          <CaseStatusBadge label={item.status.label} statusKey={item.status.key} />
                          {item.submittedAtLabel ? (
                            <p className="text-xs text-slate-500">{locale === "bg" ? "Подаден" : "Submitted"} {item.submittedAtLabel}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4 text-xs text-slate-600">
                        {item.updatedAtLabel}
                      </td>
                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4">
                        <Link
                          className="font-semibold text-primary hover:underline"
                          href={`/dashboard/staff/cases/${item.id}`}
                        >
                          {locale === "bg" ? "Преглед на случая" : "View case"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
