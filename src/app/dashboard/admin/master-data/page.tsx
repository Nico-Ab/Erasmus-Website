import { UserRole } from "@prisma/client";
import { OverviewMetric } from "@/components/app/overview-metric";
import { MasterDataManager } from "@/components/admin/master-data-manager";
import { requireRole } from "@/lib/auth/guards";
import { getMasterDataPageData } from "@/lib/master-data/service";

export default async function AdminMasterDataPage() {
  await requireRole([UserRole.ADMIN]);
  const data = await getMasterDataPageData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
        <OverviewMetric title="Faculties" value={data.faculties.length.toString()} description="Master faculty records" />
        <OverviewMetric title="Departments" value={data.departments.length.toString()} description="Faculty-linked department records" />
        <OverviewMetric title="Academic years" value={data.academicYears.length.toString()} description="Active and planned academic years" />
        <OverviewMetric title="Statuses" value={data.statuses.length.toString()} description="Case-status definitions" />
        <OverviewMetric title="Select options" value={data.selectOptions.length.toString()} description="Shared v1 select-list records" />
        <OverviewMetric title="Upload cap" value={`${data.uploadSetting.maxUploadSizeMb} MB`} description="Current operational upload size setting" />
      </section>
      <MasterDataManager {...data} />
    </div>
  );
}