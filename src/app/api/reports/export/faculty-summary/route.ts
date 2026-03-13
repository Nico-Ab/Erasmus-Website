import { NextResponse } from "next/server";
import { requireApprovedReviewSession } from "@/lib/auth/api-guards";
import { buildFacultySummaryCsv } from "@/lib/reporting/csv";
import { createCsvDownloadResponse } from "@/lib/reporting/download";
import { parseReportingFilters } from "@/lib/reporting/filters";
import { getReportingData } from "@/lib/reporting/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireApprovedReviewSession();

  if (session instanceof NextResponse) {
    return session;
  }

  const filters = parseReportingFilters(new URL(request.url).searchParams);
  const data = await getReportingData(filters);

  return createCsvDownloadResponse(
    "faculty-summary",
    buildFacultySummaryCsv(data.summaries.byFaculty)
  );
}