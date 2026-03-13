import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/app/page-header";
import { OverviewMetric } from "@/components/app/overview-metric";
import { MasterDataManager } from "@/components/admin/master-data-manager";
import { requireRole } from "@/lib/auth/guards";
import { getMasterDataPageData } from "@/lib/master-data/service";

export default async function AdminMasterDataPage() {
  await requireRole([UserRole.ADMIN]);
  const data = await getMasterDataPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admin area", href: "/dashboard/admin" },
          { label: "Master data" }
        ]}
        description="Maintain the institutional records and operational settings used across profiles, workflows, uploads, and reporting."
        eyebrow="Configuration administration"
        title="Master data and settings"
      />

      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <OverviewMetric title="Faculties" value={data.faculties.length.toString()} description="Master faculty records" />
        <OverviewMetric title="Departments" value={data.departments.length.toString()} description="Faculty-linked department records" />
        <OverviewMetric title="Academic years" value={data.academicYears.length.toString()} description="Active and planned academic years" />
        <OverviewMetric title="Statuses" value={data.statuses.length.toString()} description="Case-status definitions" />
        <OverviewMetric title="Select options" value={data.selectOptions.length.toString()} description="Shared v1 select-list records" />
        <OverviewMetric title="Upload cap" value={`${data.uploadSetting.maxUploadSizeMb} MB`} description="Current operational upload size setting" />
        <OverviewMetric title="Report rows" value={data.reportSetting.summaryRowLimit.toString()} description="Current reporting summary row limit" />
      </section>
      <MasterDataManager {...data} />
    </div>
  );
}