-- CreateTable
CREATE TABLE "public"."ReportSetting" (
    "id" TEXT NOT NULL,
    "summaryRowLimit" INTEGER NOT NULL DEFAULT 12,
    "showHostInstitutionSummary" BOOLEAN NOT NULL DEFAULT true,
    "showDocumentGapSummary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetUserId" TEXT,
    "mobilityCaseId" TEXT,
    "documentId" TEXT,
    "documentVersionId" TEXT,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_createdAt_idx" ON "public"."AuditLog"("actionType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "public"."AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "public"."AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetUserId_createdAt_idx" ON "public"."AuditLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_mobilityCaseId_createdAt_idx" ON "public"."AuditLog"("mobilityCaseId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_documentId_createdAt_idx" ON "public"."AuditLog"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_documentVersionId_createdAt_idx" ON "public"."AuditLog"("documentVersionId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_mobilityCaseId_fkey" FOREIGN KEY ("mobilityCaseId") REFERENCES "public"."MobilityCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."MobilityCaseDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "public"."MobilityCaseDocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
