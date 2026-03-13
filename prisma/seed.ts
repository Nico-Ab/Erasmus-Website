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
  },
  {
    email: "pending@swu.local",
    password: "PendingPass123!",
    firstName: "Petar",
    lastName: "Markov",
    academicTitleKey: "mr",
    facultyCode: "ECON",
    departmentCode: "INTL_RELATIONS",
    role: UserRole.STAFF,
    status: UserApprovalStatus.PENDING
  },
  {
    email: "rejected@swu.local",
    password: "RejectedPass123!",
    firstName: "Raya",
    lastName: "Stoicheva",
    academicTitleKey: "ms",
    facultyCode: "LAW",
    departmentCode: "PUBLIC_LAW",
    role: UserRole.STAFF,
    status: UserApprovalStatus.REJECTED
  },
  {
    email: "deactivated@swu.local",
    password: "DeactivatedPass123!",
    firstName: "Georgi",
    lastName: "Velinov",
    academicTitleKey: "dr",
    facultyCode: "ECON",
    departmentCode: "INTL_RELATIONS",
    role: UserRole.STAFF,
    status: UserApprovalStatus.DEACTIVATED
  }
];

const demoCases = [
  {
    id: "seed-case-draft-staff",
    staffEmail: "staff@swu.local",
    academicYearLabel: "2025/2026",
    mobilityTypeKey: "teaching",
    hostInstitution: "Demo Draft: University of Graz",
    hostCountry: "Austria",
    hostCity: "Graz",
    startDate: new Date("2026-05-12T00:00:00Z"),
    endDate: new Date("2026-05-16T00:00:00Z"),
    notes: "Seeded draft case for staff dashboard and edit-flow demos.",
    statusKey: "draft",
    submittedAt: null
  },
  {
    id: "seed-case-submitted-staff2",
    staffEmail: "staff2@swu.local",
    academicYearLabel: "2025/2026",
    mobilityTypeKey: "training",
    hostInstitution: "Demo Review: KU Leuven",
    hostCountry: "Belgium",
    hostCity: "Leuven",
    startDate: new Date("2026-06-03T00:00:00Z"),
    endDate: new Date("2026-06-07T00:00:00Z"),
    notes: "Seeded submitted case for officer review, reporting, and search demos.",
    statusKey: "submitted",
    submittedAt: new Date("2026-02-14T09:00:00Z")
  }
];

const demoStatusHistory = [
  {
    id: "seed-case-draft-history-1",
    mobilityCaseId: "seed-case-draft-staff",
    fromStatusKey: null,
    toStatusKey: "draft",
    changedByEmail: "staff@swu.local",
    note: "Seeded draft case for local demo use."
  },
  {
    id: "seed-case-submitted-history-1",
    mobilityCaseId: "seed-case-submitted-staff2",
    fromStatusKey: null,
    toStatusKey: "draft",
    changedByEmail: "staff2@swu.local",
    note: "Seeded draft stage before submission."
  },
  {
    id: "seed-case-submitted-history-2",
    mobilityCaseId: "seed-case-submitted-staff2",
    fromStatusKey: "draft",
    toStatusKey: "submitted",
    changedByEmail: "staff2@swu.local",
    note: "Seeded submitted case for officer review and reporting demos."
  }
];

const demoComments = [
  {
    id: "seed-case-comment-1",
    mobilityCaseId: "seed-case-submitted-staff2",
    authorEmail: "officer@swu.local",
    body: "Demo case ready for review filtering, comments, and reporting walkthroughs."
  }
];

function normalizeExtensions(value: string) {
  return value
    .split(",")
    .map((extension) => extension.trim().toLowerCase())
    .filter(Boolean)
    .join(",");
}

function requiresReview(status: UserApprovalStatus) {
  return status !== UserApprovalStatus.PENDING;
}

