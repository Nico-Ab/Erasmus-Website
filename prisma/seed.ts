import bcrypt from "bcryptjs";
import {
  PrismaClient,
  SelectOptionCategory,
  UserApprovalStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

const faculties = [
  { code: "RECTORATE", name: "Rectorate" },
  { code: "ECON", name: "Faculty of Economics" },
  { code: "LAW", name: "Faculty of Law" }
];

const departments = [
  { code: "SYS_ADMIN", name: "Systems Administration", facultyCode: "RECTORATE" },
  { code: "ERASMUS_OFFICE", name: "Erasmus Office", facultyCode: "RECTORATE" },
  { code: "INTL_RELATIONS", name: "International Relations", facultyCode: "ECON" },
  { code: "PUBLIC_LAW", name: "Public Law", facultyCode: "LAW" }
];

const academicYears = [
  { label: "2025/2026", startYear: 2025, endYear: 2026, sortOrder: 1 },
  { label: "2026/2027", startYear: 2026, endYear: 2027, sortOrder: 2 }
];

const caseStatuses = [
  { key: "draft", label: "Draft", sortOrder: 1 },
  { key: "submitted", label: "Submitted", sortOrder: 2 },
  { key: "agreement_uploaded", label: "Agreement Uploaded", sortOrder: 3 },
  { key: "under_review", label: "Under Review", sortOrder: 4 },
  { key: "approved", label: "Approved", sortOrder: 5 },
  { key: "mobility_ongoing", label: "Mobility Ongoing", sortOrder: 6 },
  { key: "certificate_uploaded", label: "Certificate Uploaded", sortOrder: 7 },
  { key: "completed", label: "Completed", sortOrder: 8 },
  { key: "changes_required", label: "Changes Required", sortOrder: 9 },
  { key: "archived", label: "Archived", sortOrder: 10 }
];

const selectOptions = [
  { category: SelectOptionCategory.ACADEMIC_TITLE, key: "mr", label: "Mr.", sortOrder: 1 },
  { category: SelectOptionCategory.ACADEMIC_TITLE, key: "ms", label: "Ms.", sortOrder: 2 },
  { category: SelectOptionCategory.ACADEMIC_TITLE, key: "dr", label: "Dr.", sortOrder: 3 },
  { category: SelectOptionCategory.ACADEMIC_TITLE, key: "prof", label: "Prof.", sortOrder: 4 },
  { category: SelectOptionCategory.MOBILITY_TYPE, key: "teaching", label: "Teaching", sortOrder: 1 },
  { category: SelectOptionCategory.MOBILITY_TYPE, key: "training", label: "Training", sortOrder: 2 },
  {
    category: SelectOptionCategory.DOCUMENT_TYPE,
    key: "mobility_agreement",
    label: "Mobility Agreement",
    sortOrder: 1
  },
  {
    category: SelectOptionCategory.DOCUMENT_TYPE,
    key: "certificate_of_attendance",
    label: "Final Certificate of Attendance",
    sortOrder: 2
  }
];

const users = [
  {
    email: "admin@swu.local",
    password: "AdminPass123!",
    firstName: "Ivana",
    lastName: "Dimitrova",
    academicTitleKey: "ms",
    facultyCode: "RECTORATE",
    departmentCode: "SYS_ADMIN",
    role: UserRole.ADMIN,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "officer@swu.local",
    password: "OfficerPass123!",
    firstName: "Milan",
    lastName: "Georgiev",
    academicTitleKey: "mr",
    facultyCode: "RECTORATE",
    departmentCode: "ERASMUS_OFFICE",
    role: UserRole.OFFICER,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "staff@swu.local",
    password: "StaffPass123!",
    firstName: "Elena",
    lastName: "Petrova",
    academicTitleKey: "dr",
    facultyCode: "ECON",
    departmentCode: "INTL_RELATIONS",
    role: UserRole.STAFF,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "staff2@swu.local",
    password: "StaffTwoPass123!",
    firstName: "Nadia",
    lastName: "Koleva",
    academicTitleKey: "ms",
    facultyCode: "LAW",
    departmentCode: "PUBLIC_LAW",
    role: UserRole.STAFF,
    status: UserApprovalStatus.APPROVED
  }
];

function normalizeExtensions(value: string) {
  return value
    .split(",")
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean)
    .join(",");
}

