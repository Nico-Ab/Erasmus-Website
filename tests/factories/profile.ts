import type { ProfileInput } from "@/lib/validation/profile";

export function createProfileInput(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    firstName: "Elena",
    lastName: "Petrova",
    email: "staff@swu.local",
    academicTitleOptionId: "title_dr",
    facultyId: "faculty_econ",
    departmentId: "department_intl",
    ...overrides
  };
}

export function createProfileReferenceData() {
  return {
    academicTitleOptions: [
      { id: "title_mr", key: "mr", label: "Mr." },
      { id: "title_dr", key: "dr", label: "Dr." }
    ],
    faculties: [
      {
        id: "faculty_econ",
        code: "ECON",
        name: "Faculty of Economics",
        departments: [
          {
            id: "department_intl",
            code: "INTL_RELATIONS",
            name: "International Relations",
            facultyId: "faculty_econ"
          }
        ]
      },
      {
        id: "faculty_law",
        code: "LAW",
        name: "Faculty of Law",
        departments: [
          {
            id: "department_public",
            code: "PUBLIC_LAW",
            name: "Public Law",
            facultyId: "faculty_law"
          }
        ]
      }
    ]
  };
}