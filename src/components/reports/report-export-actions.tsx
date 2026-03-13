import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ReportExportActionsProps = {
  queryString: string;
};

type ExportAction = {
  href: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: "default" | "outline";
  testId: string;
};

function buildExportHref(pathname: string, queryString: string) {
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function ReportExportActions({ queryString }: ReportExportActionsProps) {
  const exportActions: ExportAction[] = [
    {
      href: buildExportHref("/api/reports/export/cases", queryString),
      title: "Filtered case register",
      description: "Download the current filtered case list, including archived records that match the selected reporting scope.",
      buttonLabel: "Export filtered case list",
      testId: "export-cases-csv"
    },
    {
      href: buildExportHref("/api/reports/export/yearly-summary", queryString),
      title: "Yearly summary",
      description: "Download annual totals for the current reporting scope for offline analysis or committee review.",
      buttonLabel: "Export yearly summary",
      buttonVariant: "outline",
      testId: "export-yearly-summary-csv"
    },
    {
      href: buildExportHref("/api/reports/export/faculty-summary", queryString),
      title: "Faculty summary",
      description: "Download faculty-level totals that remain aligned with the active report filters.",
      buttonLabel: "Export faculty summary",
      buttonVariant: "outline",
      testId: "export-faculty-summary-csv"
    }
  ];

  return (
    <Card className="border-slate-200 bg-white/95" data-testid="report-export-actions">
      <CardHeader>
        <CardTitle>CSV exports</CardTitle>
        <CardDescription>
          Download protected reporting views in a format that remains suitable for administrative review, archiving, and follow-up work.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        {exportActions.map((action) => (
          <div key={action.href} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-950">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
            <div className="mt-4">
              <Button asChild variant={action.buttonVariant ?? "default"}>
                <a data-testid={action.testId} href={action.href}>
                  {action.buttonLabel}
                </a>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
