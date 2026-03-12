import { describe, expect, it } from "vitest";
import {
  academicYearSchema,
  departmentSchema,
  uploadSettingSchema
} from "@/lib/validation/master-data";
import { profileSchema } from "@/lib/validation/profile";
import { createProfileInput } from "../factories/profile";

describe("profileSchema", () => {
  it("trims names and email before submit", () => {
    const result = profileSchema.parse(
      createProfileInput({
        firstName: "  Elena  ",
        lastName: "  Petrova  ",
        email: "  staff@swu.local  "
      })
    );

    expect(result.firstName).toBe("Elena");
    expect(result.lastName).toBe("Petrova");
    expect(result.email).toBe("staff@swu.local");
  });

  it("requires a department selection", () => {
    const result = profileSchema.safeParse(createProfileInput({ departmentId: "" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Department is required");
  });
});

describe("academicYearSchema", () => {
  it("rejects labels that do not match the chosen years", () => {
    const result = academicYearSchema.safeParse({
      label: "2025/2027",
      startYear: 2025,
      endYear: 2026,
      sortOrder: 1,
      isActive: true
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Label must match the selected start and end years");
  });
});

describe("departmentSchema", () => {
  it("rejects lowercase department codes", () => {
    const result = departmentSchema.safeParse({
      facultyId: "faculty_econ",
      code: "intl_relations",
      name: "International Relations",
      isActive: true
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Use uppercase letters, numbers, hyphens, or underscores"
    );
  });
});

describe("uploadSettingSchema", () => {
  it("rejects extensions outside the environment allowlist", () => {
    const result = uploadSettingSchema.safeParse({
      maxUploadSizeMb: 10,
      allowedExtensions: "pdf,exe"
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("environment allowlist");
  });
});