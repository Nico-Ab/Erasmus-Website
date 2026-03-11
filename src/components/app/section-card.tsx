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
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-slate-700">
          {points.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
