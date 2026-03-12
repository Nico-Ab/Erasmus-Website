import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authErrorCodes } from "@/lib/auth/error-codes";
import { LoginForm } from "@/components/auth/login-form";
import { createLoginInput } from "../factories/auth";
import { renderWithUser } from "../helpers/render";

const router = {
  push: vi.fn(),
  refresh: vi.fn()
};

const signInMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args)
}));

describe("LoginForm", () => {
  beforeEach(() => {
    signInMock.mockReset();
    router.push.mockReset();
    router.refresh.mockReset();
  });

  it("shows validation feedback before calling signIn", async () => {
    const { user } = renderWithUser(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("submits valid credentials and redirects to the dashboard", async () => {
    signInMock.mockResolvedValue({ error: undefined, code: undefined, url: "/dashboard" });
    const { user } = renderWithUser(<LoginForm />);
    const credentials = createLoginInput();

    await user.type(screen.getByLabelText(/email/i), credentials.email);
    await user.type(screen.getByLabelText(/password/i), credentials.password);
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
        redirectTo: "/dashboard"
      });
    });
    expect(router.push).toHaveBeenCalledWith("/dashboard");
    expect(router.refresh).toHaveBeenCalled();
  });

  it("routes pending users into the approval state screen", async () => {
    signInMock.mockResolvedValue({
      error: "CredentialsSignin",
      code: authErrorCodes.pendingApproval,
      url: null
    });
    const { user } = renderWithUser(<LoginForm />);
    const credentials = createLoginInput({ email: "pending.staff@swu.local" });

    await user.type(screen.getByLabelText(/email/i), credentials.email);
    await user.type(screen.getByLabelText(/password/i), credentials.password);
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(
        "/pending-approval?email=pending.staff%40swu.local"
      );
    });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows a form-level error when sign-in fails", async () => {
    signInMock.mockResolvedValue({
      error: "CredentialsSignin",
      code: authErrorCodes.invalidCredentials,
      url: null
    });
    const { user } = renderWithUser(<LoginForm />);
    const credentials = createLoginInput();

    await user.type(screen.getByLabelText(/email/i), credentials.email);
    await user.type(screen.getByLabelText(/password/i), credentials.password);
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/sign-in failed\. check your credentials or account approval status\./i)
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});