import { prisma } from "@/lib/prisma";
import type { ReportSettingInput } from "@/lib/validation/master-data";

export async function ensureReportSetting() {
  return prisma.reportSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      summaryRowLimit: 12,
      showHostInstitutionSummary: true,
      showDocumentGapSummary: true
    }
  });
}

export async function updateReportSetting(input: ReportSettingInput) {
  await prisma.reportSetting.upsert({
    where: { id: "default" },
    update: {
      summaryRowLimit: input.summaryRowLimit,
      showHostInstitutionSummary: input.showHostInstitutionSummary,
      showDocumentGapSummary: input.showDocumentGapSummary
    },
    create: {
      id: "default",
      summaryRowLimit: input.summaryRowLimit,
      showHostInstitutionSummary: input.showHostInstitutionSummary,
      showDocumentGapSummary: input.showDocumentGapSummary
    }
  });

  return { status: "updated" as const };
}