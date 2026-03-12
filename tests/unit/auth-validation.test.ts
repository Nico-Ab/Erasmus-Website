import { describe, expect, it } from "vitest";
import { loginSchema, registrationSchema } from "@/lib/validation/auth";
import { createLoginInput, createRegistrationInput } from "../factories/auth";

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

describe("registrationSchema", () => {
  it("trims names and email before submit", () => {
    const result = registrationSchema.parse(
      createRegistrationInput({
        firstName: "  Elena  ",
        lastName: "  Petrova  ",
        email: "  new.staff@swu.local  "
      })
    );

    expect(result.firstName).toBe("Elena");
    expect(result.lastName).toBe("Petrova");
    expect(result.email).toBe("new.staff@swu.local");
  });

  it("rejects password confirmation mismatches", () => {
    const result = registrationSchema.safeParse(
      createRegistrationInput({ confirmPassword: "DifferentPass123!" })
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Passwords must match");
  });

  it("rejects passwords shorter than twelve characters", () => {
    const result = registrationSchema.safeParse(
      createRegistrationInput({
        password: "Short123!",
        confirmPassword: "Short123!"
      })
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Password must be at least 12 characters");
  });
});