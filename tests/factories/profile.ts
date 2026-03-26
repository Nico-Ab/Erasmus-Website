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
        isLegacy: false,
        departments: [
          {
            id: "department_intl",
            code: "INTL_RELATIONS",
            name: "International Relations",
            facultyId: "faculty_econ",
            isLegacy: false
          }
        ]
      },
      {
        id: "faculty_law_history",
        code: "LAW_HISTORY",
        name: "Faculty of Law and History",
        isLegacy: false,
        departments: [
          {
            id: "department_public",
            code: "PUBLIC_LAW",
            name: "Public Law",
            facultyId: "faculty_law_history",
            isLegacy: false
          }
        ]
      }
    ],
    legacySelection: {
      hasLegacyFaculty: false,
      hasLegacyDepartment: false
    }
  };
}
