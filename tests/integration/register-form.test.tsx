import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";
import { createRegistrationInput } from "../factories/auth";
import { renderWithUser } from "../helpers/render";

const router = {
  push: vi.fn(),
  refresh: vi.fn()
};

const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => router
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    router.push.mockReset();
    router.refresh.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows validation feedback before calling the registration endpoint", async () => {
    const { user } = renderWithUser(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(await screen.findByText("Last name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits a valid registration and routes into the pending approval page", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ email: "new.staff@swu.local" }), {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const { user } = renderWithUser(<RegisterForm />);
    const registration = createRegistrationInput();

    await user.type(screen.getByLabelText(/first name/i), registration.firstName);
    await user.type(screen.getByLabelText(/last name/i), registration.lastName);
    await user.type(screen.getByLabelText(/^email$/i), registration.email);
    await user.type(screen.getByLabelText(/^password$/i), registration.password);
    await user.type(screen.getByLabelText(/confirm password/i), registration.confirmPassword);
    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registration)
      });
    });
    expect(router.push).toHaveBeenCalledWith(
      "/pending-approval?email=new.staff%40swu.local&registered=1"
    );
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows a duplicate-email error returned by the registration endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "An account with this email already exists." }), {
        status: 409,
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const { user } = renderWithUser(<RegisterForm />);
    const registration = createRegistrationInput();

    await user.type(screen.getByLabelText(/first name/i), registration.firstName);
    await user.type(screen.getByLabelText(/last name/i), registration.lastName);
    await user.type(screen.getByLabelText(/^email$/i), registration.email);
    await user.type(screen.getByLabelText(/^password$/i), registration.password);
    await user.type(screen.getByLabelText(/confirm password/i), registration.confirmPassword);
    await user.click(screen.getByRole("button", { name: /submit registration/i }));

    expect(
      await screen.findByText(/an account with this email already exists\./i)
    ).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});