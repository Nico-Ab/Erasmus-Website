-- CreateEnum
CREATE TYPE "public"."SelectOptionCategory" AS ENUM ('ACADEMIC_TITLE', 'MOBILITY_TYPE', 'DOCUMENT_TYPE');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "academicTitle",
DROP COLUMN "department",
DROP COLUMN "faculty",
ADD COLUMN     "academicTitleOptionId" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "facultyId" TEXT;

-- CreateTable
CREATE TABLE "public"."Faculty" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicYear" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaseStatusDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStatusDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SelectOption" (
    "id" TEXT NOT NULL,
    "category" "public"."SelectOptionCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UploadSetting" (
    "id" TEXT NOT NULL,
    "maxUploadSizeMb" INTEGER NOT NULL,
    "allowedExtensions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_code_key" ON "public"."Faculty"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "public"."Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "public"."Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_facultyId_name_key" ON "public"."Department"("facultyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "public"."AcademicYear"("label");

-- CreateIndex
CREATE INDEX "AcademicYear_sortOrder_idx" ON "public"."AcademicYear"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStatusDefinition_key_key" ON "public"."CaseStatusDefinition"("key");

-- CreateIndex
CREATE INDEX "CaseStatusDefinition_sortOrder_idx" ON "public"."CaseStatusDefinition"("sortOrder");

-- CreateIndex
CREATE INDEX "SelectOption_category_sortOrder_idx" ON "public"."SelectOption"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SelectOption_category_key_key" ON "public"."SelectOption"("category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "SelectOption_category_label_key" ON "public"."SelectOption"("category", "label");

-- CreateIndex
CREATE INDEX "User_academicTitleOptionId_idx" ON "public"."User"("academicTitleOptionId");

-- CreateIndex
CREATE INDEX "User_facultyId_idx" ON "public"."User"("facultyId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "public"."User"("departmentId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_academicTitleOptionId_fkey" FOREIGN KEY ("academicTitleOptionId") REFERENCES "public"."SelectOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

