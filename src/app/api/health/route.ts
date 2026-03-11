import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/health";

export async function GET() {
  const report = await getHealthReport();
  const overallStatus = report.database === "ready" && report.storage === "ready" ? 200 : 503;

  return NextResponse.json(report, { status: overallStatus });
}
