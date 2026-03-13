import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OverviewMetricProps = {
  title: string;
  value: string;
  description: string;
};

export function OverviewMetric({ title, value, description }: OverviewMetricProps) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader className="space-y-3 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
        <CardTitle className="text-2xl leading-tight text-slate-900">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}