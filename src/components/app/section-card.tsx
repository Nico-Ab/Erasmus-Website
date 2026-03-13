import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SectionCardProps = {
  title: string;
  description: string;
  points: string[];
};

export function SectionCard({ title, description, points }: SectionCardProps) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm leading-6 text-slate-700">
          {points.map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}