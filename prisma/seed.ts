import bcrypt from "bcryptjs";
import { PrismaClient, UserApprovalStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    email: "staff@swu.local",
    password: "StaffPass123!",
    name: "Elena Petrova",
    firstName: "Elena",
    lastName: "Petrova",
    academicTitle: "Dr.",
    faculty: "Faculty of Economics",
    department: "International Relations",
    role: UserRole.STAFF,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "officer@swu.local",
    password: "OfficerPass123!",
    name: "Milan Georgiev",
    firstName: "Milan",
    lastName: "Georgiev",
    academicTitle: "Mr.",
    faculty: "Rectorate",
    department: "Erasmus Office",
    role: UserRole.OFFICER,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "admin@swu.local",
    password: "AdminPass123!",
    name: "Ivana Dimitrova",
    firstName: "Ivana",
    lastName: "Dimitrova",
    academicTitle: "Ms.",
    faculty: "Rectorate",
    department: "Systems Administration",
    role: UserRole.ADMIN,
    status: UserApprovalStatus.APPROVED
  },
  {
    email: "pending@swu.local",
    password: "PendingPass123!",
    name: "Pending Applicant",
    firstName: "Pending",
    lastName: "Applicant",
    role: UserRole.STAFF,
    status: UserApprovalStatus.PENDING
  }
];

async function main() {
  for (const user of users) {
    const { password, ...profile } = user;
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.upsert({
      where: { email: profile.email },
      update: {
        ...profile,
        passwordHash
      },
      create: {
        ...profile,
        passwordHash
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
