import type { MobilityCaseFormValues } from "@/lib/validation/mobility-case";

export function createMobilityCaseFormValues(
  overrides: Partial<MobilityCaseFormValues> = {}
): MobilityCaseFormValues {
  return {
    academicYearId: "academic_year_2025",
    mobilityTypeOptionId: "mobility_type_teaching",
    hostInstitution: "University of Graz",
    hostCountry: "Austria",
    hostCity: "Graz",
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    notes: "Teaching mobility focus.",
    ...overrides
  };
}

export function createMobilityCaseReferenceData() {
  return {
    academicYears: [
      { id: "academic_year_2025", label: "2025/2026" },
      { id: "academic_year_2026", label: "2026/2027" }
    ],
    mobilityTypes: [
      { id: "mobility_type_teaching", key: "teaching", label: "Teaching" },
      { id: "mobility_type_training", key: "training", label: "Training" }
    ]
  };
}