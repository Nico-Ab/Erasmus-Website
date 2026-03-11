import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHealthReport } from "@/lib/health";
import { env } from "@/lib/env";

export default async function StatusPage() {
  const report = await getHealthReport();

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Local status</CardTitle>
          <CardDescription>
            Early observability surface for the application shell, database connectivity, and storage readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Application</p>
            <Badge className="mt-3" variant="success">
              {report.app}
            </Badge>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Database</p>
            <Badge className="mt-3" variant={report.database === "ready" ? "success" : "warning"}>
              {report.database}
            </Badge>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Storage</p>
            <Badge className="mt-3" variant={report.storage === "ready" ? "success" : "warning"}>
              {report.storage}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Configured environment</CardTitle>
          <CardDescription>Values shown here are non-secret operational settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">APP_URL:</span> {env.APP_URL}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Storage driver:</span> {env.STORAGE_DRIVER}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Local storage root:</span> {env.storageLocalRoot}</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Default locale:</span> {env.DEFAULT_LOCALE}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Max upload size:</span> {env.MAX_UPLOAD_SIZE_MB} MB</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Allowed upload extensions:</span> {env.allowedUploadExtensions.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white/95">
        <CardHeader>
          <CardTitle>Checks</CardTitle>
          <CardDescription>These are safe-to-display local checks for the development foundation.</CardDescription>
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
