import type { LoginInput } from "@/lib/validation/auth";

export function createLoginInput(overrides: Partial<LoginInput> = {}): LoginInput {
  return {
    email: "staff@swu.local",
    password: "StaffPass123!",
    ...overrides
  };
}
