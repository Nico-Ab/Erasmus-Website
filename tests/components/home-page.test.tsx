import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/components/home/home-page";

describe("HomePage", () => {
  it("renders the portal heading and login path for anonymous users", () => {
    render(<HomePage isAuthenticated={false} />);

    expect(
      screen.getByRole("heading", {
        name: /erasmus staff mobility management with a formal institutional shell/i
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open login/i })).toHaveAttribute("href", "/login");
  });
});
