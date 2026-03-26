import { describe, expect, it } from "vitest";
import { resolveAppLocale } from "@/lib/i18n/config";
import {
  formatApprovalStatusLabel,
  formatCaseStatusLabel,
  formatDate,
  formatDocumentReviewLabel,
  formatRoleLabel
} from "@/lib/i18n/format";

describe("i18n formatting", () => {
  it("resolves supported locales and falls back to english", () => {
    expect(resolveAppLocale("bg")).toBe("bg");
    expect(resolveAppLocale("en")).toBe("en");
    expect(resolveAppLocale("de")).toBe("en");
  });

  it("formats shared labels in Bulgarian", () => {
    expect(formatRoleLabel("ADMIN", "bg")).toBe("Admin");
    expect(formatApprovalStatusLabel("PENDING", "bg")).toBe("Изчаква");
    expect(formatCaseStatusLabel("changes_required", "Changes required", "bg")).toBe(
      "Изискват се корекции"
    );
    expect(formatDocumentReviewLabel("REJECTED", "Rejected", "bg")).toBe("Отхвърлен");
  });

  it("formats dates with the configured locale", () => {
    expect(formatDate(new Date("2026-06-10T00:00:00.000Z"), "en")).toMatch(/10/);
    expect(formatDate(new Date("2026-06-10T00:00:00.000Z"), "bg")).toMatch(/10/);
  });
});
