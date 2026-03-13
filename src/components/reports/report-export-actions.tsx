import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ReportExportActionsProps = {
  queryString: string;
};

function buildExportHref(pathname: string, queryString: string) {
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export function ReportExportActions({ queryString }: ReportExportActionsProps) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle>CSV exports</CardTitle>
        <CardDescription>
          Export filtered case registers and summary tables without leaving the protected reporting workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <a href={buildExportHref("/api/reports/export/cases", queryString)}>Export filtered case list</a>
        </Button>
        <Button asChild variant="outline">
          <a href={buildExportHref("/api/reports/export/yearly-summary", queryString)}>Export yearly summary</a>
        </Button>
        <Button asChild variant="outline">
          <a href={buildExportHref("/api/reports/export/faculty-summary", queryString)}>Export faculty summary</a>
        </Button>
      </CardContent>
    </Card>
  );
}