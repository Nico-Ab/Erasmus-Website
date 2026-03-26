import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/home/home-page";
import { renderWithUser } from "../helpers/render";

describe("HomePage", () => {
  it("renders the portal heading plus login and registration paths for anonymous users", () => {
    renderWithUser(<HomePage isAuthenticated={false} locale="en" />);

    expect(
      screen.getByRole("heading", {
        name: /swu erasmus staff mobility portal/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open login/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /register staff account/i })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getByRole("link", { name: /system status/i })).toHaveAttribute(
      "href",
      "/status"
    );
  });

  it("routes authenticated users toward the dashboard", () => {
    renderWithUser(<HomePage isAuthenticated locale="en" userName="Ivana Dimitrova" />);

    expect(screen.getByText(/signed in as ivana dimitrova/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });

  it("renders Bulgarian entry labels when the locale is switched", () => {
    renderWithUser(<HomePage isAuthenticated={false} locale="bg" />, { locale: "bg" });

    expect(
      screen.getByRole("heading", {
        name: /портал за мобилност на персонала по еразъм/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /отвори вход/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /регистрация на staff акаунт/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
