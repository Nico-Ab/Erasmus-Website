import type { LoginInput, RegistrationInput } from "@/lib/validation/auth";

export function createLoginInput(overrides: Partial<LoginInput> = {}): LoginInput {
  return {
    email: "staff@swu.local",
    password: "StaffPass123!",
    ...overrides
  };
}

export function createRegistrationInput(
  overrides: Partial<RegistrationInput> = {}
): RegistrationInput {
  return {
    firstName: "Elena",
    lastName: "Petrova",
    email: "new.staff@swu.local",
    password: "NewStaffPass123!",
    confirmPassword: "NewStaffPass123!",
    ...overrides
  };
}