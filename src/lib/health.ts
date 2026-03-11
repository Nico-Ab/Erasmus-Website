import fs from "node:fs/promises";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function getHealthReport() {
  const report = {
    app: "ready",
    database: "down",
    storage: "down",
    checks: [] as string[]
  };

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    report.database = "ready";
    report.checks.push("Database connection succeeded.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    report.checks.push(`Database connection failed: ${message}`);
  }

  try {
    await fs.access(env.storageLocalRoot);
    report.storage = "ready";
    report.checks.push(`Storage path available at ${env.storageLocalRoot}.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown storage error";
    report.checks.push(`Storage path check failed: ${message}`);
  }

  return report;
}
