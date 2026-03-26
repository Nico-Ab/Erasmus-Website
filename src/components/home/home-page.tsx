import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type HomePageProps = {
  isAuthenticated: boolean;
  userName?: string | null;
  locale: AppLocale;
};

export function HomePage({ isAuthenticated, locale, userName }: HomePageProps) {
  const messages = getMessages(locale);
  const accessPanels = [
    messages.homePage.accessPanels.staff,
    messages.homePage.accessPanels.officer,
    messages.homePage.accessPanels.admin
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-slate-200 bg-white">
        <CardHeader className="space-y-4">
          <Badge className="w-fit" variant="info">
            {messages.homePage.badge}
          </Badge>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-semibold text-slate-950 sm:text-[2.35rem]">
              {messages.homePage.title}
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">
              {messages.homePage.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? messages.homePage.openDashboard : messages.homePage.openLogin}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!isAuthenticated ? (
              <Button asChild variant="outline">
                <Link href="/register">{messages.homePage.registerStaff}</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href="/status">{messages.common.systemStatus}</Link>
            </Button>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {messages.homePage.approvalNote}
          </p>
          {isAuthenticated ? (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {messages.homePage.signedInAs} {userName ?? "portal user"}.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{messages.homePage.accessRoutesTitle}</CardTitle>
          <CardDescription>{messages.homePage.accessRoutesDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accessPanels.map((panel) => (
            <div key={panel.title} className="rounded-xl border border-slate-200 px-4 py-4">
              <p className="text-sm font-semibold text-slate-950">{panel.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{panel.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