async function main() {
  const facultyIdsByCode = new Map<string, string>();
  const departmentIdsByCode = new Map<string, string>();
  const academicTitleIdsByKey = new Map<string, string>();
  const academicYearIdsByLabel = new Map<string, string>();
  const caseStatusIdsByKey = new Map<string, string>();
  const mobilityTypeIdsByKey = new Map<string, string>();
  const userIdsByEmail = new Map<string, string>();

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
    const record = await prisma.academicYear.upsert({
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

    academicYearIdsByLabel.set(academicYear.label, record.id);
  }

  for (const status of caseStatuses) {
    const record = await prisma.caseStatusDefinition.upsert({
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

    caseStatusIdsByKey.set(status.key, record.id);
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

    if (option.category === SelectOptionCategory.MOBILITY_TYPE) {
      mobilityTypeIdsByKey.set(option.key, record.id);
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

  const adminSeed = users[0];
  const adminPasswordHash = await bcrypt.hash(adminSeed.password, 12);
  const adminRecord = await prisma.user.upsert({
    where: { email: adminSeed.email },
    update: {
      email: adminSeed.email,
      firstName: adminSeed.firstName,
      lastName: adminSeed.lastName,
      name: `${adminSeed.firstName} ${adminSeed.lastName}`,
      passwordHash: adminPasswordHash,
      role: adminSeed.role,
      status: adminSeed.status,
      academicTitleOptionId: academicTitleIdsByKey.get(adminSeed.academicTitleKey) ?? null,
      facultyId: facultyIdsByCode.get(adminSeed.facultyCode) ?? null,
      departmentId: departmentIdsByCode.get(adminSeed.departmentCode) ?? null,
      reviewedAt: new Date(),
      reviewedById: null
    },
    create: {
      email: adminSeed.email,
      firstName: adminSeed.firstName,
      lastName: adminSeed.lastName,
      name: `${adminSeed.firstName} ${adminSeed.lastName}`,
      passwordHash: adminPasswordHash,
      role: adminSeed.role,
      status: adminSeed.status,
      academicTitleOptionId: academicTitleIdsByKey.get(adminSeed.academicTitleKey) ?? null,
      facultyId: facultyIdsByCode.get(adminSeed.facultyCode) ?? null,
      departmentId: departmentIdsByCode.get(adminSeed.departmentCode) ?? null,
      reviewedAt: new Date(),
      reviewedById: null
    }
  });

  userIdsByEmail.set(adminSeed.email, adminRecord.id);

  for (const user of users.slice(1)) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        passwordHash,
        role: user.role,
        status: user.status,
        academicTitleOptionId: academicTitleIdsByKey.get(user.academicTitleKey) ?? null,
        facultyId: facultyIdsByCode.get(user.facultyCode) ?? null,
        departmentId: departmentIdsByCode.get(user.departmentCode) ?? null,
        reviewedAt: requiresReview(user.status) ? new Date() : null,
        reviewedById: requiresReview(user.status) ? adminRecord.id : null
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        passwordHash,
        role: user.role,
        status: user.status,
        academicTitleOptionId: academicTitleIdsByKey.get(user.academicTitleKey) ?? null,
        facultyId: facultyIdsByCode.get(user.facultyCode) ?? null,
        departmentId: departmentIdsByCode.get(user.departmentCode) ?? null,
        reviewedAt: requiresReview(user.status) ? new Date() : null,
        reviewedById: requiresReview(user.status) ? adminRecord.id : null
      }
    });

    userIdsByEmail.set(user.email, record.id);
  }

  for (const mobilityCase of demoCases) {
    const staffUserId = userIdsByEmail.get(mobilityCase.staffEmail);
    const academicYearId = academicYearIdsByLabel.get(mobilityCase.academicYearLabel);
    const mobilityTypeOptionId = mobilityTypeIdsByKey.get(mobilityCase.mobilityTypeKey);
    const statusDefinitionId = caseStatusIdsByKey.get(mobilityCase.statusKey);

    if (!staffUserId || !academicYearId || !mobilityTypeOptionId || !statusDefinitionId) {
      throw new Error(`Missing seeded relation for case ${mobilityCase.id}`);
    }

    await prisma.mobilityCase.upsert({
      where: { id: mobilityCase.id },
      update: {
        staffUserId,
        academicYearId,
        mobilityTypeOptionId,
        hostInstitution: mobilityCase.hostInstitution,
        hostCountry: mobilityCase.hostCountry,
        hostCity: mobilityCase.hostCity,
        startDate: mobilityCase.startDate,
        endDate: mobilityCase.endDate,
        notes: mobilityCase.notes,
        statusDefinitionId,
        submittedAt: mobilityCase.submittedAt
      },
      create: {
        id: mobilityCase.id,
        staffUserId,
        academicYearId,
        mobilityTypeOptionId,
        hostInstitution: mobilityCase.hostInstitution,
        hostCountry: mobilityCase.hostCountry,
        hostCity: mobilityCase.hostCity,
        startDate: mobilityCase.startDate,
        endDate: mobilityCase.endDate,
        notes: mobilityCase.notes,
        statusDefinitionId,
        submittedAt: mobilityCase.submittedAt
      }
    });
  }

  for (const entry of demoStatusHistory) {
    const changedByUserId = userIdsByEmail.get(entry.changedByEmail);
    const toStatusDefinitionId = caseStatusIdsByKey.get(entry.toStatusKey);
    const fromStatusDefinitionId = entry.fromStatusKey ? caseStatusIdsByKey.get(entry.fromStatusKey) ?? null : null;

    if (!changedByUserId || !toStatusDefinitionId) {
      throw new Error(`Missing seeded relation for case history ${entry.id}`);
    }

    await prisma.mobilityCaseStatusHistory.upsert({
      where: { id: entry.id },
      update: {
        mobilityCaseId: entry.mobilityCaseId,
        fromStatusDefinitionId,
        toStatusDefinitionId,
        changedByUserId,
        note: entry.note
      },
      create: {
        id: entry.id,
        mobilityCaseId: entry.mobilityCaseId,
        fromStatusDefinitionId,
        toStatusDefinitionId,
        changedByUserId,
        note: entry.note
      }
    });
  }

  for (const comment of demoComments) {
    const authorUserId = userIdsByEmail.get(comment.authorEmail);

    if (!authorUserId) {
      throw new Error(`Missing seeded author for comment ${comment.id}`);
    }

    await prisma.mobilityCaseComment.upsert({
      where: { id: comment.id },
      update: {
        mobilityCaseId: comment.mobilityCaseId,
        authorUserId,
        body: comment.body
      },
      create: {
        id: comment.id,
        mobilityCaseId: comment.mobilityCaseId,
        authorUserId,
        body: comment.body
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
