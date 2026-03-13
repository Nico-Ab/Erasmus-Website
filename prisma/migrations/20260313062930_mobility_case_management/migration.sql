-- CreateTable
CREATE TABLE "public"."MobilityCase" (
    "id" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "mobilityTypeOptionId" TEXT,
    "hostInstitution" TEXT,
    "hostCountry" TEXT,
    "hostCity" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "statusDefinitionId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilityCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MobilityCaseComment" (
    "id" TEXT NOT NULL,
    "mobilityCaseId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilityCaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MobilityCaseStatusHistory" (
    "id" TEXT NOT NULL,
    "mobilityCaseId" TEXT NOT NULL,
    "fromStatusDefinitionId" TEXT,
    "toStatusDefinitionId" TEXT NOT NULL,
    "changedByUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobilityCaseStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MobilityCase_staffUserId_updatedAt_idx" ON "public"."MobilityCase"("staffUserId", "updatedAt");

-- CreateIndex
CREATE INDEX "MobilityCase_academicYearId_idx" ON "public"."MobilityCase"("academicYearId");

-- CreateIndex
CREATE INDEX "MobilityCase_mobilityTypeOptionId_idx" ON "public"."MobilityCase"("mobilityTypeOptionId");

-- CreateIndex
CREATE INDEX "MobilityCase_statusDefinitionId_idx" ON "public"."MobilityCase"("statusDefinitionId");

-- CreateIndex
CREATE INDEX "MobilityCaseComment_mobilityCaseId_createdAt_idx" ON "public"."MobilityCaseComment"("mobilityCaseId", "createdAt");

-- CreateIndex
CREATE INDEX "MobilityCaseComment_authorUserId_idx" ON "public"."MobilityCaseComment"("authorUserId");

-- CreateIndex
CREATE INDEX "MobilityCaseStatusHistory_mobilityCaseId_createdAt_idx" ON "public"."MobilityCaseStatusHistory"("mobilityCaseId", "createdAt");

-- CreateIndex
CREATE INDEX "MobilityCaseStatusHistory_fromStatusDefinitionId_idx" ON "public"."MobilityCaseStatusHistory"("fromStatusDefinitionId");

-- CreateIndex
CREATE INDEX "MobilityCaseStatusHistory_toStatusDefinitionId_idx" ON "public"."MobilityCaseStatusHistory"("toStatusDefinitionId");

-- CreateIndex
CREATE INDEX "MobilityCaseStatusHistory_changedByUserId_idx" ON "public"."MobilityCaseStatusHistory"("changedByUserId");

-- AddForeignKey
ALTER TABLE "public"."MobilityCase" ADD CONSTRAINT "MobilityCase_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCase" ADD CONSTRAINT "MobilityCase_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCase" ADD CONSTRAINT "MobilityCase_mobilityTypeOptionId_fkey" FOREIGN KEY ("mobilityTypeOptionId") REFERENCES "public"."SelectOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCase" ADD CONSTRAINT "MobilityCase_statusDefinitionId_fkey" FOREIGN KEY ("statusDefinitionId") REFERENCES "public"."CaseStatusDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseComment" ADD CONSTRAINT "MobilityCaseComment_mobilityCaseId_fkey" FOREIGN KEY ("mobilityCaseId") REFERENCES "public"."MobilityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseComment" ADD CONSTRAINT "MobilityCaseComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseStatusHistory" ADD CONSTRAINT "MobilityCaseStatusHistory_mobilityCaseId_fkey" FOREIGN KEY ("mobilityCaseId") REFERENCES "public"."MobilityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseStatusHistory" ADD CONSTRAINT "MobilityCaseStatusHistory_fromStatusDefinitionId_fkey" FOREIGN KEY ("fromStatusDefinitionId") REFERENCES "public"."CaseStatusDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseStatusHistory" ADD CONSTRAINT "MobilityCaseStatusHistory_toStatusDefinitionId_fkey" FOREIGN KEY ("toStatusDefinitionId") REFERENCES "public"."CaseStatusDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseStatusHistory" ADD CONSTRAINT "MobilityCaseStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
