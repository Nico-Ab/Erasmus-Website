import { describe, expect, it } from "vitest";
import {
  mobilityCaseDraftSchema,
  mobilityCaseSubmitSchema
} from "@/lib/validation/mobility-case";
import { createMobilityCaseFormValues } from "../factories/mobility-case";

describe("mobilityCaseDraftSchema", () => {
  it("allows incomplete drafts", () => {
    const result = mobilityCaseDraftSchema.safeParse(
      createMobilityCaseFormValues({
        academicYearId: "",
        mobilityTypeOptionId: "",
        hostInstitution: "",
        hostCountry: "",
        hostCity: "",
        startDate: "",
        endDate: ""
      })
    );

    expect(result.success).toBe(true);
  });

  it("rejects end dates earlier than the start date", () => {
    const result = mobilityCaseDraftSchema.safeParse(
      createMobilityCaseFormValues({
        startDate: "2026-05-10",
        endDate: "2026-05-02"
      })
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "End date must be the same as or later than the start date"
    );
  });
});

describe("mobilityCaseSubmitSchema", () => {
  it("requires all submission fields", () => {
    const result = mobilityCaseSubmitSchema.safeParse(
      createMobilityCaseFormValues({
        academicYearId: "",
        hostInstitution: "",
        endDate: ""
      })
    );

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.academicYearId?.[0]).toBe("Academic year is required");
    expect(result.error?.flatten().fieldErrors.hostInstitution?.[0]).toBe("Host institution is required");
    expect(result.error?.flatten().fieldErrors.endDate?.[0]).toBe("End date is required");
  });

  it("accepts complete valid submissions", () => {
    const result = mobilityCaseSubmitSchema.safeParse(createMobilityCaseFormValues());

    expect(result.success).toBe(true);
  });
});