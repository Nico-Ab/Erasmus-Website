import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";
import { createRegistrationInput } from "../factories/auth";
import { renderWithUser } from "../helpers/render";

const fetchMock = vi.fn();
const { assignMock } = vi.hoisted(() => ({
  assignMock: vi.fn()
}));

vi.mock("@/lib/auth/client-navigation", () => ({
  redirectToPendingApproval: assignMock
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    assignMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows validation feedback before calling the registration endpoint", async () => {
    const { user } = renderWithUser(<RegisterForm />);

    await user.click(await screen.findByRole("button", { name: /submit registration/i }));

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
    await user.click(await screen.findByRole("button", { name: /submit registration/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registration)
      });
    });
    expect(assignMock).toHaveBeenCalledWith({
      email: "new.staff@swu.local",
      registered: true
    });
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
    await user.click(await screen.findByRole("button", { name: /submit registration/i }));

    expect(
      await screen.findByText(/an account with this email already exists\./i)
    ).toBeInTheDocument();
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("shows a fallback error when the registration request fails before a response is returned", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const { user } = renderWithUser(<RegisterForm />);
    const registration = createRegistrationInput();

    await user.type(screen.getByLabelText(/first name/i), registration.firstName);
    await user.type(screen.getByLabelText(/last name/i), registration.lastName);
    await user.type(screen.getByLabelText(/^email$/i), registration.email);
    await user.type(screen.getByLabelText(/^password$/i), registration.password);
    await user.type(screen.getByLabelText(/confirm password/i), registration.confirmPassword);
    await user.click(await screen.findByRole("button", { name: /submit registration/i }));

    expect(
      await screen.findByText(/the registration request could not be completed\./i)
    ).toBeInTheDocument();
    expect(assignMock).not.toHaveBeenCalled();
  });

  it("renders Bulgarian registration labels when the locale is switched", async () => {
    renderWithUser(<RegisterForm />, { locale: "bg" });

    expect(await screen.findByText(/регистрация на staff/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^име$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /изпрати регистрация/i })).toBeInTheDocument();
  });
});
