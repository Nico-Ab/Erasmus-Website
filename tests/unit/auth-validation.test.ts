import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation/auth";
import { createLoginInput } from "../factories/auth";

describe("loginSchema", () => {
  it("trims whitespace around email addresses", () => {
    const result = loginSchema.parse(createLoginInput({ email: "  staff@swu.local  " }));

    expect(result.email).toBe("staff@swu.local");
  });

  it("rejects invalid email addresses", () => {
    const result = loginSchema.safeParse(createLoginInput({ email: "invalid-email" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Enter a valid email address");
  });

  it("rejects passwords shorter than eight characters", () => {
    const result = loginSchema.safeParse(createLoginInput({ password: "short" }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Password must be at least 8 characters");
  });
});
