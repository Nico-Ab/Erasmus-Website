import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/home/home-page";
import { renderWithUser } from "../helpers/render";

describe("HomePage", () => {
  it("renders the portal heading and login path for anonymous users", () => {
    renderWithUser(<HomePage isAuthenticated={false} />);

    expect(
      screen.getByRole("heading", {
        name: /erasmus staff mobility management with a formal institutional shell/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open login/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /review local status/i })).toHaveAttribute(
      "href",
      "/status"
    );
  });

  it("routes authenticated users toward the dashboard", () => {
    renderWithUser(<HomePage isAuthenticated userName="Ivana Dimitrova" />);

    expect(screen.getByText(/signed in as ivana dimitrova/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});
