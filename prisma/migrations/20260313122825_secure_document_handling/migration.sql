-- CreateEnum
CREATE TYPE "public"."DocumentReviewState" AS ENUM ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."MobilityCaseDocument" (
    "id" TEXT NOT NULL,
    "mobilityCaseId" TEXT NOT NULL,
    "documentTypeOptionId" TEXT NOT NULL,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MobilityCaseDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MobilityCaseDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "reviewState" "public"."DocumentReviewState" NOT NULL DEFAULT 'PENDING_REVIEW',
    "reviewComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobilityCaseDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobilityCaseDocument_currentVersionId_key" ON "public"."MobilityCaseDocument"("currentVersionId");

-- CreateIndex
CREATE INDEX "MobilityCaseDocument_documentTypeOptionId_idx" ON "public"."MobilityCaseDocument"("documentTypeOptionId");

-- CreateIndex
CREATE INDEX "MobilityCaseDocument_currentVersionId_idx" ON "public"."MobilityCaseDocument"("currentVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "MobilityCaseDocument_mobilityCaseId_documentTypeOptionId_key" ON "public"."MobilityCaseDocument"("mobilityCaseId", "documentTypeOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "MobilityCaseDocumentVersion_storageKey_key" ON "public"."MobilityCaseDocumentVersion"("storageKey");

-- CreateIndex
CREATE INDEX "MobilityCaseDocumentVersion_reviewedByUserId_idx" ON "public"."MobilityCaseDocumentVersion"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "MobilityCaseDocumentVersion_uploadedByUserId_idx" ON "public"."MobilityCaseDocumentVersion"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "MobilityCaseDocumentVersion_documentId_uploadedAt_idx" ON "public"."MobilityCaseDocumentVersion"("documentId", "uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MobilityCaseDocumentVersion_documentId_versionNumber_key" ON "public"."MobilityCaseDocumentVersion"("documentId", "versionNumber");

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocument" ADD CONSTRAINT "MobilityCaseDocument_mobilityCaseId_fkey" FOREIGN KEY ("mobilityCaseId") REFERENCES "public"."MobilityCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocument" ADD CONSTRAINT "MobilityCaseDocument_documentTypeOptionId_fkey" FOREIGN KEY ("documentTypeOptionId") REFERENCES "public"."SelectOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocument" ADD CONSTRAINT "MobilityCaseDocument_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "public"."MobilityCaseDocumentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocumentVersion" ADD CONSTRAINT "MobilityCaseDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."MobilityCaseDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocumentVersion" ADD CONSTRAINT "MobilityCaseDocumentVersion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MobilityCaseDocumentVersion" ADD CONSTRAINT "MobilityCaseDocumentVersion_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
