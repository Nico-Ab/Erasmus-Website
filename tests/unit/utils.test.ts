import { describe, expect, it } from "vitest";
import { cn, formatRoleLabel, formatStatusLabel } from "@/lib/utils";

describe("formatRoleLabel", () => {
  it("creates a title-like label from enum-style role values", () => {
    expect(formatRoleLabel("ADMIN")).toBe("Admin");
    expect(formatRoleLabel("STAFF")).toBe("Staff");
  });
});

describe("formatStatusLabel", () => {
  it("converts underscored status values to readable labels", () => {
    expect(formatStatusLabel("CHANGES_REQUIRED")).toBe("Changes Required");
    expect(formatStatusLabel("APPROVED")).toBe("Approved");
  });
});

describe("cn", () => {
  it("keeps the last conflicting utility class", () => {
    const result = cn("px-2", "px-4");

    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });
});
