import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHealthReport } from "@/lib/health";
import { env } from "@/lib/env";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function StatusPage() {
  const report = await getHealthReport();
  const locale = await getRequestLocale();
  const messages = getMessages(locale);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: messages.statusPage.portalHome, href: "/" },
          { label: messages.statusPage.title }
        ]}
        description={messages.statusPage.description}
        eyebrow={messages.statusPage.eyebrow}
        title={messages.statusPage.title}
      />

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{messages.statusPage.localStatus}</CardTitle>
          <CardDescription>{messages.statusPage.localStatusDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{messages.statusPage.application}</p>
            <Badge className="mt-3" variant="success">
              {report.app}
            </Badge>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{messages.statusPage.database}</p>
            <Badge className="mt-3" variant={report.database === "ready" ? "success" : "warning"}>
              {report.database}
            </Badge>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{messages.statusPage.storage}</p>
            <Badge className="mt-3" variant={report.storage === "ready" ? "success" : "warning"}>
              {report.storage}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{messages.statusPage.environmentTitle}</CardTitle>
          <CardDescription>{messages.statusPage.environmentDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">{messages.statusPage.appUrl}:</span> {env.APP_URL}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">{messages.statusPage.storageDriver}:</span> {env.STORAGE_DRIVER}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">{messages.statusPage.localStorageRoot}:</span> {env.storageLocalRoot}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">{messages.statusPage.defaultLocale}:</span> {env.DEFAULT_LOCALE}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">{messages.statusPage.maxUploadSize}:</span> {env.MAX_UPLOAD_SIZE_MB} MB</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">{messages.statusPage.allowedUploadExtensions}:</span> {env.allowedUploadExtensions.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>{messages.statusPage.checksTitle}</CardTitle>
          <CardDescription>{messages.statusPage.checksDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-slate-700">
            {report.checks.map((check) => (
              <li key={check} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                {check}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