async function main() {
  const facultyIdsByCode = new Map<string, string>();
  const departmentIdsByCode = new Map<string, string>();
  const academicTitleIdsByKey = new Map<string, string>();

  for (const faculty of faculties) {
    const record = await prisma.faculty.upsert({
      where: { code: faculty.code },
      update: {
        name: faculty.name,
        isActive: true
      },
      create: {
        code: faculty.code,
        name: faculty.name,
        isActive: true
      }
    });

    facultyIdsByCode.set(faculty.code, record.id);
  }

  for (const department of departments) {
    const facultyId = facultyIdsByCode.get(department.facultyCode);

    if (!facultyId) {
      throw new Error(`Missing faculty for department ${department.code}`);
    }

    const record = await prisma.department.upsert({
      where: { code: department.code },
      update: {
        facultyId,
        name: department.name,
        isActive: true
      },
      create: {
        code: department.code,
        name: department.name,
        facultyId,
        isActive: true
      }
    });

    departmentIdsByCode.set(department.code, record.id);
  }

  for (const academicYear of academicYears) {
    await prisma.academicYear.upsert({
      where: { label: academicYear.label },
      update: {
        startYear: academicYear.startYear,
        endYear: academicYear.endYear,
        sortOrder: academicYear.sortOrder,
        isActive: true
      },
      create: {
        label: academicYear.label,
        startYear: academicYear.startYear,
        endYear: academicYear.endYear,
        sortOrder: academicYear.sortOrder,
        isActive: true
      }
    });
  }

  for (const status of caseStatuses) {
    await prisma.caseStatusDefinition.upsert({
      where: { key: status.key },
      update: {
        label: status.label,
        sortOrder: status.sortOrder,
        isActive: true,
        description: null
      },
      create: {
        key: status.key,
        label: status.label,
        sortOrder: status.sortOrder,
        isActive: true,
        description: null
      }
    });
  }

  for (const option of selectOptions) {
    const record = await prisma.selectOption.upsert({
      where: {
        category_key: {
          category: option.category,
          key: option.key
        }
      },
      update: {
        label: option.label,
        sortOrder: option.sortOrder,
        isActive: true
      },
      create: {
        category: option.category,
        key: option.key,
        label: option.label,
        sortOrder: option.sortOrder,
        isActive: true
      }
    });

    if (option.category === SelectOptionCategory.ACADEMIC_TITLE) {
      academicTitleIdsByKey.set(option.key, record.id);
    }
  }

  await prisma.uploadSetting.upsert({
    where: { id: "default" },
    update: {
      maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 15),
      allowedExtensions: normalizeExtensions(process.env.ALLOWED_UPLOAD_EXTENSIONS ?? "pdf,doc,docx")
    },
    create: {
      id: "default",
      maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 15),
      allowedExtensions: normalizeExtensions(process.env.ALLOWED_UPLOAD_EXTENSIONS ?? "pdf,doc,docx")
    }
  });

  await prisma.reportSetting.upsert({
    where: { id: "default" },
    update: {
      summaryRowLimit: 12,
      showHostInstitutionSummary: true,
      showDocumentGapSummary: true
    },
    create: {
      id: "default",
      summaryRowLimit: 12,
      showHostInstitutionSummary: true,
      showDocumentGapSummary: true
    }
  });

  for (const user of users) {
    const { academicTitleKey, departmentCode, facultyCode, firstName, lastName, password, ...rest } = user;
    const passwordHash = await bcrypt.hash(password, 12);
    const academicTitleOptionId = academicTitleIdsByKey.get(academicTitleKey) ?? null;
    const facultyId = facultyIdsByCode.get(facultyCode) ?? null;
    const departmentId = departmentIdsByCode.get(departmentCode) ?? null;

    await prisma.user.upsert({
      where: { email: rest.email },
      update: {
        ...rest,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        passwordHash,
        academicTitleOptionId,
        facultyId,
        departmentId,
        reviewedAt: rest.status === UserApprovalStatus.APPROVED ? new Date() : null,
        reviewedById: null
      },
      create: {
        ...rest,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        passwordHash,
        academicTitleOptionId,
        facultyId,
        departmentId,
        reviewedAt: rest.status === UserApprovalStatus.APPROVED ? new Date() : null,
        reviewedById: null
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });