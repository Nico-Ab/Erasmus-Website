import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OverviewMetricProps = {
  title: string;
  value: string;
  description: string;
};

export function OverviewMetric({ title, value, description }: OverviewMetricProps) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl text-slate-900">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
